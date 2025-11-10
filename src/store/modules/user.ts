import type { UserInfo } from '/#/store';
import type { ErrorMessageMode } from '/#/axios';
import { defineStore } from 'pinia';
import { store } from '/@/store';
import { RoleEnum } from '/@/enums/roleEnum';
import { PageEnum } from '/@/enums/pageEnum';
import { ROLES_KEY, S_TOKEN_KEY, TOKEN_KEY, USER_INFO_KEY, WEB_USER_INFO_KEY } from '/@/enums/cacheEnum';
import { getAuthCache, setAuthCache } from '/@/utils/auth';
import { useI18n } from '/@/hooks/web/useI18n';
import { useMessage } from '/@/hooks/web/useMessage';
import { router } from '/@/router';
import { usePermissionStore } from '/@/store/modules/permission';
import { RouteRecordRaw } from 'vue-router';
import { PAGE_NOT_FOUND_ROUTE } from '/@/router/routes/basic';
import { h } from 'vue';
import HttpHandler from '/@/utils/gener/HttpHandler';
import GlobalWebUser, { TokenInfo, User } from '/@/bp/web/WebUser';
import { Modal, message } from 'ant-design-vue';
import { AesEncryption } from '/@/utils/cipher';
import { getAppEnvConfig } from '/@/utils/env';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import WebUser from '/@/bp/web/WebUser';
import { Org } from '/@/WF/Admin/SaaS/Org';
import { useCacheIframe } from '/@/hooks/iframe/useCacheIframe';
import { showFailToast } from 'vant';
import { setCookie } from '/@/utils/storage';

// import { getAppEnvConfig } from '/@/utils/env';
// import { getCookie } from '/@/utils/storage';
// import { getCookie } from '/@/utils/request/decode';

interface UserState {
  WebUser: Nullable<User>;
  userInfo: Nullable<UserInfo | User>;
  token?: string;
  testToken?: string;
  sToken?: string;
  roleList: RoleEnum[];
  sessionTimeout?: boolean;
  lastUpdateTime: number;
  // skipRouteCheck: boolean;
}

interface LoginParams {
  username: string;
  password: string;
  OrgNo?: string; //SAAS版 登录需要组织编号
  verifyCode?: string;
  verifyCodeKey?:string
}
export const useUserStore = defineStore({
  id: 'app-user',
  state: (): UserState => ({
    WebUser: null,
    // user info
    userInfo: null,
    // token
    token: undefined,
    // testUserToken
    sToken: undefined,
    // roleList
    roleList: [],
    // Whether the login expired
    sessionTimeout: false,
    // Last fetch time
    lastUpdateTime: 0,
    // skip Route Check
    // skipRouteCheck: false,
  }),
  getters: {
    getWebUser(): {} {
      return this.WebUser || getAuthCache<User>(WEB_USER_INFO_KEY) || {};
    },
    getUserInfo(): UserInfo | User {
      return this.userInfo || getAuthCache<UserInfo | User>(USER_INFO_KEY) || {};
    },
    getToken(): string {
      // const { VITE_GLOB_IS_THIRDPART_SYSTEM } = getAppEnvConfig();
      // if (VITE_GLOB_IS_THIRDPART_SYSTEM) {
      //   return this.testToken || getAuthCache<string>(TEST_TOKEN_KEY) || getCookie('Token');
      // }
      // return this.token || getCookie('Token') || getAuthCache<string>(TOKEN_KEY);
      return this.token || getAuthCache<string>(TOKEN_KEY);
    },
    getSToken(): string {
      return this.sToken || getAuthCache<string>(S_TOKEN_KEY);
    },
    getRoleList(): RoleEnum[] {
      return this.roleList.length > 0 ? this.roleList : getAuthCache<RoleEnum[]>(ROLES_KEY);
    },
    getSessionTimeout(): boolean {
      return !!this.sessionTimeout;
    },
    getLastUpdateTime(): number {
      return this.lastUpdateTime;
    },
    // getSkipRouteCheck(): boolean {
    //   return this.skipRouteCheck;
    // },
  },
  actions: {
    // setTestToken(token: string) {
    //   this.testToken = token;
    //   setAuthCache(TEST_TOKEN_KEY, token);
    // },
    setToken(info: string | undefined) {
      this.token = info ? info : ''; // for null or undefined value
      setAuthCache(TOKEN_KEY, info);
    },
    setSToken(info: string | undefined) {
      this.sToken = info ? info : ''; // for null or undefined value
      setAuthCache(S_TOKEN_KEY, info);
    },
    setRoleList(roleList: RoleEnum[]) {
      this.roleList = roleList;
      setAuthCache(ROLES_KEY, roleList);
    },
    setWebUser(user: User | null) {
      if (user) {
        user.Token = this.getToken;
        GlobalWebUser.userInfo = user;
        this.lastUpdateTime = Date.now();
        setAuthCache(WEB_USER_INFO_KEY, user);
      } else {
        GlobalWebUser.userInfo = null;
      }
    },
    setUserInfo(info: UserInfo | User | null) {
      this.userInfo = info;
      this.lastUpdateTime = new Date().getTime();
      setAuthCache(USER_INFO_KEY, info);
    },
    setSessionTimeout(flag: boolean) {
      this.sessionTimeout = flag;
    },
    // setSkipRouteCheck(flag: boolean) {
    //   this.skipRouteCheck = flag;
    // },
    resetState() {
      document.cookie = 'CCS=';
      document.cookie = 'Token=';
      this.setToken('');
      this.setSToken('');
      this.userInfo = null;
      // this.token = '';
      this.roleList = [];
      this.sessionTimeout = false;
      // this.skipRouteCheck = false;
    },

    async fetchUserInfo<T = User>() {
      const userHandler = new HttpHandler('');
      const WebUserInfo: any = await userHandler.CustomRequest<T>({
        DoType: 'WebUser_Init',
        Token: this.getToken,
        t: Date.now(),
      });
      localStorage.setItem('CustomNo', WebUserInfo.CustomerNo); // 每次登录或者刷新都会重新请求WebUser_Init
      const { VITE_GLOB_PRELOAD_URL } = getAppEnvConfig();
      const { loadUrl } = useCacheIframe({ clickWrapperClose: true });
      if (VITE_GLOB_PRELOAD_URL) {
        loadUrl(VITE_GLOB_PRELOAD_URL + `&userid=${WebUserInfo?.No}&BPMToken=${WebUserInfo?.Token}`);
      }
      return WebUserInfo;
    },
    /**
     * @description: login
     */
    async login(
      params: LoginParams & {
        goHome?: boolean;
        mode?: ErrorMessageMode;
        type?: string;
      },
    ): Promise<UserInfo | User | null> {
      this.resetState();
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
      let pwd = params.password;
      //密码敏感信息加密
      const { VITE_GLOB_ENCRYPTION_KEY } = getAppEnvConfig();
      const encryption = new AesEncryption({ key: VITE_GLOB_ENCRYPTION_KEY });
      //不加密就注释掉 pwd
      pwd = encryption.encryptByAES(params.password);
      handler.AddPara('TB_No', params.username);
      handler.AddPara('TB_PW', pwd);
      handler.AddPara('VerifyCode', params.verifyCode);
      handler.AddPara('VerifyCodeKey', params.verifyCodeKey);
      const data = await handler.DoMethodReturnJson<TokenInfo>('Login_Submit');
      if (!data.Token) {
        Modal.error({
          title: () => h('span', '错误'),
          content: () => h('span', '未获取到登录凭证'),
        });
        return null;
      }
      this.setToken(data.Token);
      return this.afterLoginAction(true, params.type);
    },
    /**
     * @description: oplogin
     */
    async opLogin(
      params: LoginParams & {
        goHome?: boolean;
        mode?: ErrorMessageMode;
        type?: string;
      },
    ): Promise<UserInfo | User | null> {
      this.resetState();
      const handler = new HttpHandler('BP.Cloud.HttpHandler.Portal_SaaS');
      //密码敏感信息加密
      const { VITE_GLOB_ENCRYPTION_KEY } = getAppEnvConfig();
      const encryption = new AesEncryption({ key: VITE_GLOB_ENCRYPTION_KEY });
      const pwd = encryption.encryptByAES(params.password);
      handler.AddPara('TB_No', params.username);
      handler.AddPara('TB_PW', pwd);
      handler.AddPara('VerifyCode', params.verifyCode);
      const data = await handler.DoMethodReturnJson<TokenInfo>('Login_SubmitSaaSOption');
      if (!data.Token) {
        Modal.error({
          title: () => h('span', '错误'),
          content: () => h('span', '未获取到登录凭证'),
        });
        return null;
      }
      this.setToken(data.Token);
      return this.afterLoginAction(true, params.type);
    },

    /**
     * @description: SAAS版超级管理源登录
     */
    async saasLogin(
      params: LoginParams & {
        goHome?: boolean;
        mode?: ErrorMessageMode;
        type?: string;
      },
    ): Promise<UserInfo | User | null> {
      this.resetState();
      if (params.type == 'AdminLogin') {
        const handler = new HttpHandler('BP.Cloud.HttpHandler.Admin');
        //密码敏感信息加密
        const { VITE_GLOB_ENCRYPTION_KEY } = getAppEnvConfig();
        const encryption = new AesEncryption({ key: VITE_GLOB_ENCRYPTION_KEY });
        const pwd = encryption.encryptByAES(params.password);
        handler.AddPara('TB_No', params.username);
        handler.AddPara('TB_PW', pwd);
        const data = await handler.DoMethodReturnJson<TokenInfo>('Login_AdminOnlySaas');
        console.log('登录返回的内容：', data.Token);
        if (!data.Token) {
          Modal.error({
            title: () => h('span', '错误'),
            content: () => h('span', '未获取到登录凭证'),
          });
          return null;
        }
        this.setToken(data.Token);
        router.replace(PageEnum.SAAS_ADMIN_HOME);
        return this.afterLoginAction(true, params.type);
      } else {
        const handler = new HttpHandler('BP.Cloud.HttpHandler.Portal_SaaS');
        //密码敏感信息加密
        const { VITE_GLOB_ENCRYPTION_KEY } = getAppEnvConfig();
        const encryption = new AesEncryption({ key: VITE_GLOB_ENCRYPTION_KEY });
        const pwd = encryption.encryptByAES(params.password);
        handler.AddPara('TB_No', params.username);
        handler.AddPara('TB_PW', pwd);
        handler.AddPara('OrgNo', params.OrgNo);

        const data = await handler.DoMethodReturnJson<TokenInfo>('Login_Submit');
        console.log('登录返回的内容：', data.Token);
        if (!data.Token) {
          Modal.error({
            title: () => h('span', '错误'),
            content: () => h('span', '未获取到登录凭证'),
          });
          return null;
        }
        this.setToken(data.Token);
        return this.afterLoginAction(true, params.type);
      }
    },
    //中间件模式
    /*async afterLoginMiddleware(goHome?: boolean): Promise<User | null> {
      const userInfo = await this.getUserInfoAction();

      const sessionTimeout = this.sessionTimeout;
      if (sessionTimeout) {
        this.setSessionTimeout(false);
      } else {
        const permissionStore = usePermissionStore();
        if (!permissionStore.isDynamicAddedRoute) {
          const routes = await permissionStore.buildRoutesAction();
          routes.forEach((route) => {
            router.addRoute(route as unknown as RouteRecordRaw);
          });
          router.addRoute(PAGE_NOT_FOUND_ROUTE as unknown as RouteRecordRaw);
          permissionStore.setDynamicAddedRoute(true);
        }
        goHome && (await router.replace(PageEnum.BASE_MIDDLE_HOME));
      }

      return userInfo;
    },*/

    async afterLoginAction(goHome?: boolean, pageType?: string): Promise<User | null> {
      if (!this.getToken) return null;
      // get user info

      const userInfo = await this.getUserInfoAction();
      const homeEnum = {
        Middle: PageEnum.BASE_MIDDLE_HOME,
        Mobile: PageEnum.BASE_CCMobile_HOME,
        AdminLogin: PageEnum.SAAS_ADMIN_HOME,
        Portal: PageEnum.BASE_RptPortal_HOME,
      };
      let homePath = PageEnum.BASE_HOME.toString();
      if (pageType && homeEnum[pageType]) {
        switch (pageType) {
          case 'Portal':
            //获取pageID
            const pageID = await this.getPageID();
            // @ts-ignore
            if (pageID == '0') {
              showFailToast('获取门户信息失败，请联系管理人员配置门户信息。');
              // @ts-ignore
              return;
            }
            homePath = homeEnum[pageType] + '?PageID=' + pageID + '&edit=0';
            break;
          case 'Middle':
          case 'Mobile':
          case 'AdminLogin':
            homePath = homeEnum[pageType];
            break;
          default:
            break;
        }
      }

      if (!!userInfo?.OrgNo) {
        const OrgInfo = new Org(userInfo?.OrgNo);
        await OrgInfo.RetrieveFromDBSources();
        if (!(OrgInfo.HomeUrl == 'null' || OrgInfo.HomeUrl == '')) {
          homePath = OrgInfo.HomeUrl;
        }
      }
      const sessionTimeout = this.sessionTimeout;
      if (sessionTimeout) {
        this.setSessionTimeout(false);
      } else {
        const permissionStore = usePermissionStore();
        if (!permissionStore.isDynamicAddedRoute) {
          // fix:修复跳转后，菜单不会加载的问题
          // if (!pageType || pageType === 'Standard')
          await permissionStore.buildCCFastRoutes();
          const routes = await permissionStore.buildRoutesAction();
          routes.forEach((route) => {
            router.addRoute(route as unknown as RouteRecordRaw);
          });
          router.addRoute(PAGE_NOT_FOUND_ROUTE as unknown as RouteRecordRaw);
          permissionStore.setDynamicAddedRoute(true);
        }
        goHome && (await router.replace(homePath));
      }
      return userInfo;
    },
    async getUserInfoAction(): Promise<User | null> {
      if (!this.getToken) {
        if (import.meta.env.VITE_GLOB_SSO == 'true') {
          try {
            const handler = new HttpHandler('BP.WF.HttpHandler.WF_SSO');
            const { token } = await handler.DoMethodReturnJson<Recordable>('SSO_GetSTByTGT');
            this.setToken(token);
          } catch (e: any) {
            message.error(e.toString());
            router.push(PageEnum.SSO);
            return null;
          }
        } else {
          return null;
        }
      }
      const webUser = await this.fetchUserInfo();

      // 先不做权限，默认为管理员
      this.setRoleList([RoleEnum.SUPER]);
      const user = getAuthCache(WEB_USER_INFO_KEY);
      // @ts-ignore
      webUser.SysLang = !!user ? user.SysLang : 'CH';
      this.setWebUser(webUser);
      this.setUserInfo(webUser);
      this.setToken(webUser.Token);
      return webUser;
    },
    async getUserInfoNotSSOAction(): Promise<User | null> {
      const webUser = await this.fetchUserInfo();
      // 先不做权限，默认为管理员
      this.setRoleList([RoleEnum.SUPER]);
      const user = getAuthCache(WEB_USER_INFO_KEY);
      // @ts-ignore
      webUser.SysLang = !!user ? user.SysLang : 'CH';
      this.setWebUser(webUser);
      this.setUserInfo(webUser);
      this.setToken(webUser.Token);
      return webUser;
    },
    /**
     * @description: logout
     */
    async logout(goLogin = false) {
      if (this.getToken) {
        try {
          const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
          await handler.DoMethodReturnString('Default_LogOut');
        } catch {
          console.log('注销Token失败');
        }
      }
      setCookie('logoutPersonNo', WebUser?.No as string, 5);
      this.setToken(undefined);
      this.setSessionTimeout(false);
      this.setUserInfo(null);
      this.setWebUser(null);
      const getSystemNo = localStorage.getItem('SystemNo');
      if (getSystemNo) {
        localStorage.removeItem('SystemNo');
      }
      goLogin && router.push(PageEnum.BASE_LOGIN);
    },

    async getPageID() {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
      const getPages = await handler.DoMethodReturnJson('SystemPortal_GenerPages');

      let pageID = 0;
      if (getPages.length > 0) {
        pageID = getPages[0].No;
      }
      return pageID;
    },

    /**
     * @description: Confirm before logging out
     */
    confirmLoginOut() {
      const { createConfirm } = useMessage();
      const { t } = useI18n();
      createConfirm({
        iconType: 'warning',
        title: () => h('span', '温馨提醒'),
        content: () => h('span', '是否确认退出系统？'),
        onOk: async () => {
          const { VITE_GLOB_OSModel } = getAppEnvConfig();
          if (CCBPMRunModel.SAAS == WebUser.CCBPMRunModel) {
            if (VITE_GLOB_OSModel === '2') {
              const OrgNo = WebUser.OrgNo;
              const No = WebUser.No;
              this.setToken(undefined);
              this.setSessionTimeout(false);
              this.setUserInfo(null);
              this.setWebUser(null);
              router.push(`/SelectOrg?OrgNo=${OrgNo}&UserNo=${No}`);
            } else {
              await this.logout(true);
            }
          } else {
            await this.logout(true);
          }
        },
      });
    },
  },
});

export function useUserStoreWithOut() {
  return useUserStore(store);
}
