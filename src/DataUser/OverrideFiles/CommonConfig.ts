/*
1. 该页面旨在解决各个项目所需功能显示问题，定义各个'是否显示'变量.
2. 为了不与其他字段冲突,命名加前缀'Hide_'
3. 根据项目差异，自行定义，自行调用.
*/
import { getAppEnvConfig } from '/@/utils/env';

const { VITE_GLOB_KKFILE_PreviewPathOfAth } = getAppEnvConfig();
export const CommonConfig = {
  FlowOpenModel: 2, // 0、侧滑弹窗打开  1、居中弹窗打开 2、Tab页签打开 3、新网页打开
  GroupRptWhitePrefix: 'GroupIncRptWhite_', // 集团版大屏key前缀
  SaasRptWhitePrefix: 'SaasRptWhite_',
  // CustomOrgClassName: 'TS.Port.YNJT.AdminGroup.Org', // 自定义组织类名，适用于需要重写的情况
  CustomOrgClassName: '', // 自定义组织类名，适用于需要重写的情况
  EnableCustomRptWhite: true,
  ToolbarPos: 0, //0=顶部，1=底部 发送工具栏的位置.
  Hide_IsRead: true, //轨迹中是否显示已阅读: true 显示
  Hide_IsOpenFrm: true, //时间轴中是否显示查看表单:true 显示
  Hide_HastenWork: true, //在途是否显示催办按钮:true 显示
  Hide_IsTodoList: true, //待办列表中是否显示查看授权:true 显示
  UserICon: 'DataUser/Siganture', //默认的用户签名地址
  UserAvatar: 'DataUser/UserIcon', //默认人员头像路径
  UserIConExt: '.jpg',
  UserAvaterExt: '.png',
  ReturnWin_IsBackTracking_Selected: false, //是否强制设置退回并原路返回?
  ReturnWin_IsKillEtcThread_Show: false, //是否显示:全部子线程退回.
  FrmDevelop_IsShowStar: true, //开发者表单解析的时候，是否显示 star .

  //是否记录用户登录，发送日志,admin的路程设计日志.
  IsRecordUserLog: false,

  //审核组件是否显示常用短语
  IsShowWorkCheckUsefulExpres: true,
  //是否显示已审核完成的图标，已办结
  IsShowComplteCheckIcon: false,

  //附件信息配置
  IsOnlinePreviewOfAth: true, //是否在线预览
  PreviewPathOfAth: VITE_GLOB_KKFILE_PreviewPathOfAth, //附件预览服务器地址，在上传附件后预览时可配置此处的预览服务器地址
  IsAddTaskOfKKFile: false, // 附件是否加入KKFile队列（大文件预加载）

  IsHideMobileBack: false, //是否隐藏移动端返回标签
  RichTextType: 'tinymce',
  IsClearSearchCond: true, //是否清空查询条件

  //地图，当前值是个人注册获取，客户使用的时候需要注册获取
  MapKey: 'f2b462c587df6a2f2421133975b130e8',
  MapJsCode: 'cfac9915c4900941da164e1a70ebfa8a',
  CorpID: 'wx8eac6a18c5efec30',
  CorpSecret: 'ygZRZ8C3Z3667ChQn4lyzc-x7IqVUKFRnBp4hNgoPi8',

  //QMS的配置
  IsQMS: false, //是否QMS的配置

  //VSTO表单可编辑状态下经典表单查看是否可编辑
  IsEditVSTOToFrmFool:true, //默认可编辑

  //广州市政的配置
  IsGZFrm: false, //是否广州市政的配置
  //千丁数科配置
  IsQDSK: false, //是否千丁数科的配置
  //海南配置
  IsHN: false, //是否海南的配置
  GZFrmTitles: [
    { NO: 'ND1Rpt', Name: '立项申请审批表' },
    { NO: 'ND2Rpt', Name: '收入合同评审表' },
    { NO: 'ND3Rpt', Name: '开票申请表' },
    { NO: 'ND4Rpt', Name: '主营分包合同审批表' },
    { NO: 'ND5Rpt', Name: '非主营支出合同审批表' },
    { NO: 'ND6Rpt', Name: '主营分包拨付审批表' },
    { NO: 'ND7Rpt', Name: '收费管理' },
    { NO: 'ND8Rpt', Name: '轨道收入子项确认表' },
    { NO: 'ND9Rpt', Name: '非轨道收入子项确认表' },
    { NO: 'ND10Rpt', Name: '生产流程' },
    { NO: 'ND11Rpt', Name: '项目总工作量审批表' },
    { NO: 'ND12Rpt', Name: '项目送审流程表' },
    { NO: 'ND13Rpt', Name: '项目工作量变更审批表' },
    { NO: 'ND15Rpt', Name: '项目状态变更' },
    { NO: 'ND16Rpt', Name: '结算价批复登记表' },
    { NO: 'ND18Rpt', Name: '工作量核算申请表' },
  ],
  SelfFrmShowType: 'Tab', //Table 表格显示， Tab显示
  
  //高代码En页面默认左侧功能显示
  IsDefaultShowEnMethod: true,
};
export function getEvnUrl(str: any) {
  const mobilUrlTest = 'https://app-ding.digitalhainan.com.cn:10106/tdt/wxmapdev';
  const mobilUrl = 'https://app-ding.digitalhainan.com.cn:10106/tdt/wxmap';
  const layerServerHCTest = 'https://app-ding.digitalhainan.com.cn:10161/height2/rest/services/两违/工作流测试_蔬菜基地核查信息/MapServer/0';
  const layerServerMPTest = 'https://app-ding.digitalhainan.com.cn:10161/height2/rest/services/两违/工作流测试_蔬菜基地摸排信息/MapServer/0';
  const layerServerMP = 'http://hniplan.hi.cegn.cn/height2/rest/services/两违/工作流正式_蔬菜基地摸排信息/MapServer/0';
  const layerServerHC = 'http://hniplan.hi.cegn.cn/height2/rest/services/两违/工作流正式_蔬菜基地核查信息/MapServer/0';
  const mapLocationUrlTest = 'https://app-ding.digitalhainan.com.cn:10704/sjztcs/app/onemap/index.html';
  const mapLocationUrl = 'https://app-ding.digitalhainan.com.cn:10659/sjzt/app/onemap/index.html';
  const isTest = false;
  if (isTest) {
    if (str == EnvVariable.MobilUrl) {
      return mobilUrlTest;
    }
    if (str == EnvVariable.LayerServerMP) {
      return layerServerMPTest;
    }
    if (str == EnvVariable.LayerServerHC) {
      return layerServerHCTest;
    }
    if (str == EnvVariable.mapLocationUrl) {
      return mapLocationUrlTest;
    }
  } else {
    if (str == EnvVariable.MobilUrl) {
      return mobilUrl;
    }
    if (str == EnvVariable.LayerServerMP) {
      return layerServerMP;
    }
    if (str == EnvVariable.LayerServerHC) {
      return layerServerHC;
    }
    if (str == EnvVariable.mapLocationUrl) {
      return mapLocationUrl;
    }
  }
}
export enum EnvVariable {
  // 移动端url
  MobilUrl,
  // web端url
  LayerServerMP,
  LayerServerHC,
  mapLocationUrl,
}
