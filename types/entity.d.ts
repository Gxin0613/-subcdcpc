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
}

export const fieldType = new Map<string, number>([
  ['text', 1],
  ['integer', 2],
  ['number', 3],
  ['checkbox', 4],
  ['date', 6],
  ['datetime', 7],
  ['amount', 8],
]);

// 附件属性
export interface FrmAttachment {
  AtPara: string;
  AthRunModel: number;
  AthSaveWay: number;
  AthUploadWay: number;
  CtrlWay: number;
  DataRefNoOfObj: string;
  DeleteWay: number;
  Exts: string;
  FK_MapData: string;
  FK_Node: number;
  FileMaxSize: number;
  FileType: number;
  GUID: string;
  GroupID: number;
  H: number;
  IsAutoSize: string;
  IsDownload: string;
  IsExpCol: string;
  IsIdx: number;
  IsNote: string;
  IsShowTitle: string;
  IsUpload: string;
  IsVisable: string;
  MyPK: string;
  Name: string;
  NoOfObj: string;
  NumOfUpload: number;
  PicUploadType: number;
  ReadRole: number;
  Sort: string;
  TopNumOfUpload: number;
  UploadFileNumCheck: number;
  UploadType: number;
  W: number;
  X: number;
  Y: number;
}

// 分组属性
export interface GroupField {
  OID: string | number;
  Lab: string;
  FrmID: string;
  CtrlType: string;
  CtrlID: string;
  IsZDMobile: number;
  ShowType: number;
  ShowTypeText: string;
  Idx: number;
  GUID: string;
  AtPara: string;
  IsZDPC: number;
}

// 字段属性
export interface MapAttr {
  MyPK: string;
  FK_MapData: string;
  KeyOfEn: string;
  Name: string;
  DefVal: string;
  DefValType: number;
  UIContralType: number;
  MyDataType: number;
  LGType: number;
  LGTypeText: string;
  UIWidth: number;
  UIHeight: number;
  MinLen: number;
  MaxLen: number;
  UIBindKey: string;
  UIRefKey: string;
  UIRefKeyText: string;
  ExtIsSum: number;
  UIVisible: number;
  UIIsEnable: number;
  UIIsLine: number;
  UIIsInput: number;
  //IsSecret: number;
  //IsRichText: number;
  IsSupperText: number;
  FontSize: number;
  IsSigan: number;
  GUID: string;
  EditType: number;
  Tag: string;
  Tag1: string;
  Tag2: string;
  Tag3: string;
  Tip: string;
  ColSpan: number;
  LabelColSpan: number;
  RowSpan: number;
  GroupID: string;
  IsEnableInAPP: string;
  CSSCtrl: string;
  CSSLabel: string;
  Idx: number;
  ICON: string;
  AtPara: string;
  TextModel: number;
}

// 主表属性
export interface MapData {
  No: string;
  Name: string;
  FormEventEntity: string;
  EnPK: string;
  PTable: string;
  PTableModel: number;
  UrlExt: string;
  Dtls: string;
  FrmW: number;
  FrmH: number;
  TableCol: number;
  Tag: string;
  FK_FormTree: string;
  FrmType: number;
  FrmTypeText: string;
  FrmShowType: number;
  EntityType: number;
  EntityTypeText: string;
  IsEnableJs: number;
  AppType: number;
  DBSrc: string;
  BodyAttr: string;
  Note: string;
  Designer: string;
  DesignerUnit: string;
  DesignerContact: string;
  Idx: number;
  GUID: string;
  Ver: string;
  Icon: string;
  FlowCtrls: string;
  AtPara: string;
  OrgNo: string;
  FrmRBs_AutoNum: string;
  FrmEvents_AutoNum: string;
  MapFrames_AutoNum: string;
  FrmImgs_AutoNum: string;
  FrmAttachments_AutoNum: string;
  FrmEventsNum: string;
  MapDtls_AutoNum: string;
  FrmImgAths_AutoNum: string;
  MapExts_AutoNum: string;
}

// 从表
export interface MapDtl {
  No: string;
  Name: string;
  Alias: string;
  FK_MapData: string;
  PTable: string;
  GroupField: string;
  RefPK: string;
  FEBD: string;
  Model: number;
  ModelText: string;
  DtlVer: number;
  RowsOfList: number;
  IsEnableGroupField: string;
  IsShowSum: string;
  IsShowIdx: string;
  IsCopyNDData: string;
  IsHLDtl: string;
  IsReadonly: string;
  IsShowTitle: string;
  IsView: string;
  IsInsert: string;
  IsDelete: string;
  IsUpdate: string;
  IsEnablePass: string;
  IsEnableAthM: string;
  IsEnableM2M: string;
  IsEnableM2MM: string;
  IsCopyFirstData: string;
  InitDBAttrs: object;
  WhenOverSize: number;
  DtlOpenType: number;
  ListShowModel: number;
  EditModel: number;
  UrlDtl: object;
  MobileShowModel: number;
  MobileShowField: string;
  X: number;
  Y: number;
  H: number;
  W: number;
  FrmW: number;
  FrmH: number;
  NumOfDtl: number;
  IsEnableLink: string;
  LinkLabel: string;
  LinkTarget: string;
  LinkUrl: string;
  FilterSQLExp: string;
  OrderBySQLExp: string;
  FK_Node: number;
  ShowCols: string;
  IsExp: string;
  ImpModel: number;
  ImpSQLSearch: string;
  ImpSQLInit: string;
  ImpSQLFullOneRow: string;
  ImpSQLNames: string;
  IsImp: string;
  ColAutoExp: string;
  GUID: string;
  AtPara: string;
}

// 业务逻辑
export interface MapExt {
  MyPK: string;
  FK_MapData: string;
  ExtModel: string;
  ExtType: string;
  DoWay: number | string;
  AttrOfOper: string;
  AttrsOfActive: string;
  Doc: string;
  Tag: string;
  Tag1: string;
  Tag2: string;
  Tag3: string;
  Tag4: string;
  Tag5: string;
  H: number;
  W: number;
  DBType: number;
  FK_DBSrc: string;
  PRI: number;
  AtPara: string;
  Title: string;
}

// iframe框架
export interface MapFrame {
  MyPK: string;
  FK_MapData: string;
  Name: string;
  URL: string;
  FrameURL: string;
  UrlSrcType: number;
  W: string;
  H: string;
  IsAutoSize: string;
  EleType: string;
  GUID: string;
}

// 选项枚举
export interface OptionEnums {
  EnumKey: string;
  IntKey: number;
  Lab: string;
  Lang: string;
  MyPK: string;
  OrgNo: string;
}

export interface DesignerInfo {
  Sys_FrmAttachment: Array<FrmAttachment>;
  Sys_GroupField: Array<GroupField>;
  Sys_MapAttr: Array<MapAttr>;
  Sys_MapData: Array<MapData>;
  Sys_MapDtl: Array<MapDtl>;
  Sys_MapExt: Array<MapExt>;
  Sys_MapFrame: Array<MapFrame>;
}
