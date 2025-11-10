/**
 * 说明:
 * 1. 该类是一个接口文件需要引入到自己的前端vue项目中去.
 * 10. 更多的帮助: 请参考: https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=8095471&doc_id=31094
 */
/*************************************  管理员接口  ******************************/
/**
 * 流程设计
 * @returns url
 */
export function Menu_Admin_Flows(data) {
  const host = data.host;
  const token = data.token;
  const url = `${host}/#/WF/Port?DoWhat=Component&EnName=TreeEns_FlowSort2Flow&token=${token}`;
  return url;
}
/**
 *流程设计器:设计单个流程
 * @param flowNo 流程编号
 * @returns
 */
export function Admin_Flow_One(data) {
  // const url = `${host}/#WF/Port?DoWhat=FlowDesign&FlowNo=${flowNo}&token=${token}`;
  const host = data.host;
  const token = data.token;
  const flowNo = data.flowNo;
  const url = `${host}/#/WF/Port?DoWhat=Component&EnName=TS.WF.FD.FlowJiJian&PKVal=${flowNo}&Token=${token}`;
  return url;
}

/**
 * 表单设计
 * @returns url
 */
export function Menu_Admin_Frms(data) {
  const host = data.host;
  const token = data.token;
  const url = `${host}/#/WF/Port?DoWhat=Component&EnName=TreeEns_FrmSort2Frm&token=${token}`;
  return url;
}
/**
 *表单设计器:设计单个表单
 * @param frmID 表单ID.
 *@returns
 */
export function Admin_Frm_One(data) {
  const host = data.host;
  const token = data.token;
  const frmID = data.frmID;
  // http://localhost:3009/#/WF/Port?DoWhat=FrmDesign&FrmID=En_F002&Token=477c784459444e349a1239248fd6ddd0
  const url = `${host}/#WF/Port?DoWhat=FrmDesign&FrmID=${frmID}&token=${token}`;

  return url;
}
/**
 * 白色大屏设计
 * @param rptID 表单ID. @llj
 * @returns
 */
export function Menu_Admin_RptWhite(data) {
  const host = data.host;
  const token = data.token;
  const rptID = data.rptID;
  const url = `${host}/#/WF/Port?DoWhat=RptWhite&PageID=${rptID}&edit=1&token=${token}`;
  return url;
}
/**
 * 蓝色大屏设计
 * @param rptID 报表ID
 * @returns 设计的url.
 */
export function Menu_Admin_RptBlue(data) {
  const host = data.host;
  const token = data.token;
  const rptID = data.rptID;
  const url = `${host}#/chart/home/${rptID}?token=${token}`;
  return url;
}

/**
 * 视图
 * @param No ID
 * @returns 设计的url.
 */
export function Menu_Admin_DBView(data) {
  const host = data.host;
  const token = data.token;
  const EnName = data.EnName;
  const No = data.No;
  const url = `${host}/#/WF/Port?DoWhat=En&EnName=${EnName}&PKVal=${No}&FrmID=${No}&Token=${token}`;
  return url;
}

/**
 * 组织结构设计
 * @returns url
 */
export function Menu_Admin_Orgs(data) {
  const host = data.host;
  const token = data.token;
  const url = `${host}/#/WF/Port?DoWhat=Component&EnName=TreeEns_Dept2Emp&token=${token}`;
  return url;
}
/**
 * 数据源
 * @returns url
 */
export function Menu_Admin_DBSrc(data) {
  const host = data.host;
  const token = data.token;
  const url = `${host}/#/WF/Port?DoWhat=Component&EnName=TreeEns_DBSrc&token=${token}`;
  return url;
}
/*********************** 菜单接口************************************* */
//发起
export function Menu_Flow_Start(data) {
  const host = data.host;
  const token = data.token;
  const url = `${host}/#/WF/Port?DoWhat=Component&EnName=GL_Start&token=${token}`;
  return url;
}
//待办
export function Menu_Flow_Todolist(data) {
  const host = data.host;
  const token = data.token;
  const url = `${host}/#/WF/Port?DoWhat=Component&EnName=GL_Todolist&token=${token}`;
  return url;
}
//在途
export function Menu_Flow_Runing(data) {
  const host = data.host;
  const token = data.token;
  const url = `${host}/#/WF/Port?DoWhat=Component&EnName=GL_Runing&token=${token}`;
  return url;
}
//近期
export function Menu_Flow_Nearly(data) {
  const host = data.host;
  const token = data.token;
  const url = `${host}/#/WF/Port?DoWhat=Component&EnName=GL_RecentWork&token=${token}`;
  return url;
}
//已完成
export function Menu_Flow_Complate(data) {
  const host = data.host;
  const token = data.token;
  const url = `${host}/#/WF/Port?DoWhat=Component&EnName=GL_Complete&token=${token}`;
  return url;
}
//抄送
export function Menu_Flow_CC(data) {
  const host = data.host;
  const token = data.token;
  const url = `${host}/#/WF/Port?DoWhat=Component&EnName=GL_CC&token=${token}`;
  return url;
}
//草稿
export function Menu_Flow_Draft(data) {
  const host = data.host;
  const token = data.token;
  const url = `${host}/#/WF/Port?DoWhat=Component&EnName=GL_Draft&token=${token}`;
  return url;
}
//消息
export function Menu_Flow_Msg(data) {
  const host = data.host;
  const token = data.token;
  const url = `${host}/#/WF/Port?DoWhat=Component&EnName=GL_Msg&token=${token}`;
  return url;
}
//综合查询
export function Menu_Flow_Search(data) {
  const host = data.host;
  const token = data.token;
  const url = `${host}/#/WF/Port?DoWhat=EntitySearch&EnName=TS.FlowData.GenerWorkFlowView&token=${token}`;
  return url;
}
//我的设置菜单
export function MySettingMenu(data) {
  const host = data.host;
  const token = data.token;
  const WebUser = data.WebUser;
  const url = `${host}/#/WF/Port?DoWhat=En&EnName=TS.Port.MySetting&PKVal=${WebUser.No}&token=${token}`;
  return url;
}
//白色大屏
export function RptWhiteView(data) {
  const host = data.host;
  const token = data.token;
  const No = data.No;
  const url = `${host}/#/WF/Port?DoWhat=RptWhite&Edit=0&PageID=${No}&token=${token}`;
  return url;
}
//蓝色大屏
export function RptBlueView(data) {
  const host = data.host;
  const No = data.No;
  const url = `${host}#/chart/preview/${No}`;
  return url;
}
/*************************************  流程页面接口  ******************************/

/**
 * 工作处理器
 * @param workID 工作ID,如果WorkID是0, 则会自动创建一个新的WorkID.
 * @param paras 可选参数：可以向表单传入的参数,格式：&Tel=18660153393&Addr=山东济南.
 * @returns 直接打开MyFlow工作处理器的url.
 */
export function Flow_MyFlowByFlowNo(data) {
  const host = data.host;
  const token = data.token;
  const flowNo = data.flowNo;
  const paras = data.paras;
  let url = `${host}/#/WF/Port?DoWhat=StartFlow&FlowNo=${flowNo}&token=${token}`;
  if (paras) {
    url = `${host}/#/WF/Port?DoWhat=StartFlow&FlowNo=${flowNo}${paras}&token=${token}`;
  }

  return url;
}
export function Flow_MyFlow(data) {
  const host = data.host;
  const token = data.token;
  const workID = data.workID;
  const paras = data.paras;
  const url = `${host}/#/WF/Port?DoWhat=StartFlow&WorkID=${workID}${paras}&token=${token}`;
  return url;
}
/**
 * 工作查看器
 * @param workID 工作ID,如果WorkID是0, 则会自动创建一个新的WorkID.
 * @returns 直接打开MyView工作查看器的url.
 */
export function Flow_MyView(data) {
  const host = data.host;
  const token = data.token;
  const workID = data.workID;
  const url = `${host}/#/WF/Port?DoWhat=MyView&WorkID=${workID}&token=${token}`;
  return url;
}
/**
 * 抄送查看器
 * @param workID 工作ID,如果WorkID是0, 则会自动创建一个新的WorkID.
 * @returns 直接打开MyCC工作查看器的url.
 */
export function Flow_MyCC(data) {
  const host = data.host;
  const token = data.token;
  const flowNo = data.flowNo;
  const workID = data.workID;
  const url = `${host}/#/WF/Port?DoWhat=MyCC&FlowNo=${flowNo}&WorkID=${workID}&token=${token}`;
  return url;
}
export function Flow_Track(data) {
  // http://localhost:3009/#/WF/Port?DoWhat=Vue3Track&FK_Flow=114&WorkID=1888671138&Token=eff9ed6b38934e08a5ab1b595e26f909
  const host = data.host;
  const token = data.token;
  const flowNo = data.flowNo;
  const workID = data.workID;
  const url = `${host}/#/WF/Port?DoWhat=Vue3Track&FK_Flow=${flowNo}&WorkID=${workID}&token=${token}`;
  return url;
}

export function Flow_Search(data) {
  // http://localhost:3009/#/WF/Port?DoWhat=Vue3Track&FK_Flow=114&WorkID=1888671138&Token=eff9ed6b38934e08a5ab1b595e26f909
  const host = data.host;
  const token = data.token;
  const flowNo = data.flowNo;
  const url = `${host}/#/WF/Port?DoWhat=SearchFlow&FlowNo=${flowNo}&token=${token}`;
  return url;
}
//高代码 实体查询
export function FixedUrl_Search(data) {
  const host = data.host;
  const token = data.token;
  const EnName = data.EnName;
  const url = `${host}/#/WF/Port?DoWhat=EntitySearch&EnName=${EnName}&token=${token}`;
  return url;
}
//高代码 白色大屏
export function DataVUrl_Search(data) {
  const host = data.host;
  const token = data.token;
  const EnName = data.EnName;
  const url = `${host}/#/WF/Port?DoWhat=HomePage&EnName=${EnName}&token=${token}`;
  return url;
}
//流程相关菜单
export function LcUrl_Search(data) {
  const host = data.host;
  const token = data.token;
  const EnName = data.EnName;
  const url = `${host}/#/WF/Port?DoWhat=Component&EnName=${EnName}&token=${token}`;
  return url;
}
//自定义链接
export function LcUrl_SelfUrl(data) {
  const host = data.host;
  const token = data.token;
  const No = data.no;
  const url = `${host}/#/WF/Port?DoWhat=SelfUrl&No=${No}&token=${token}`;
  return url;
}

//列表视图
export function GLDBViewUrl_SelfUrl(data) {
  const host = data.host;
  const token = data.token;
  const frmid = data.frmid;
  const url = `${host}/#/WF/Port?DoWhat=GenerList&EnName=GL_DBGenerList&FrmID=${frmid}&token=${token}`;
  return url;
}
//左树右表视图
export function TreeEnsDBViewUrl_SelfUrl(data) {
  const host = data.host;
  const token = data.token;
  const frmid = data.frmid;
  const url = `${host}/#/WF/Port?DoWhat=TreeEnsDBView&FrmID=${frmid}&token=${token}`;
  return url;
}
//分页视图
export function SearchBillViewUrl_SelfUrl(data) {
  const host = data.host;
  const token = data.token;
  const frmid = data.frmid;
  const url = `${host}/#/WF/Port?DoWhat=SearchDBList&FrmID=${frmid}&token=${token}`;
  return url;
}
/*************************************  实体单据接口  ******************************/
/**
 * 单据列表
 * @param frmID 单据ID
 * @param paras  查询参数, 比如: &Key=123
 * @returns 单据查询的url.
 */
export function Bill_Search(data) {
  const host = data.host;
  const token = data.token;
  const frmID = data.frmID;
  const paras = data.paras;
  const url = `${host}/#/WF/Port?DoWhat=Vue3Track&FK_Flow=${frmID}${paras}&token=${token}`;
  return url;
}

export function EntityBill_Search(data) {
  const host = data.host;
  const token = data.token;
  const frmID = data.frmID;
  const url = `${host}/#/WF/Port?DoWhat=EntityBill&FrmID=${frmID}&token=${token}`;
  return url;
}
export function EntityNoName_Search(data) {
  const host = data.host;
  const token = data.token;
  const frmID = data.frmID;
  // const url = `${AppConfig.AppCenterHost}/#/WF/Port?DoWhat=EntityNoName&FrmID=${frmID}&token=${token}`;
  const url = `${host}/#/WF/Port?DoWhat=EntityNoName&FrmID=${frmID}&token=${token}`;
  return url;
}
/**
 * 单据分析
 * @param frmID 单据ID
 * @param paras  查询参数, 比如: &Key=123
 * @returns 单据查询的url.
 */
export function Bill_Group(data) {
  const host = data.host;
  const token = data.token;
  const frmID = data.frmID;
  const paras = data.paras;
  const url = `${host}/#/WF/Port?DoWhat=Vue3Track&FK_Flow=${frmID}${paras}&token=${token}`;
  return url;
}
/**
 * 新建单据实例
 * @param frmID 单据ID
 * @param paras 查询参数, 比如: &Addr=山东济南&Tel=18660153393
 * @returns 新建单据的url.
 */
export function Bill_NewBill(data) {
  const host = data.host;
  const token = data.token;
  const frmID = data.frmID;
  const paras = data.paras;
  const url = `${host}/#/WF/Port?DoWhat=Vue3Track&FK_Flow=${frmID}${paras}&token=${token}`;
  return url;
}
/**
 * 单据卡片信息
 * @param workID 流程实例ID
 * @param frmID 单据ID
 * @returns 卡片信息url.
 */
export function Bill_MyBill(data) {
  const host = data.host;
  const token = data.token;
  const frmID = data.frmID;
  const param = data.param;
  const url = `${host}/#/WF/Port?DoWhat=Vue3Track&FK_Flow=${frmID}${param}&token=${token}`;
  return url;
}

/**
 * 仪表盘
 * @returns url
 */
export function Menu_Home_Index(data) {
  const host = data.host;
  const token = data.token;
  const url = `${host}/#/WF/Port?DoWhat=HomePage&token=${token}`;
  return url;
}

/**
 * 仪表盘切换
 * @returns url
 */
export function Menu_Home_Index_Q(data) {
  const host = data.host;
  const token = data.token;
  const EnName = data.EnName;
  const url = `${host}/#/WF/Port?DoWhat=HomePage&EnName=${EnName}&token=${token}`;
  return url;
}
