# 更新日志

## [2024.03.10]

### 主要：

- 引入pnpm-workspace对配置集中管理
- 更快的运行速度（vue3.4 2x模板解析速度）
- 减少冷启动白屏时间 （预编译）
- 大幅缩短打包时间 （约 5分钟 -> 3分钟）
- 更合理的分包策略 + 更小的打包体积 （最大单文件产物 5M -> 2M）
- 引入turbo
- 移除主题插件
- windi.css -> unocss （处理内存泄漏）

### bug修复：

- 修复存在dist包时，启动dev环境报无法访问github的错误
- 修复ant-design-vue 在vue3.4及更高版本无法关闭弹窗问题
- 修复_app.config.js可能存在缓存问题

### 注意事项：
    
- ant-design-vue已更新至v4，Modal API 由 v-model:visible -> v-model:open
- 安装依赖到主包时需要添加 -w 后缀 例 pnpm install vue -w
- legacy 插件已移除，需要兼容低版本浏览器，需要自行配置，但不要提交到主版本
- vite5 现在严格区分CommonJS及ESModule, 新建配置文件需要详细声明后缀，如(index.cjs, index.mjs)
- 批量导入API，已经不支持import.meta.globEagar, 需要同步导入需要使用import.meta.glob('path', {eager: true})