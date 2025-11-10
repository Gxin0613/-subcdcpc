// 编辑类型
export enum EditType {
  // 可编辑
  Edit = 0,
  // 不可删除
  UnDel = 1,
  // 只读,不可删除。
  Readonly = 2,
}

//  字段控件类型
export enum UIContralType {
  // 文本框
  TB = 0,
  // 下拉框
  DDL = 1,
  // CheckBok
  CheckBok = 2,
  // 单选择按钮
  RadioBtn = 3,
  // 地图定位
  MapPin = 4,
  // 录音控件
  MicHot = 5,
  // 附件控件
  AthShow = 6,
  // 手机拍照控件
  MobilePhoto = 7,
  // 手写签名版
  HandWriting = 8,
  // 超链接
  HyperLink = 9,
  // 文本
  Lab = 10,
  // 图片
  FrmImg = 11,
  // 图片附件
  FrmImgAth = 12,
  // 身份证号
  IDCard = 13,
  // 签批组件
  SignCheck = 14,
  // 评论组件
  FlowBBS = 15,
  // 系统定位
  Location = 16,
  // 公文正文组件
  GovDocFile = 110,
  // 发文字号
  DocWord = 17,
  // 收文字号
  DocWordReceive = 170,
  //按钮
  Btn = 18,
  // 流程进度图
  JobSchedule = 50,
  // 大块文本Html(说明性文字)
  FrmHtml = 60,
  //测试
  Test = 999,
  // 评分
  Score = 101,
  // 公文字号
  WordNum = 102,

  //颜色控件
  LabColor = 111,
  // 固定
  Fixed = 1000,

  AthTable = 600,
}
// 对应的控件存储在：D:\CCFlowVue3\src\WF\Admin\FoolFormDesigner\Img

// const UIJH = [
//   { No: 18, Name: '评分控件', EnName: 'TS.FrmUI.Centr', Img: 'xxxx', Icon: 'xxxx' },
//   { No: 19, Name: '评分控23件', EnName: 'TS.FrmUI.Centr', Img: 'xxxx', Icon: 'xxxx' },
//   { No: 23, Name: '评分控23件', EnName: 'TS.FrmUI.Centr', Img: 'xxxx', Icon: 'xxxx' },
//   { No: 19, Name: '评分控23件', EnName: 'TS.FrmUI.Centr', Img: 'xxxx', Icon: 'xxxx' },
//   { No: 19, Name: '评分控23件', EnName: 'TS.FrmUI.Centr', Img: 'xxxx', Icon: 'xxxx' },
//   { No: 170, Name: '收文字号', EnName: 'TS.FrmUI.DWrod', Img: 'xxxx', Icon: 'xxxx' },
// ]

// 逻辑类型
export enum FieldTypeS {
  // 普通类型
  Normal = 0,
  // 枚举类型
  Enum = 1,
  // 外键
  FK = 2,
}

// 字段类型
export enum FieldType {
  // 正常的
  Normal,
  // 主键
  PK,
  // 外键
  FK,
  // 枚举
  Enum,
  // 既是主键又是外键
  PKFK,
  // 既是主键又是枚举
  PKEnum,
  // 关连的文本.
  RefText,
  // 虚拟的
  NormalVirtual,
  // 多值的
  MultiValues,
}

// 实体附件类型
export enum BPEntityAthType {
  // 无
  None,
  // 单附件
  Single,
  // 多附件
  Multi,
}

// 附件类型
export enum AdjunctType {
  // 不需要附件。
  None,
  // 图片
  PhotoOnly,
  // word 文档。
  WordOnly,
  // 所有的类型
  ExcelOnly,
  // 所有的类型。
  AllType,
}

// 实体类型
export enum EnType {
  // 系统实体
  Sys,
  // 管理员维护的实体
  Admin,
  // 应用程序实体
  App,
  // 第三方的实体（可以更新）
  ThirdPartApp,
  // 视图(更新无效)
  View,
  // 可以纳入权限管理
  PowerAble,
  // 其他
  Etc,
  // 明细或着点对点。
  Dtl,
  // 点对点
  Dot2Dot,
  // XML　类型
  XML,
  // 扩展类型，它用于查询的需要。
  Ext,
}

// 移动到显示方式
export enum MoveToShowWay {
  // 不显示
  None,
  // 下拉列表
  DDL,
  // 平铺
  Panel,
}
