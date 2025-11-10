import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// 动态导入TypeScript编译器用于AST解析
let ts;
try {
  ts = await import('typescript');
  ts = ts.default || ts;
} catch (e) {
  console.error('无法导入 typescript，请先安装: pnpm add -D typescript');
  process.exit(1);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../src');
const LOCALES_ZH_CN_DIR = path.resolve(__dirname, '../src/locales/lang/zh-CN');

const DEFAULT_OPTIONS = {
  dryRun: false,
  includeTemplates: true, // 处理 .vue 的 template 部分
  exts: ['.ts', '.tsx', '.vue'],
  dirs: null, // string[] 相对 src/ 的目录前缀，如 ['CCFast']
};

function containsChinese(text) {
  return /[\u4e00-\u9fff]/.test(text);
}

function isExcludedFile(absPath) {
  // 排除 locales 目录
  return absPath.includes(`${path.sep}src${path.sep}locales${path.sep}`);
}

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // 跳过 node_modules 与隐藏目录
      if (entry.name === 'node_modules' || entry.name.startsWith('.')) continue;
      yield* walk(abs);
    } else {
      yield abs;
    }
  }
}

function getRelFromSrc(absPath) {
  return path.relative(SRC_DIR, absPath).replace(/\\/g, '/');
}

function computeKeyPrefix(relPath) {
  // 根据文件路径生成 key 前缀
  // 规则：
  // 1) 以 src/ 为基准
  // 2) 如果第一段是 App，则使用第二段作为分组文件名；否则使用第一段
  // 3) key 前缀为 `${group}.${...nestedSegments}.${fileBase}`（全部小写）
  const parts = relPath.split('/');
  const noExt = parts[parts.length - 1].replace(/\.[^.]+$/, '');

  let groupIdx = 0;
  if ((parts[0] || '').toLowerCase() === 'app') {
    groupIdx = 1;
  } else {
    groupIdx = 0;
  }

  const group = (parts[groupIdx] || '').toLowerCase();
  const pathAfterGroup = parts.slice(groupIdx + 1, parts.length - 1).map((p) => p.toLowerCase());
  const fileKey = noExt.toLowerCase();

  const prefixParts = [group, ...pathAfterGroup, fileKey].filter(Boolean);
  const prefix = prefixParts.join('.');

  return { group, prefix, nestedPath: prefixParts.slice(1) }; // nestedPath 不含 group
}

function isInImportLike(node, parent) {
  if (!parent) return false;
  // import "xx";  或  import x from "xx";  export * from "xx";
  if (ts.isImportDeclaration(parent) || ts.isExportDeclaration(parent)) {
    return true;
  }
  // 属性名： { '中文': 'xx' } 的 key，不替换
  if (ts.isPropertyAssignment(parent) && parent.name === node) {
    return true;
  }
  // 类似对象字面量简写的键名 (不可能是 StringLiteral，但保留)
  return false;
}

function isAlreadyTranslated(node) {
  const parent = node.parent;
  if (ts.isCallExpression(parent)) {
    const expr = parent.expression;
    if (ts.isIdentifier(expr) && (expr.text === 't' || expr.text === 'translateText')) {
      return true;
    }
  }
  return false;
}

function collectChineseStringNodes(sourceFile) {
  const nodes = [];
  function visit(n) {
    if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) {
      const text = n.text;
      if (containsChinese(text) && !isInImportLike(n, n.parent) && !isAlreadyTranslated(n)) {
        nodes.push(n);
      }
    }
    ts.forEachChild(n, visit);
  }
  visit(sourceFile);
  return nodes;
}

function applyReplacements(original, replacements) {
  // replacements: [{ start, end, text }], 按 start 降序替换
  const sorted = [...replacements].sort((a, b) => b.start - a.start);
  let out = original;
  for (const r of sorted) {
    out = out.slice(0, r.start) + r.text + out.slice(r.end);
  }
  return out;
}

function buildNestedObject(target, pathArr, leafObject) {
  // 将 leafObject 合并到 target 的 pathArr 路径上
  let cur = target;
  for (const seg of pathArr) {
    if (!cur[seg]) cur[seg] = {};
    cur = cur[seg];
  }
  Object.assign(cur, leafObject);
}

function serializeLocaleObject(obj) {
  // 稳定序列化，按 key 字典序
  function sortObj(o) {
    if (Array.isArray(o)) return o.map(sortObj);
    if (o && typeof o === 'object') {
      const out = {};
      for (const k of Object.keys(o).sort()) {
        out[k] = sortObj(o[k]);
      }
      return out;
    }
    return o;
  }
  const sorted = sortObj(obj);
  return `export default ${JSON.stringify(sorted, null, 2)}\n`;
}

function isEnumOptionString(text) {
  // 业务里的“@n=中文@m=中文”格式（n/m 允许负号）
  return typeof text === 'string' && /@-?\d+=/.test(text);
}

function toLiteralIfEnum(text) {
  if (!isEnumOptionString(text)) return text;
  // 使用 Literal interpolation 包裹，避免 vue-i18n 将 @ 解析为 linked 语法
  // 需要将单引号转义
  const escaped = String(text).replace(/'/g, "\\'");
  return `{\'${escaped}\'}`;
}

async function readExistingLocale(group) {
  const filePath = path.join(LOCALES_ZH_CN_DIR, `${group}.ts`);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    // 解析 export default {...}
    const match = content.match(/export\s+default\s+([\s\S]*);?\s*$/);
    if (!match) return {};
    const objLiteral = match[1];
    // 使用 Function 安全解析（在受限上下文内），仅支持对象字面量
    // eslint-disable-next-line no-new-func
    const parsed = Function(`"use strict"; return (${objLiteral});`)();
    if (parsed && typeof parsed === 'object') return parsed;
    return {};
  } catch (e) {
    return {};
  }
}

async function writeLocale(group, localeObj) {
  await fs.mkdir(LOCALES_ZH_CN_DIR, { recursive: true });
  const filePath = path.join(LOCALES_ZH_CN_DIR, `${group}.ts`);
  const code = serializeLocaleObject(localeObj);
  await fs.writeFile(filePath, code, 'utf-8');
  return filePath;
}

function ensureImportForTranslateText(code) {
  // 检测是否已存在从 /@/locales/setupI18n 导入 translateText
  if (code.includes("from '/@/locales/setupI18n'") || code.includes('from "/@/locales/setupI18n"')) {
    if (code.match(/\{\s*translateText\s*\}/)) return code; // 已有命名导入
  }
  // 确保在开头插入时，import 与脚本标签之间有换行
  const prefixNewline = code.startsWith('\n') ? '' : '\n';
  const importLine = `${prefixNewline}import { translateText } from '/@/locales/setupI18n';\n`;
  // 将 import 插入到首个 import 之前；若无 import，则加到文件开头
  const importRegex = /(^|\n)\s*import\s[^;]+;?/g;
  const m = importRegex.exec(code);
  if (m) {
    return code.slice(0, m.index) + importLine + code.slice(m.index);
  }
  return importLine + code;
}

async function processTsLikeFile(absPath, options, report) {
  const rel = getRelFromSrc(absPath);
  const { group, prefix, nestedPath } = computeKeyPrefix(rel);
  let content = await fs.readFile(absPath, 'utf-8');

  const sourceFile = ts.createSourceFile(absPath, content, ts.ScriptTarget.ESNext, true);
  const nodes = collectChineseStringNodes(sourceFile);
  if (nodes.length === 0) return; // 无需修改

  const replacements = [];
  const created = [];
  const perFileIndex = new Map(); // value: next idx

  function nextIdx() {
    const cur = perFileIndex.get('idx') || 1;
    perFileIndex.set('idx', cur + 1);
    return cur;
  }

  for (const n of nodes) {
    const idx = nextIdx();
    const key = `${prefix}._key${idx}`;
    const start = n.getStart();
    const end = n.getEnd();
    replacements.push({ start, end, text: `translateText('${key}')` });
    created.push({ key, text: toLiteralIfEnum(n.text) });
  }

  if (replacements.length === 0) return;

  // 写入/合并 zh-CN 语言文件
  const existing = await readExistingLocale(group);
  const merged = { ...existing };
  // 在 merged 下构建嵌套路径（不包含 group 本身）
  const leaf = {};
  for (const item of created) {
    // 仅 leaf 层：_keyX: 原文（如命中枚举串，写成 Literal）
    leaf[item.key.split('.').slice(-1)[0]] = item.text;
  }
  buildNestedObject(merged, nestedPath, leaf);

  if (!options.dryRun) {
    await writeLocale(group, merged);
  }

  // 源码替换
  let newContent = applyReplacements(content, replacements);
  newContent = ensureImportForTranslateText(newContent, false);

  if (!options.dryRun) {
    await fs.writeFile(absPath, newContent, 'utf-8');
  }

  report.files.push({ file: rel, count: created.length, group, prefix });
  report.added.push(...created.map((c) => ({ ...c, group })));
}

function extractVueScript(code) {
  // 提取首个 <script> 或 <script setup> 块
  const re = /<script(\s+setup)?[^>]*>([\s\S]*?)<\/script>/i;
  const m = code.match(re);
  if (!m) return null;
  return { fullMatch: m[0], setup: !!m[1], content: m[2], index: m.index, length: m[0].length };
}

function extractTemplate(code) {
  // 解析最外层 <template> ... </template>，支持嵌套 <template>
  // 修复：避免全局正则的 lastIndex 状态影响
  const firstOpen = /<template\b[^>]*>/g.exec(code);
  if (!firstOpen) return null;

  let depth = 1;
  let searchPos = firstOpen.index + firstOpen[0].length;
  let lastIdx = searchPos;

  while (depth > 0) {
    // 每次都创建新的正则对象避免 lastIndex 问题
    const openRe = /<template\b[^>]*>/g;
    const closeRe = /<\/template>/g;

    // 从当前搜索位置开始
    openRe.lastIndex = searchPos;
    closeRe.lastIndex = searchPos;

    const nextOpen = openRe.exec(code);
    const nextClose = closeRe.exec(code);

    if (!nextClose) break; // 不完整，放弃
    if (nextOpen && nextOpen.index < nextClose.index) {
      depth++;
      lastIdx = nextOpen.index + nextOpen[0].length;
      searchPos = lastIdx;
    } else {
      depth--;
      lastIdx = nextClose.index + nextClose[0].length;
      searchPos = lastIdx;
    }
  }
  if (depth !== 0) return null; // 未正常闭合
  const start = firstOpen.index;
  const end = lastIdx;
  const fullMatch = code.slice(start, end);
  // 提取内层内容范围
  const innerStart = start + firstOpen[0].length;
  const innerEnd = end - '</template>'.length;
  const content = code.slice(innerStart, innerEnd);
  return { fullMatch, content, index: start, length: end - start, innerStart, innerEnd };
}

function buildTemplateReplacements(tpl, prefix, nestedPath, nextIdx) {
  const replacements = [];
  const created = [];

  // 1) 属性值：任意静态属性（非 :prop / v-bind / 指令 / 事件），且值中含中文 -> :attr="$tt('key')"
  // 排除 class/style/src/href 以避免无意义或破坏行为
  const attrRe = /(\s)([A-Za-z_][-A-Za-z0-9_]*)(=)("([^"]*[\u4e00-\u9fff][^"]*)"|'([^']*[\u4e00-\u9fff][^']*)')/g;
  let ma;
  while ((ma = attrRe.exec(tpl)) !== null) {
    const leadingSpace = ma[1];
    const attrName = ma[2];
    const _eq = ma[3];
    const attrFull = ma[0];
    const attrIndex = ma.index;
    const val = ma[5] ?? ma[6] ?? '';

    const lower = attrName.toLowerCase();
    if (lower === 'class' || lower === 'style' || lower === 'src' || lower === 'href') continue;
    if (attrName.startsWith('@') || attrName.startsWith('v-') || attrName.startsWith(':')) continue;

    const idx = nextIdx();
    const key = `${prefix}._key${idx}`;
    const rep = `${leadingSpace}:${attrName}="$tt('${key}')"`;
    replacements.push({ start: attrIndex, end: attrIndex + attrFull.length, text: rep });
    created.push({ key, text: val });
  }

  // 1.2) 动态绑定但值是纯字符串字面量：:attr="'中文'" 或 :attr="\"中文\""
  // 仅当表达式是单纯字面量，不包含拼接/变量/调用
  const dynLiteralRe = /(\s):([A-Za-z_][-A-Za-z0-9_]*)(=)\s*("([^"]*[\u4e00-\u9fff][^"]*)"|'([^']*[\u4e00-\u9fff][^']*)')/g;
  let md;
  while ((md = dynLiteralRe.exec(tpl)) !== null) {
    const leadingSpace = md[1];
    const attrName = md[2];
    const _eq = md[3];
    const attrFull = md[0];
    const attrIndex = md.index;
    const val = md[5] ?? md[6] ?? '';

    // 排除 class/style/src/href 之类
    const lower = attrName.toLowerCase();
    if (lower === 'class' || lower === 'style' || lower === 'src' || lower === 'href') continue;

    const idx = nextIdx();
    const key = `${prefix}._key${idx}`;
    const rep = `${leadingSpace}:${attrName}="$tt('${key}')"`;
    replacements.push({ start: attrIndex, end: attrIndex + attrFull.length, text: rep });
    created.push({ key, text: val });
  }

  // 2) 文本节点：仅处理标签之间的纯文本内容
  // 严格匹配：> 和下个 < 之间的内容，且不能是标签的一部分
  let currentPos = 0;
  while (currentPos < tpl.length) {
    // 找到下一个 >
    const gtPos = tpl.indexOf('>', currentPos);
    if (gtPos === -1) break;

    // 找到这个 > 后面的下一个 <
    const ltPos = tpl.indexOf('<', gtPos + 1);
    if (ltPos === -1) break;

    const textContent = tpl.slice(gtPos + 1, ltPos);

    // 只处理包含中文且不为空的纯文本内容
    // 必须是标签间的纯文本，不能包含任何代码片段
    if (
      textContent.trim() &&
      containsChinese(textContent) &&
      !/^\s*$/.test(textContent) && // 不是纯空白
      !textContent.includes('{{') && // 不包含Vue表达式
      !textContent.includes('v-') && // 不包含Vue指令
      !textContent.includes(':') && // 不包含属性绑定
      !textContent.includes('@') && // 不包含事件绑定
      !/[=]/.test(textContent) && // 不包含赋值表达式
      !textContent.includes('[') && // 不包含数组语法
      !textContent.includes(']') && // 不包含数组语法
      !textContent.includes('(') && // 不包含函数调用
      !textContent.includes(')') && // 不包含函数调用
      !textContent.includes('"') && // 不包含引号（可能是属性值）
      !textContent.includes("'") && // 不包含单引号
      !textContent.includes('.') && // 不包含对象属性访问
      !/>\s*$/.test(textContent)
    ) {
      // 不以 > 结尾（标签一部分）

      const idx = nextIdx();
      const key = `${prefix}._key${idx}`;
      const replacement = `{{$tt('${key}')}}`;

      replacements.push({
        start: gtPos + 1,
        end: ltPos,
        text: replacement,
      });
      created.push({ key, text: textContent.trim() });
    }

    currentPos = ltPos + 1;
  }

  return { replacements, created };
}

async function processVueFile(absPath, options, report) {
  const rel = getRelFromSrc(absPath);
  const { group, prefix, nestedPath } = computeKeyPrefix(rel);
  let content = await fs.readFile(absPath, 'utf-8');

  const perFileIndex = new Map();
  function nextIdx() {
    const cur = perFileIndex.get('idx') || 1;
    perFileIndex.set('idx', cur + 1);
    return cur;
  }

  let totalCreated = [];
  let newContent = content;

  // 先处理 <script>
  const block = extractVueScript(content);
  if (block) {
    const sf = ts.createSourceFile(absPath, block.content, ts.ScriptTarget.ESNext, true);
    const nodes = collectChineseStringNodes(sf);
    if (nodes.length > 0) {
      const replacements = [];
      const created = [];
      for (const n of nodes) {
        const idx = nextIdx();
        const key = `${prefix}._key${idx}`;
        replacements.push({ start: n.getStart(), end: n.getEnd(), text: `translateText('${key}')` });
        created.push({ key, text: toLiteralIfEnum(n.text) });
      }
      // 合并语言
      const existing = await readExistingLocale(group);
      const merged = { ...existing };
      const leaf = {};
      for (const item of created) {
        leaf[item.key.split('.').slice(-1)[0]] = item.text;
      }
      if (Object.keys(leaf).length) buildNestedObject(merged, nestedPath, leaf);
      if (!options.dryRun && Object.keys(leaf).length) await writeLocale(group, merged);

      // 替换脚本块
      let newScript = applyReplacements(block.content, replacements);
      newScript = ensureImportForTranslateText(newScript);
      // 仅替换脚本内容，保留原有 <script ...> 标签属性
      const innerStart = block.index + block.fullMatch.indexOf(block.content);
      const innerEnd = innerStart + block.content.length;
      newContent = newContent.slice(0, innerStart) + newScript + newContent.slice(innerEnd);

      totalCreated.push(...created);
    }
  }

  // 再处理 <template>
  if (options.includeTemplates) {
    const tplBlock = extractTemplate(newContent);
    if (tplBlock) {
      const { replacements: tplRepls, created: tplCreated } = buildTemplateReplacements(tplBlock.content, prefix, nestedPath, nextIdx);
      if (tplRepls.length > 0) {
        // 合并语言
        const existing2 = await readExistingLocale(group);
        const merged2 = { ...existing2 };
        const leaf2 = {};
        for (const item of tplCreated) {
          leaf2[item.key.split('.').slice(-1)[0]] = item.text;
        }
        if (Object.keys(leaf2).length) buildNestedObject(merged2, nestedPath, leaf2);
        if (!options.dryRun && Object.keys(leaf2).length) await writeLocale(group, merged2);

        const newTpl = applyReplacements(tplBlock.content, tplRepls);
        // 仅替换模板内容，保留原有 <template ...> 标签属性
        const tplInnerStart = tplBlock.innerStart;
        const tplInnerEnd = tplBlock.innerEnd;
        newContent = newContent.slice(0, tplInnerStart) + newTpl + newContent.slice(tplInnerEnd);

        totalCreated.push(...tplCreated);
      }
    }
  }

  if (totalCreated.length > 0) {
    if (!options.dryRun) {
      await fs.writeFile(absPath, newContent, 'utf-8');
    }
    report.files.push({ file: rel, count: totalCreated.length, group, prefix });
    report.added.push(...totalCreated.map((c) => ({ ...c, group })));
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options = { ...DEFAULT_OPTIONS };
  if (args.includes('--dry-run')) options.dryRun = true;
  if (args.includes('--include-templates')) options.includeTemplates = true;
  // 解析 --dirs 参数，支持逗号分隔多个目录，如 --dirs CCFast,bp
  const dirsIdx = args.findIndex((a) => a === '--dirs');
  if (dirsIdx !== -1 && args[dirsIdx + 1]) {
    options.dirs = args[dirsIdx + 1]
      .split(',')
      .map((s) => s.trim().replace(/^\/+|\/+$/g, ''))
      .filter(Boolean);
  }

  const report = { files: [], added: [] };

  for await (const abs of walk(SRC_DIR)) {
    if (isExcludedFile(abs)) continue;
    const ext = path.extname(abs).toLowerCase();
    if (!DEFAULT_OPTIONS.exts.includes(ext)) continue;
    const rel = getRelFromSrc(abs);
    if (options.dirs && !options.dirs.some((d) => rel.startsWith(d + '/'))) {
      continue;
    }

    try {
      if (ext === '.vue') {
        await processVueFile(abs, options, report);
      } else {
        await processTsLikeFile(abs, options, report);
      }
    } catch (e) {
      console.warn(`处理文件失败: ${getRelFromSrc(abs)} => ${e.message}`);
    }
  }

  // 输出报告
  console.log(`\n[ccbpm-i18n] 处理完成：`);
  console.log(`- 修改文件数: ${report.files.length}`);
  let total = 0;
  for (const f of report.files) total += f.count;
  console.log(`- 替换中文条目: ${total}`);

  if (report.files.length) {
    console.log(`\n[ccbpm-i18n] 文件明细（前10条）：`);
    report.files.slice(0, 10).forEach((f, i) => {
      console.log(`${i + 1}. ${f.file} -> ${f.prefix} (${f.count})`);
    });
    if (report.files.length > 10) {
      console.log(`... 还有 ${report.files.length - 10} 个文件`);
    }
  }

  if (options.dryRun) {
    console.log('\n[ccbpm-i18n] 当前为预览模式（未写入文件与源码）。使用不带 --dry-run 的命令执行实际替换。');
  } else {
    console.log('\n[ccbpm-i18n] 已写入 zh-CN 语言文件并完成源码替换。');
  }
}

main().catch((e) => {
  console.error('执行出错:', e);
  process.exit(1);
});
