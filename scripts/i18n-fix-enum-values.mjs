import fs from 'fs/promises';
import path from 'path';

// 修复 zh-CN 语言文件中值为 "@n=..." 的枚举定义串：
// 由 "@0=饼图@1=折线图" => "{'@0=饼图@1=折线图'}"

async function fixFile(targetPath) {
  const abs = path.resolve(targetPath);
  let code = await fs.readFile(abs, 'utf-8');

  // 统计：匹配形如 : "..." 或 : '...' 的值；稍后判断是否为 @key=...
  const valueRe = /:\s*("([^"]*)"|'([^']*)')/g;
  let m;
  let count = 0;
  const seen = new Set();

  // 预览计数
  while ((m = valueRe.exec(code)) !== null) {
    const raw = (m[2] ?? m[3] ?? '');
    // 已经是字面量形式 {''} 的跳过
    if (/^\{\'/.test(raw) || /^\{\"/.test(raw)) continue;
    // 命名或数字键（支持中文/Unicode）：@草稿=、@0= 等；至少包含一个等号
    if (/@[^=\s@]+=/u.test(raw)) {
      count++;
      seen.add(raw);
    }
  }

  if (count === 0) {
    console.log(`[fix] ${targetPath} 未发现需修复的枚举串`);
    return { targetPath, fixed: 0 };
  }

  // 实际替换：包裹为字面量插值，转义单引号
  const newCode = code.replace(valueRe, (all, whole, g2, g3) => {
    const raw = g2 ?? g3 ?? '';
    if (/^\{\'/.test(raw) || /^\{\"/.test(raw)) return all; // 已处理
    if (!/@[^=\s@]+=/u.test(raw)) return all; // 非枚举串
    const escaped = String(raw).replace(/'/g, "\\'");
    return `: "{'${escaped}'}"`;
  });

  await fs.writeFile(abs, newCode, 'utf-8');
  console.log(`[fix] ${targetPath} 已修复 ${count} 处`);
  return { targetPath, fixed: count };
}

async function listTsFiles(rootDir) {
  const absRoot = path.resolve(rootDir);
  const results = [];
  async function walk(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const fp = path.join(dir, e.name);
      if (e.isDirectory()) {
        await walk(fp);
        continue;
      }
      if (e.isFile() && fp.endsWith('.ts')) {
        results.push(fp);
      }
    }
  }
  await walk(absRoot);
  return results;
}

async function main() {
  const args = process.argv.slice(2);
  // 不传参时：扫描并修复 src/locales/lang/zh-CN 目录下所有 .ts 文件
  const files = args.length ? args : await listTsFiles('src/locales/lang/zh-CN');
  let total = 0;
  for (const f of files) {
    try {
      const { fixed } = await fixFile(f);
      total += fixed;
    } catch (e) {
      console.warn(`[fix] 处理失败: ${f} -> ${e.message}`);
    }
  }
  console.log(`\n[fix] 完成，累计修复 ${total} 处`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
