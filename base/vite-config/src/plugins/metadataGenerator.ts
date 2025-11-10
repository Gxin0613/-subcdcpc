import glob from 'fast-glob';
import * as fsSync from 'fs';
import * as fs from 'fs/promises';
import * as path from 'path';
import picomatch from 'picomatch';
import * as ts from 'typescript';
import { Plugin, ResolvedConfig, ViteDevServer } from 'vite';

interface BaseMetadata {
  classId: string;
  className: string;
  filePath: string;
}

interface EntityMetadata extends BaseMetadata {
  tableName: string;
  desc: string;
  baseClass: string;
}

interface PageMetadata extends BaseMetadata {
  pageTitle: string;
  relateEntity: string;
}

interface MetadataOutputConfig {
  entity: {
    outputFile: string;
    virtualModuleId: string;
  };
  gl: {
    outputFile: string;
    virtualModuleId: string;
  };
  gpn: {
    outputFile: string;
    virtualModuleId: string;
  };
}

interface UnifiedMetadataPluginOptions {
  pattern: string;
  outputs: MetadataOutputConfig;
  debug?: boolean;
  debounceMs?: number;
}

interface CategorizedMetadata {
  entity: EntityMetadata[];
  gl: PageMetadata[];
  gpn: PageMetadata[];
}

export default function viteUnifiedMetadataPlugin(options: UnifiedMetadataPluginOptions): Plugin {
  const { pattern, outputs, debug = false, debounceMs = 300 } = options;

  const resolvedVirtualModuleIds = {
    entity: '\0' + outputs.entity.virtualModuleId,
    gl: '\0' + outputs.gl.virtualModuleId,
    gpn: '\0' + outputs.gpn.virtualModuleId,
  };

  const pluginName = '[ccbpm]';

  let viteConfig: ResolvedConfig;
  let viteServer: ViteDevServer | undefined;
  let isMatch: picomatch.Matcher;

  const metadataByFile = new Map<string, CategorizedMetadata>();
  let allCombinedMetadata: CategorizedMetadata = { entity: [], gl: [], gpn: [] };
  let updateTimeout: NodeJS.Timeout | null = null;

  const normalizePath = (filePath: string): string => {
    return filePath.replace(/\\/g, '/');
  };

  const getRelativePath = (absoluteFilePath: string): string => {
    if (!viteConfig || !viteConfig.root) return normalizePath(absoluteFilePath);
    return normalizePath(path.relative(viteConfig.root, absoluteFilePath));
  };

  const extractAllMetadataFromFile = (absoluteFilePath: string): CategorizedMetadata => {
    const result: CategorizedMetadata = { entity: [], gl: [], gpn: [] };
    const relativeFilePath = getRelativePath(absoluteFilePath);

    try {
      if (!fsSync.existsSync(absoluteFilePath)) {
        if (debug) console.warn(`${pluginName} 文件未找到，跳过: ${absoluteFilePath}`);
        return result;
      }

      const fileContent = fsSync.readFileSync(absoluteFilePath, 'utf-8');
      if (!fileContent.trim()) {
        return result;
      }

      const sourceFile = ts.createSourceFile(absoluteFilePath, fileContent, ts.ScriptTarget.ESNext, true);

      const visit = (node: ts.Node) => {
        if (ts.isClassDeclaration(node) && node.name) {
          const className = node.name.text;
          let baseClass = '';

          // 找到基类
          if (node.heritageClauses) {
            for (const clause of node.heritageClauses) {
              if (clause.token === ts.SyntaxKind.ExtendsKeyword && clause.types.length) {
                const baseTypeNode = clause.types[0].expression;
                baseClass = baseTypeNode.getText(sourceFile);
                break;
              }
            }
          }

          // 根据基类判断类型
          if (baseClass.startsWith('Entity')) {
            const entityData = extractEntityData(node, sourceFile, relativeFilePath, className, baseClass);
            if (entityData) result.entity.push(entityData);
          } else if (baseClass === 'PageBaseGenerList') {
            const pageData = extractPageData(node, sourceFile, relativeFilePath, className);
            if (pageData) result.gl.push(pageData);
          } else if (baseClass === 'PageBaseGroupNew') {
            const pageData = extractPageData(node, sourceFile, relativeFilePath, className);
            if (pageData) result.gpn.push(pageData);
          }
        }
        ts.forEachChild(node, visit);
      };

      visit(sourceFile);
      return result;
    } catch (error) {
      console.error(`${pluginName} 处理文件 ${absoluteFilePath} 时出错:`, error);
      return result;
    }
  };

  const extractEntityData = (node: ts.ClassDeclaration, sourceFile: ts.SourceFile, filePath: string, className: string, baseClass: string): EntityMetadata | null => {
    const extractedFields: Record<string, string> = {};

    for (const member of node.members) {
      if (ts.isConstructorDeclaration(member)) {
        for (const stmt of member.body?.statements || []) {
          if (ts.isExpressionStatement(stmt) && ts.isCallExpression(stmt.expression) && stmt.expression.expression.getText(sourceFile) === 'super') {
            const args = stmt.expression.arguments;
            if (args.length > 0) {
              const firstArg = args[0];
              if (ts.isStringLiteral(firstArg) || ts.isNoSubstitutionTemplateLiteral(firstArg)) {
                extractedFields.classId = firstArg.text;
              }
            }
            break;
          }
        }
      }

      if (ts.isGetAccessor(member) && ts.isIdentifier(member.name) && member.name.text === 'EnMap') {
        if (member.body) {
          const findMapCall = (n: ts.Node) => {
            if (ts.isNewExpression(n) && n.expression.getText(sourceFile) === 'Map' && n.arguments && n.arguments.length >= 2) {
              const nameArg = n.arguments[0];
              const descArg = n.arguments[1];
              if ((ts.isStringLiteral(nameArg) || ts.isNoSubstitutionTemplateLiteral(nameArg)) && (ts.isStringLiteral(descArg) || ts.isNoSubstitutionTemplateLiteral(descArg))) {
                extractedFields.tableName = nameArg.text;
                extractedFields.desc = descArg.text;
              }
              return;
            }
            ts.forEachChild(n, findMapCall);
          };
          findMapCall(member.body);
        }
      }
    }

    if (extractedFields.classId) {
      return {
        classId: extractedFields.classId,
        tableName: extractedFields.tableName || className,
        desc: extractedFields.desc || '',
        filePath,
        className,
        baseClass,
      };
    }
    return null;
  };

  const extractPageData = (node: ts.ClassDeclaration, sourceFile: ts.SourceFile, filePath: string, className: string): PageMetadata | null => {
    const extractedFields: Record<string, string> = {};

    for (const member of node.members) {
      if (ts.isConstructorDeclaration(member)) {
        if (!member.body) continue;
        for (const stmt of member.body.statements) {
          if (ts.isExpressionStatement(stmt) && ts.isCallExpression(stmt.expression) && stmt.expression.expression.getText(sourceFile) === 'super') {
            const args = stmt.expression.arguments;
            if (args.length > 0) {
              const firstArg = args[0];
              if (ts.isStringLiteral(firstArg) || ts.isNoSubstitutionTemplateLiteral(firstArg)) {
                extractedFields.classId = firstArg.text;
              }
            }
          }
          if (ts.isExpressionStatement(stmt) && ts.isBinaryExpression(stmt.expression) && stmt.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
            const left = stmt.expression.left;
            if (ts.isPropertyAccessExpression(left) && left.expression.getText(sourceFile) === 'this' && left.name.getText(sourceFile) === 'PageTitle') {
              const right = stmt.expression.right;
              if (ts.isStringLiteral(right) || ts.isNoSubstitutionTemplateLiteral(right)) {
                extractedFields.pageTitle = right.text;
              }
            }
          }
          if (ts.isExpressionStatement(stmt) && ts.isBinaryExpression(stmt.expression) && stmt.expression.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
            const left = stmt.expression.left;
            if (ts.isPropertyAccessExpression(left) && left.expression.getText(sourceFile) === 'this' && left.name.getText(sourceFile) === 'ForEntityClassID') {
              const right = stmt.expression.right;
              if (ts.isStringLiteral(right) || ts.isNoSubstitutionTemplateLiteral(right)) {
                extractedFields.relateEntity = right.text;
              }
            }
          }
        }
      }
    }

    if (extractedFields.classId) {
      return {
        classId: extractedFields.classId,
        pageTitle: extractedFields.pageTitle || '',
        relateEntity: extractedFields.relateEntity,
        className,
        filePath,
      };
    }
    return null;
  };

  const mergeCategorizedMetadata = (current: CategorizedMetadata, newData: CategorizedMetadata): CategorizedMetadata => {
    return {
      entity: [...current.entity, ...newData.entity],
      gl: [...current.gl, ...newData.gl],
      gpn: [...current.gpn, ...newData.gpn],
    };
  };

  const sortMetadata = (metadata: CategorizedMetadata): CategorizedMetadata => {
    const sortFn = (a: EntityMetadata | PageMetadata, b: EntityMetadata | PageMetadata) => {
      if (a.filePath < b.filePath) return -1;
      if (a.filePath > b.filePath) return 1;
      if (a.classId < b.classId) return -1;
      if (a.classId > b.classId) return 1;
      return 0;
    };

    return {
      entity: [...metadata.entity].sort(sortFn),
      gl: [...metadata.gl].sort(sortFn),
      gpn: [...metadata.gpn].sort(sortFn),
    };
  };

  const regenerateAndSaveAllMetadata = async (triggeredByFile?: string) => {
    // 合并所有文件的元数据
    const emptyMetadata: CategorizedMetadata = { entity: [], gl: [], gpn: [] };
    allCombinedMetadata = Array.from(metadataByFile.values()).reduce((acc, curr) => mergeCategorizedMetadata(acc, curr), emptyMetadata);

    // 排序
    allCombinedMetadata = sortMetadata(allCombinedMetadata);

    try {
      // 同时生成三个文件
      const savePromises = [
        saveMetadataFile(outputs.entity.outputFile, allCombinedMetadata.entity, 'Entity', triggeredByFile),
        saveMetadataFile(outputs.gl.outputFile, allCombinedMetadata.gl, 'GL', triggeredByFile),
        saveMetadataFile(outputs.gpn.outputFile, allCombinedMetadata.gpn, 'GPN', triggeredByFile),
      ];

      await Promise.all(savePromises);

      // 更新虚拟模块
      if (viteServer) {
        const moduleIds = [
          { id: resolvedVirtualModuleIds.entity, name: outputs.entity.virtualModuleId },
          { id: resolvedVirtualModuleIds.gl, name: outputs.gl.virtualModuleId },
          { id: resolvedVirtualModuleIds.gpn, name: outputs.gpn.virtualModuleId },
        ];

        for (const { id, name } of moduleIds) {
          const mod = viteServer.moduleGraph.getModuleById(id);
          if (mod) {
            viteServer.moduleGraph.invalidateModule(mod);
            if (debug) console.log(`${pluginName} 虚拟模块 ${name} 已标记为失效.`);
          }
        }
      }
    } catch (error) {
      console.error(`${pluginName} 更新/保存元数据失败:`, error);
    }
  };

  const saveMetadataFile = async (outputFile: string, metadata: EntityMetadata[] | PageMetadata[], type: string, triggeredByFile?: string) => {
    const outputPath = path.resolve(viteConfig.root || process.cwd(), outputFile);
    const outputDir = path.dirname(outputPath);

    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(metadata, null, 2));

    if (debug) {
      const triggerMsg = triggeredByFile ? ` (triggered by ${getRelativePath(triggeredByFile)} )` : '';
      if (metadata.length > 0) {
        console.info(`${pluginName} ${type} config output to ${outputPath}${triggerMsg} (total: ${metadata.length} ).`);
      } else {
        console.info(`${pluginName} ${type} config (empty) to ${outputPath}${triggerMsg}`);
      }
    }
  };

  const scheduleMetadataUpdate = (triggeredByFile?: string) => {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    updateTimeout = setTimeout(() => {
      regenerateAndSaveAllMetadata(triggeredByFile);
    }, debounceMs);
  };

  const processFile = (absoluteFilePath: string, init = false): boolean => {
    const normalizedPath = normalizePath(absoluteFilePath);

    if (!fsSync.existsSync(normalizedPath)) {
      if (metadataByFile.has(normalizedPath)) {
        metadataByFile.delete(normalizedPath);
        if (debug && !init) console.log(`${pluginName} deleted: ${getRelativePath(normalizedPath)}, 元数据已移除.`);
        return true;
      }
      return false;
    }

    const newMetadata = extractAllMetadataFromFile(normalizedPath);
    const oldMetadataJson = JSON.stringify(metadataByFile.get(normalizedPath) || { entity: [], gl: [], gpn: [] });
    const newMetadataJson = JSON.stringify(newMetadata);

    if (oldMetadataJson !== newMetadataJson) {
      const hasAnyMetadata = newMetadata.entity.length > 0 || newMetadata.gl.length > 0 || newMetadata.gpn.length > 0;
      if (hasAnyMetadata) {
        metadataByFile.set(normalizedPath, newMetadata);
      } else {
        metadataByFile.delete(normalizedPath);
      }
      if (debug && !init) {
        const types = [];
        if (newMetadata.entity.length > 0) types.push(`Entity(${newMetadata.entity.length})`);
        if (newMetadata.gl.length > 0) types.push(`GL(${newMetadata.gl.length})`);
        if (newMetadata.gpn.length > 0) types.push(`GPN(${newMetadata.gpn.length})`);
        console.log(`${pluginName} updated: ${getRelativePath(normalizedPath)}, config type : ${types.join(', ')}.`);
      }
      return true;
    }
    return false;
  };

  const initialScan = async () => {
    if (!pattern) {
      console.error(`${pluginName} 选项 'pattern' 是必需的.`);
      return;
    }
    if (!viteConfig) {
      console.error(`${pluginName} Vite 配置尚未解析.`);
      return;
    }

    metadataByFile.clear();

    const files = await glob(pattern, {
      cwd: viteConfig.root || process.cwd(),
      absolute: true,
      onlyFiles: true,
      dot: true,
      ignore: ['**/node_modules/**', '**/dist/**'],
    });

    if (files.length === 0) {
      if (debug) console.warn(`${pluginName} scan result: no files found by pattern: ${pattern}`);
    } else {
      let totalEntity = 0,
        totalGL = 0,
        totalGPN = 0;
      for (const file of files) {
        const processed = processFile(normalizePath(file), true);
        if (processed) {
          const metadata = metadataByFile.get(normalizePath(file));
          if (metadata) {
            totalEntity += metadata.entity.length;
            totalGL += metadata.gl.length;
            totalGPN += metadata.gpn.length;
          }
        }
      }

      if (debug) {
        console.info(`${pluginName} initial success : Entity(${totalEntity}), GL(${totalGL}), GPN(${totalGPN})`);
      }
    }
    await regenerateAndSaveAllMetadata();
  };

  return {
    name: 'vite-unified-metadata-plugin',

    configResolved(resolvedConfig) {
      viteConfig = resolvedConfig;
      const globPatternForMatcher = path.isAbsolute(pattern) ? normalizePath(path.relative(viteConfig.root, pattern)) : normalizePath(pattern);
      isMatch = picomatch(globPatternForMatcher, { cwd: viteConfig.root });

      if (debug) console.log(`${pluginName} 初始化完成, 监听模式: ${globPatternForMatcher}`);
      initialScan();
    },

    configureServer(server) {
      viteServer = server;
    },

    resolveId(id) {
      if (id === outputs.entity.virtualModuleId) {
        return resolvedVirtualModuleIds.entity;
      }
      if (id === outputs.gl.virtualModuleId) {
        return resolvedVirtualModuleIds.gl;
      }
      if (id === outputs.gpn.virtualModuleId) {
        return resolvedVirtualModuleIds.gpn;
      }
      return null;
    },

    load(id) {
      if (id === resolvedVirtualModuleIds.entity) {
        return `export default ${JSON.stringify(allCombinedMetadata.entity)};`;
      }
      if (id === resolvedVirtualModuleIds.gl) {
        return `export default ${JSON.stringify(allCombinedMetadata.gl)};`;
      }
      if (id === resolvedVirtualModuleIds.gpn) {
        return `export default ${JSON.stringify(allCombinedMetadata.gpn)};`;
      }
      return null;
    },

    async handleHotUpdate({ file }: { file: string }) {
      const absoluteFilePath = normalizePath(file);
      const relativePath = getRelativePath(absoluteFilePath);

      if (isMatch(relativePath)) {
        if (debug) console.log(`${pluginName} HMR: 文件变更: ${relativePath}`);
        const metadataDidChange = processFile(absoluteFilePath);

        if (metadataDidChange) {
          scheduleMetadataUpdate(absoluteFilePath);
        }
      }
    },
  };
}

export function createUnifiedMetadataPlugin(options: {
  pattern: string;
  entityOutput: { outputFile: string; virtualModuleId: string };
  glOutput: { outputFile: string; virtualModuleId: string };
  gpnOutput: { outputFile: string; virtualModuleId: string };
  debug?: boolean;
  debounceMs?: number;
}) {
  return viteUnifiedMetadataPlugin({
    pattern: options.pattern,
    outputs: {
      entity: options.entityOutput,
      gl: options.glOutput,
      gpn: options.gpnOutput,
    },
    debug: options.debug,
    debounceMs: options.debounceMs,
  });
}
