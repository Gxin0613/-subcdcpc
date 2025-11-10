export enum PageEnum {
  // basic login path
  BASE_LOGIN = '/login',
  // basic home path
  BASE_HOME = '/WF/Comm/DataV',
  // Middleware home path
  BASE_MIDDLE_HOME = '/Middle',
  BASE_CCMobile_HOME = '/CCMobilePortal/Home',
  // BASE_Portal_HOME = '/portal',
  BASE_RptPortal_HOME = '/portal/rptContent',
  // BASE_RptContent_HOME = '/rptContent',
  // error page path
  ERROR_PAGE = '/exception',
  // error log page path
  ERROR_LOG_PAGE = '/error-log/list',
  //DBInstall page
  DB_INSTALL = '/DBInstall',
  //SSO page
  SSO = '/sso',
  //SelectOrg page
  SELECT_ORG = '/SelectOrg',
  //SAAS AdminLogin page
  SAAS_ADMIN_LOGIN = '/SaasAdminLogin',
  //SAAS Login page
  SAAS_LOGIN = '/SaasLogin',
  //SAAS Login page
  SAAS_LOGIN_Model = '/SaasLoginModel',
  //SAAS Admin Home
  SAAS_ADMIN_HOME = '/SaasHome',
  //Group Admin Home
  GROUP_ADMIN_HOME = '/GroupHome',
  //Group Login page
  GROUP_LOGIN = '/GroupLogin',
  //SAASOperation Login page
  SAAS_OP_Login = '/OpLogin',
  //SAASOperation ChooseRegister page
  SAAS_OP_ChooseRegister = '/ChooseRegister',
  //SAASOperation Register page
  SAAS_OP_Register = '/Register',
  //钉钉集成
  DingDing = '/DingDing',
  //微信
  WeChatEnterprise = '/WeChatEnterprise',
  //微信服务号
  WeChatService = '/WeChatService',
  //微信小程序
  WXApplet = '/WXApplet',
  //企业微信第三方应用
  WeChatOauth2 = '/WeChatOauth2',
  //验签免登录
  SSOSign = '/SSOSign',
  //MobileSSO page
  MobileSSO = '/MobileSSO',
  //移动端页面跳转
  Do = '/CCMobile/Do',
  // /WF/Port page
  WF_Port = '/WF/Port',
  //调查问卷
  FEForward = '/FEForward',
  //二维码扫描
  ScanGuide = '/CCMobile/ScanGuide',
  //公共页面访问
  CommonPage = '/CommonPage',
}
export const PageWrapperFixedHeightKey = 'PageWrapperFixedHeight';
