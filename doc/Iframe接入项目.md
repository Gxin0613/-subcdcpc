# 现有系统如何通过IFrame接入系统

- ### 第一步：打包部署CCFlowVue3

    1. 从SVN更新CCFlowVue3代码
    2. 修改.env 文件的VITE_GLOB_IS_THIRDPART_SYSTEM 为 1
    3. 修改.env.production 中 VITE_GLOB_API_URL 为后端实际地址
    4. 执行 pnpm install
    5. 执行 pnpm build
    6. 拷贝根目录下/dist 目录里面所有文件到nginx等静态资源服务器
    7. 启动静态资源服务器

- ### 第二步：在现有系统集成
    
    1. 后端流程如下：
        - 如果jflow被独立部署，需要现有系统登录的时候通过httpClient等方式获取ccflow或jflow的token
        示例：通过DevelopAPI 登录
        ```java
            // 示例中 后台访问地址为 http://localhost:8009
            // 接口路由为 /WF/API/Port_Login
            import org.apache.http.client.methods.HttpGet;
            import org.apache.http.client.HttpClient;
            import org.apache.http.impl.client.HttpClientBuilder;
            import org.apache.http.HttpResponse;
            import org.apache.http.util.EntityUtils;

            public String getJFlowToken(String privateKey, String userNo) {
                String url = "http://localhost:8009/WF/API/Port_Login?PrivateKey=" + privateKey + "&UserNo=" + userNo;

                HttpClient httpClient = HttpClientBuilder.create().build();
                HttpGet request = new HttpGet(url);

                try {
                    HttpResponse response = httpClient.execute(request);
                    String responseBody = EntityUtils.toString(response.getEntity());
                    System.out.println(responseBody);

                    // Parse the JSON response and extract the token from the 'data' field
                    JSONObject jsonResponse = new JSONObject(responseBody);
                    String data = jsonResponse.getString("data");
                    JSONObject jsonData = new JSONObject(data);
                    String token = jsonData.getString("Token");
                    return token;
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

        ```
        - 如果jflow-core和现有项目以Maven父子工程集成，
          那么直接调用jflow-core的Dev2Interface.Port_Login(userid) 方法获取token返回前端即可

        - 获取token后，随现有系统的登录接口返回jflowToken，示例：
        ```json 
        {
            data: {
                token: 'xxx',
                jflowToken: 'xxx',
            },
            code: 200,
            msg: 'success'
        }
        ```

    2. 前端处理流程
        2.1 在现有系统保存token的地方新增jflowToken，登录时同时保存接口的jflowToken
        2.2 在现有系统.env 或 任意全局变量中配置 CCFlowVue3的访问地址
        2.3 在现有系统路由中配置对应的菜单
        - 一般推荐一个单文件文件对应一个iframe页面，因为需要处理token等参数
        - 现有以vue3技术栈为例，如要接入流程发起页面，步骤如下
        ```javascript
            // 新建一个vue文件，如放在workflow下 
            // /src/workflow/start.vue
            // 现有项目.env配置的CCFlowVue3的访问地址为参数为 VITE_APP_JFLOW_CORE_ADDR
            // token存放在userStore中
            <template>
                <iframe :src="url" style="border:none"/>
            </template>
            <script lang="ts" setup name="wf-start">
                import { ref } from 'vue';
                import { useUserStoreWithOut } from '/@/store/modules/user'; 
                // 这里从现有的store中获取jflow的token
                const user = useUserStoreWithOut();
                const url = ref(`${import.meta.env.VITE_APP_JFLOW_CORE_ADDR}/#/FEForward?action=GL_Start&token=${user.getJFlowToken}`);
            </script>
        ```
- 调用规则及支持功能如下
    1. 前端iframe发起规则
        以部署地址为localhost:3000为例
        ```javascript
            const url = 'localhost:3000/#/FEForward?action=GL_Start&token=xxx'
        ```
        其中action为对应的功能页面，token为jflow系统的token

    2. 当前支持嵌入的功能页面如下
    
        - GL_TodoList     - 流程待办页面
        - GL_Start        - 流程发起页面
        - GL_RecentStart  - 流程近期发起
        - GL_RecentWork   - 近期使用流程
        - GL_Running      - 运行中的流程
        - GL_Draft        - 草稿列表页面
        - GL_Batch        - 批处理页面
        - GL_CC           - 流程抄送列表
        - FrmTree         - 表单模板树结构
        - FlowTree        - 流程模板树结构
        - MyFlow          - 单独流程发起
