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
  FrmID: string;
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
  OID: string;
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
  KeyOfEn: string;
  EnName: string;
  MyPK: string;
  UIContralType: number;
  Icon?: string;
}

// 字段属性
export interface MapAttr {
  MyPK: string;
  FrmID: string;
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
  // IsRichText: number;
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
  TextModel: number;
  AtPara: string;
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
  FrmID: string;
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
  FrmID: string;
  ExtType: string;
  DoWay: number;
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
}

// iframe框架
export interface MapFrame {
  MyPK: string;
  FrmID: string;
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
