import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';

//属性列表
export class FrmAttachmentAttr {
  /// <summary>
  /// Name
  /// </summary>
  public static readonly Name = 'Name';
  /// <summary>
  /// 主表
  /// </summary>
  public static readonly FK_MapData = 'FK_MapData';
  /// <summary>
  /// 运行模式
  /// </summary>
  public static readonly AthRunModel = 'AthRunModel';
  /// <summary>
  /// 在线编辑方式
  /// </summary>
  public static readonly AthEditType = 'AthEditType';
  /// <summary>
  /// 节点ID
  /// </summary>
  public static readonly FK_Node = 'FK_Node';
  /// <summary>
  /// 高度
  /// </summary>
  public static readonly H = 'H';
  /// <summary>
  /// 要求上传的格式
  /// </summary>
  public static readonly Exts = 'Exts';
  /// <summary>
  /// 附件编号
  /// </summary>
  public static readonly NoOfObj = 'NoOfObj';
  /// <summary>
  /// 是否可以上传
  /// </summary>
  public static readonly IsUpload = 'IsUpload';
  /// <summary>
  /// 是否是合流汇总
  /// </summary>
  public static readonly IsHeLiuHuiZong = 'IsHeLiuHuiZong';
  /// <summary>
  /// 是否汇总到合流节点上去？
  /// </summary>
  public static readonly IsToHeLiuHZ = 'IsToHeLiuHZ';
  /// <summary>
  /// 是否增加
  /// </summary>
  public static readonly IsNote = 'IsNote';
  /// <summary>
  /// 是否启用扩展列
  /// </summary>
  public static readonly IsExpCol = 'IsExpCol';
  /// <summary>
  /// 是否显示标题列
  /// </summary>
  public static readonly IsShowTitle = 'IsShowTitle';
  /// <summary>
  /// 是否可以下载
  /// </summary>
  public static readonly IsDownload = 'IsDownload';
  /// <summary>
  /// 是否可以排序
  /// </summary>
  public static readonly IsOrder11 = 'IsOrder';
  /// <summary>
  /// 数据存储方式
  /// </summary>
  public static readonly AthSaveWay = 'AthSaveWay';
  /// <summary>
  /// 单附件模板使用规则
  /// </summary>
  public static readonly AthSingleRole = 'AthSingleRole';
  /// <summary>
  /// 单附件编辑模式
  /// </summary>
  public static readonly AthEditModel = 'AthEditModel';
  /// <summary>
  /// 是否排序？
  /// </summary>
  public static readonly IsIdx = 'IsIdx';
  /// <summary>
  /// 是否要转换成html，方便在线浏览.
  /// </summary>
  public static readonly IsTurn2Html = 'IsTurn2Html';
  /// <summary>
  /// 类别
  /// </summary>
  public static readonly Sort = 'Sort';
  /// <summary>
  /// 上传类型
  /// </summary>
  public static readonly UploadType = 'UploadType';
  /// <summary>
  /// GroupID
  /// </summary>
  public static readonly GroupID = 'GroupID';
  /// RowIdx
  /// </summary>
  public static readonly RowIdx = 'RowIdx';
  /// <summary>
  /// <summary>
  /// 自动控制大小
  /// </summary>
  public static readonly IsAutoSize = 'IsAutoSize';
  /// <summary>
  /// GUID
  /// </summary>
  public static readonly GUID = 'GUID';
  /// <summary>
  /// 数据控制方式(对父子流程有效果)
  /// </summary>
  public static readonly CtrlWay = 'CtrlWay';
  /// <summary>
  /// 上传方式(对父子流程有效果)
  /// </summary>
  public static readonly AthUploadWay = 'AthUploadWay';
  /// <summary>
  /// 文件展现方式
  /// </summary>
  public static readonly FileShowWay = 'FileShowWay';
  /// <summary>
  /// 上传方式
  /// 0，批量上传。
  /// 1，单个上传。
  /// </summary>
  public static readonly UploadCtrl = 'UploadCtrl';
  /// <summary>
  /// 上传校验
  /// 0=不校验.
  /// 1=不能为空.
  /// 2=每个类别下不能为空.
  /// </summary>
  public static readonly UploadFileNumCheck = 'UploadFileNumCheck';
  /// <summary>
  /// 上传最小数量
  /// </summary>
  public static readonly NumOfUpload = 'NumOfUpload';
  /// <summary>
  /// 上传最大数量
  /// </summary>
  public static readonly TopNumOfUpload = 'TopNumOfUpload';
  /// <summary>
  /// 附件最大限制
  /// </summary>
  public static readonly FileMaxSize = 'FileMaxSize';
  /// <summary>
  /// 是否可见？
  /// </summary>
  public static readonly IsVisable = 'IsVisable';
  /// <summary>
  /// 附件类型 0 普通附件 1 图片附件
  /// </summary>
  public static readonly FileType = 'FileType';
  /// <summary>
  /// 移动端图片附件上传的方式
  /// </summary>
  public static readonly PicUploadType = 'PicUploadType';
  /// <summary>
  /// 是否启用模板？
  /// </summary>
  public static readonly IsEnableTemplate = 'IsEnableTemplate';
  /// <summary>
  /// 附件删除方式
  /// </summary>
  public static readonly DeleteWay = 'DeleteWay';
  /// <summary>
  /// 数据引用
  /// </summary>
  public static readonly DataRefNoOfObj = 'DataRefNoOfObj';
  /// <summary>
  /// 阅读规则
  /// </summary>
  public static readonly ReadRole = 'ReadRole';
  /// <summary>
  /// 是否启用快捷键
  /// </summary>
  public static readonly FastKeyIsEnable = 'FastKeyIsEnable';
  /// <summary>
  /// 快捷键生成规则
  /// </summary>
  public static readonly FastKeyGenerRole = 'FastKeyGenerRole';
  /// <summary>
  /// 是不是从表附件
  /// </summary>
  public static readonly IsDtlAth = 'IsDtlAth';
}

// 附件
export class FrmAttachment extends EntityMyPK {
  // 设置的值
  get Sort() {
    return this.GetValStringByKey(FrmAttachmentAttr.Sort);
  }
  set Sort(value: any) {
    this.SetValByKey(FrmAttachmentAttr.Sort, value);
  }

  constructor(pkval?: string) {
    super('TS.Sys.FrmAttachment', 'BP.Sys.FrmAttachment');
    if (!!pkval) this.setPKVal(pkval);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_FrmAttachment', '附件');

    map.AddMyPK();

    map.AddTBString(FrmAttachmentAttr.FK_MapData, null, '表单ID', true, false, 1, 100, 20);
    map.AddTBString(FrmAttachmentAttr.NoOfObj, null, '附件编号', true, false, 0, 50, 20);
    map.AddTBInt(FrmAttachmentAttr.FK_Node, 0, '节点控制(对sln有效)', false, false);

    //for渔业厅增加.
    map.AddTBInt(FrmAttachmentAttr.AthRunModel, 0, '运行模式', false, false);
    map.AddTBInt(FrmAttachmentAttr.AthEditType, 0, '在线编辑方式', true, false);

    map.AddTBInt(FrmAttachmentAttr.AthSaveWay, 0, '保存方式', false, false);

    map.AddTBString(FrmAttachmentAttr.Name, null, '名称', true, false, 0, 50, 20);
    map.AddTBString(FrmAttachmentAttr.Exts, null, '要求上传的格式', true, false, 0, 200, 20);
    map.AddTBInt(FrmAttachmentAttr.NumOfUpload, 0, '最小上传数量', true, false);

    map.AddTBInt(FrmAttachmentAttr.TopNumOfUpload, 99, '最大上传数量', true, false);
    map.AddTBInt(FrmAttachmentAttr.FileMaxSize, 10240, '附件最大限制(KB)', true, false);
    map.AddTBInt(FrmAttachmentAttr.UploadFileNumCheck, 0, '上传校验方式', true, false);

    map.AddTBString(FrmAttachmentAttr.Sort, null, '类别(可为空)', true, false, 0, 500, 20);

    map.AddTBFloat(FrmAttachmentAttr.H, 150, 'H', false, false);

    map.AddBoolean(FrmAttachmentAttr.IsUpload, true, '是否可以上传', false, false);
    map.AddBoolean(FrmAttachmentAttr.IsVisable, true, '是否可见', false, false);
    //  map.AddTBInt(FrmAttachmentAttr.IsDelete, 1, "附件删除规则(0=不能删除1=删除所有2=只能删除自己上传的)", false, false);
    map.AddTBInt(FrmAttachmentAttr.FileType, 0, '附件类型', false, false);
    map.AddTBInt(FrmAttachmentAttr.ReadRole, 0, '阅读规则', true, true);
    map.AddTBInt(FrmAttachmentAttr.PicUploadType, 0, '图片附件上传方式', true, true);

    //hzm新增列
    map.AddTBInt(FrmAttachmentAttr.DeleteWay, 1, '附件删除规则(0=不能删除1=删除所有2=只能删除自己上传的', false, false);
    map.AddBoolean(FrmAttachmentAttr.IsDownload, true, '是否可以下载', false, false);

    map.AddBoolean(FrmAttachmentAttr.IsAutoSize, true, '自动控制大小', false, false);
    map.AddBoolean(FrmAttachmentAttr.IsNote, true, '是否增加备注', false, false);
    map.AddBoolean(FrmAttachmentAttr.IsExpCol, false, '是否启用扩展列', false, false);

    map.AddBoolean(FrmAttachmentAttr.IsShowTitle, true, '是否显示标题列', false, false);
    map.AddTBInt(FrmAttachmentAttr.UploadType, 1, '上传类型0单个1多个2指定', false, false);

    map.AddTBInt(FrmAttachmentAttr.IsIdx, 0, '是否排序', false, false);

    // map.AddBoolean(FrmAttachmentAttr.IsIdx, false, "是否排序?", true, true);
    //对于父子流程有效.
    map.AddTBInt(FrmAttachmentAttr.CtrlWay, 0, '显示权限=PK,1=FID,2=ParentID', false, false);
    map.AddTBInt(FrmAttachmentAttr.AthUploadWay, 0, '控制上传控制方式0=继承模式,1=协作模式.', false, false);
    map.AddTBInt(FrmAttachmentAttr.ReadRole, 0, '阅读规则', true, true);

    //数据引用，如果为空就引用当前的.
    map.AddTBString(FrmAttachmentAttr.DataRefNoOfObj, null, '数据引用组件ID', true, false, 0, 150, 20, true, null);

    //  map.AddTBInt(FrmAttachmentAttr.RowIdx, 0, "RowIdx", false, false);
    map.AddTBInt(FrmAttachmentAttr.GroupID, 0, 'GroupID', false, false);
    map.AddTBString(FrmAttachmentAttr.GUID, null, 'GUID', true, false, 0, 128, 20);
    map.AddTBInt(FrmAttachmentAttr.IsEnableTemplate, 0, '是否启用模板下载?', false, false);
    map.AddTBInt('IsDtlAth', 0, 'IsDtlAth', false, false);

    map.ParaFields = ',IsDtlAth,';

    //参数属性.
    map.AddTBAtParas(3000);

    this._enMap = map;
    return this._enMap;
  }
}

//附件s
export class FrmAttachments extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmAttachment();
  }
  constructor() {
    super();
  }
}
