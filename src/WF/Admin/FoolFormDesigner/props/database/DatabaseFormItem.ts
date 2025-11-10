// 普通字段类型枚举及相关属性方法
export enum DBEnums {
  /// 文本框
  TB = 0,
  /// 下拉框
  DDL = 1,
  /// CheckBok
  CheckBok = 2,
  /// 单选择按钮
  RadioBtn = 3,
  /// 地图定位
  MapPin = 4,
  /// 录音控件
  MicHot = 5,
  /// 附件展示控件
  AthShow = 6,
  /// 手机拍照控件
  MobilePhoto = 7,
  /// 手写签名版
  HandWriting = 8,
  /// 超链接
  HyperLink = 9,
  /// 文本
  Lab = 10,
  /// 图片
  FrmImg = 11,
  /// 图片附件
  FrmImgAth = 12,
  /// 身份证号
  IDCard = 13,
  /// 签批组件
  SignCheck = 14,
  /// 评论组件
  FlowBBS = 15,
  /// 系统定位
  Fixed = 16,
  /// 公文正文组件
  GovDocFile = 110,
  /// 发文字号
  DocWord = 17,
  /// 按钮
  Btn = 18,
  /// 收文字号
  DocWordReceive = 170,
  /// 流程进度图
  JobSchedule = 50,
  /// 大块文本Html(说明性文字)
  BigText = 60,
  /// 评分
  Score = 101,
  /// 关联流程表单
  LinkRefFlow = 200,
  /// 流程评论
  FlowComment = 201,
  /// 流程进度
  FlowProgress = 202,
}

export const EnTypeMap = new Map([
  [DBEnums.TB, 'TS.Sys.MapAttr'],
  [DBEnums.Score, 'TS.FrmUI.SelfCommonent.ExtScore'],
  [DBEnums.LinkRefFlow, 'TS.FrmUI.SelfCommonent.ExtScore'],
  [DBEnums.FlowComment, 'TS.FrmUI.SelfCommonent.ExtScore'],
  [DBEnums.FlowProgress, 'TS.FrmUI.SelfCommonent.ExtScore'],
  [DBEnums.Btn, 'TS.FrmUI.SelfCommonent.FrmBtn'],
  [DBEnums.DocWord, 'TS.FrmUI.SelfCommonent.ExtScore'],
  [DBEnums.GovDocFile, 'TS.FrmUI.SelfCommonent.ExtScore'],
  [DBEnums.Fixed, 'TS.FrmUI.SelfCommonent.ExtScore'],
  [DBEnums.FlowBBS, 'TS.FrmUI.SelfCommonent.FlowBBS'],
  [DBEnums.SignCheck, 'TS.FrmUI.SelfCommonent.SignCheck'],
  [DBEnums.IDCard, 'TS.FrmUI.SelfCommonent.MapAttrCard'],
  [DBEnums.FrmImgAth, 'TS.FrmUI.SelfCommonent.ExtAthSingle'],
  [DBEnums.FrmImg, 'TS.FrmUI.SelfCommonent.ExtScore'],
  [DBEnums.Lab, 'TS.FrmUI.SelfCommonent.ExtScore'],
  [DBEnums.HyperLink, 'TS.FrmUI.SelfCommonent.FrmLink'],
  [DBEnums.HandWriting, 'TS.FrmUI.SelfCommonent.ExtScore'],
  [DBEnums.MobilePhoto, 'TS.FrmUI.SelfCommonent.ExtScore'],
  [DBEnums.AthShow, 'TS.FrmUI.SelfCommonent.ExtScore'],
  [DBEnums.CheckBok, 'TS.FrmUI.SelfCommonent.ExtScore'],
  [DBEnums.DDL, 'TS.FrmUI.SelfCommonent.ExtScore'],
  [DBEnums.BigText, 'TS.FrmUI.MapAttrString'],
]);

export const fieldType = new Map<string, number>([
  ['text', 1],
  ['textBig', 1],
  ['integer', 2],
  ['number', 3],
  ['checkbox', 4],
  ['date', 6],
  ['datetime', 7],
  ['amount', 8],
]);
