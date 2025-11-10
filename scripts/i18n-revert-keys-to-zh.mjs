import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, '../src');
const LOCALES_ZH_CN_DIR = path.resolve(__dirname, '../src/locales/lang/zh-CN');

const DEFAULT_OPTIONS = {
  dryRun: false,
  includeTemplates: true,
  exts: ['.ts', '.tsx', '.vue'],
  dirs: null,
};

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
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

function isExcludedFile(absPath) {
  return absPath.includes(`${path.sep}src${path.sep}locales${path.sep}`);
}

async function readLocaleObject(filePath) {
  try {
    const code = await fs.readFile(filePath, 'utf-8');
    const m = code.match(/export\s+default\s+([\s\S]*?);?\s*$/);
    if (!m) return {};
    // eslint-disable-next-line no-new-func
    const obj = Function(`"use strict"; return (${m[1]});`)();
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

function flattenLocale(obj, prefix = '', out = {}) {
  if (Array.isArray(obj)) return out;
  for (const k of Object.keys(obj || {})) {
    const v = obj[k];
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') {
      flattenLocale(v, key, out);
    } else if (typeof v === 'string') {
      out[key] = unwrapLiteral(v);
    }
  }
  return out;
}

function unwrapLiteral(str) {
  // 将 { 'xxx' } 或 {"xxx"} 解包
  const m = String(str).match(/^\{\s*'(.*)'\s*\}$|^\{\s*"(.*)"\s*\}$/s);
  if (m) return (m[1] ?? m[2] ?? '').replace(/\\'/g, "'");
  return str;
}

async function loadAllZhCN() {
  const entries = await fs.readdir(LOCALES_ZH_CN_DIR, { withFileTypes: true });
  const all = {};
  for (const e of entries) {
    if (!e.isFile() || !e.name.endsWith('.ts')) continue;
    const group = e.name.replace(/\.ts$/, '');
    const obj = await readLocaleObject(path.join(LOCALES_ZH_CN_DIR, e.name));
    const flat = flattenLocale(obj, group);
    Object.assign(all, flat);
  }
  return all; // 形如 { 'ccfast.xxx._key1': '中文' }
}

function replaceTranslateCalls(code, key2text) {
  // 处理 translateText('a.b'), t('a.b'), $tt('a.b')
  const re = /(translateText|t|\$tt)\(\s*(['"])([^'"\)]+)\2\s*\)/g;
  return code.replace(re, (all, fn, q, key) => {
    const text = key2text[key];
    if (!text) return all; // 未命中保持不变
    return toJsLiteral(String(text));
  });
}

function removeTranslateImport(code) {
  // 移除 import { translateText } from '/@/locales/setupI18n'
  const importRe = /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]\/@\/locales\/setupI18n['"];?\n?/g;
  return code.replace(importRe, (all, inside) => {
    // 删除 translateText 这个 specifier
    const list = inside
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .filter((s) => !/^translateText(\s+as\s+\w+)?$/.test(s));
    if (list.length === 0) return '';
    return `import { ${list.join(', ')} } from '/@/locales/setupI18n';\n`;
  });
}

function replaceVueMustache(code, key2text) {
  // 替换 {{ $tt('a.b') }} -> 中文
  const re = /\{\{\s*\$tt\(\s*(['"])([^'"\)]+)\1\s*\)\s*\}\}/g;
  return code.replace(re, (all, q, key) => {
    const text = key2text[key];
    if (!text) return all;
    return text;
  });
}

function toJsLiteral(text) {
  const hasNewline = /[\r\n]/.test(text);
  const tooLong = text.length > 120;
  const hasSingle = text.includes("'");
  const hasDouble = text.includes('"');
  // 优先使用模板字符串：存在换行、过长、或单双引号均存在
  if (hasNewline || tooLong || (hasSingle && hasDouble)) {
    const safe = text.replace(/`/g, '\\`').replace(/\$\{/g, '\\\${');
    return `\`${safe}\``;
  }
  // 优先选择不会冲突的引号
  if (hasSingle && !hasDouble) {
    const esc = text.replace(/"/g, '\\"');
    return `"${esc}"`;
  }
  const esc = text.replace(/'/g, "\\'");
  return `'${esc}'`;
}

async function processFile(absPath, key2text, options) {
  const rel = getRelFromSrc(absPath);
  const ext = path.extname(absPath).toLowerCase();
  let content = await fs.readFile(absPath, 'utf-8');

  if (ext === '.vue') {
    // 处理脚本块中的调用与 import
    content = replaceTranslateCalls(content, key2text);
    content = removeTranslateImport(content);
    // 处理模板中的 {{ $tt('key') }}
    content = replaceVueMustache(content, key2text);
  } else {
    content = replaceTranslateCalls(content, key2text);
    content = removeTranslateImport(content);
  }

  if (!options.dryRun) {
    await fs.writeFile(absPath, content, 'utf-8');
  }
}

async function main() {
  const args = process.argv.slice(2);
  const options = { ...DEFAULT_OPTIONS };
  if (args.includes('--dry-run')) options.dryRun = true;
  const dirsIdx = args.findIndex((a) => a === '--dirs');
  if (dirsIdx !== -1 && args[dirsIdx + 1]) {
    options.dirs = args[dirsIdx + 1]
      .split(',')
      .map((s) => s.trim().replace(/^\/+|\/+$/g, ''))
      .filter(Boolean);
  }

  const key2text = await loadAllZhCN();

  let changed = 0;
  for await (const abs of walk(SRC_DIR)) {
    if (isExcludedFile(abs)) continue;
    const ext = path.extname(abs).toLowerCase();
    if (!DEFAULT_OPTIONS.exts.includes(ext)) continue;
    const rel = getRelFromSrc(abs);
    if (options.dirs && !options.dirs.some((d) => rel.startsWith(d + '/'))) continue;

    try {
      await processFile(abs, key2text, options);
      changed++;
    } catch (e) {
      console.warn(`[revert] 处理失败: ${rel} -> ${e.message}`);
    }
  }

  console.log(`\n[i18n-revert] 完成，处理文件 ${changed} 个${options.dryRun ? '（预览）' : ''}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


