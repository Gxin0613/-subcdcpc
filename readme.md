# 开发前须知

 1. 本项目使用pnpm 作为包管理器， 切勿混用yarn / npm / cnpm 等工具，以免出现依赖项不兼容导致的问题，如果已经使用且导致异常，删除node_modules及对应的yarn.lock package-lock.json 等文件，重新使用pnpm执行清洁安装即可。
    - 如果pnpm安装报错，可使用pnpm store prune命令删除本地store及环境，重新执行pnpm install

 2. 开发工具推荐vscode， 配合eslint/TypeScriptVuePlugin(Volar)/VueLanguageFeture 插件使用， 同时需要将eslint插件设置为默认的格式化工具。可在开发阶段实现一部分的代码质量检查，提高项目可读性及稳定性。

 3. 项目使用了vben-admin UI/菜单部分，其余组件均为自行开发，若需要vben相关封装的组件，可将vben的components目录拷贝到项目components下使用。

 4. 项目首次启动有较多的初始化操作，包含less编译（耗时）/ 依赖分析 / ts编译，可能会消耗较长时间，视计算机配置约3~6分钟，后续启动均使用缓存，能实现数秒内启动。


# 项目结构说明
    /src
     - /App            为应用开发目录，推荐将自定义开发的工具存放到此
     - /bp             为核心的实体目录，一般不需要修改
     - /WF             为工作流相关目录，包含流程设计器，表单设计器，实体编辑器等常用功能，一般不需要修改
     - /Portal         为首页文件存放目录，可自行修改
     - /CCFast         为低代码相关目录，一般不需要修改
     - /CCMobile       为移动端相关目录，一般不需要修改
     - /CCMobilePortal 为移动端门户目录，一般不需要修改
     - /CCOA           为OA相关目录，包含BBS等，知识库等， 一般不需要修改
     - /theme          为项目主题配置，可自行修改

    .eslintrc.cjs       为eslint相关配置，可根据团队规范修改
    .eslintignore      为eslint相关排除文件，不需要eslint格式化的文件放在此处



    其余目录可参考vue标准项目




# 打包说明

  ### 由于vite只会进行ts到js的转义，不会进行ts的类型检查，所以打包的时候只进行 build 操作是可能存在打包失败的情况的，这个时候可根据报错信息处理掉问题文件后重新进行打包。为了避免打包失败，也可先执行 pnpm type:check， 进行类型检查，修改问题后再执行打包

  1. 项目包含了以下打包配置，可自行在 .env.production 修改
    - VITE_BUILD_COMPRESS gzip|brotli压缩 可提高访问速度，需要在nginx等配置
    - VITE_LEGACY 兼容低版本浏览器，最低为支持ES2015的版本

  2. 为了防止出现缓存未能被刷新的情况，需要在相关的服务器禁用掉index.html的缓存，其余文件可忽略。（CDN等情况可在控制台修改缓存策略）

  3. 登录时出现Network Error控制台出现net::ERR_CONNECTION_REFUSED的解决办法，检查_app.config.js配置文件中的VITE_GLOB_API_URL是否为后端的URL.

  
  
