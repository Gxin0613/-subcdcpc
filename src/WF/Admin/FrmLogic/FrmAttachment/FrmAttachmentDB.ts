import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK } from '/@/bp/en/EntityMyPK';

//属性列表
export class FrmAttachmentDBAttr {
  /// <summary>
  /// 附件
  /// </summary>
  public static readonly FK_FrmAttachment = 'FK_FrmAttachment';
  /// <summary>
  /// 附件标识
  /// </summary>
  public static readonly NoOfObj = 'NoOfObj';
  /// <summary>
  /// 主表
  /// </summary>
  public static readonly FK_MapData = 'FK_MapData';
  /// <summary>
  /// RefPKVal
  /// </summary>
  public static readonly RefPKVal = 'RefPKVal';
  /// <summary>
  /// 流程ID
  /// </summary>
  public static readonly FID = 'FID';
  /// <summary>
  /// 文件名称
  /// </summary>
  public static readonly FileName = 'FileName';
  /// <summary>
  /// 文件扩展
  /// </summary>
  public static readonly FileExts = 'FileExts';
  /// <summary>
  /// 文件大小
  /// </summary>
  public static readonly FileSize = 'FileSize';
  /// <summary>
  /// 保存到
  /// </summary>
  public static readonly FileFullName = 'FileFullName';
  /// <summary>
  /// 记录日期
  /// </summary>
  public static readonly RDT = 'RDT';
  /// <summary>
  /// 记录人
  /// </summary>
  public static readonly Rec = 'Rec';
  /// <summary>
  /// 记录人名字
  /// </summary>
  public static readonly RecName = 'RecName';
  /// <summary>
  /// 所在部门
  /// </summary>
  public static readonly FK_Dept = 'FK_Dept';
  /// <summary>
  /// 所在部门名称
  /// </summary>
  public static readonly FK_DeptName = 'FK_DeptName';
  /// <summary>
  /// 类别
  /// </summary>
  public static readonly Sort = 'Sort';
  /// <summary>
  /// 备注
  /// </summary>
  public static readonly MyNote = 'MyNote';
  /// <summary>
  /// 节点ID
  /// </summary>
  public static readonly NodeID = 'NodeID';
  /// <summary>
  /// 是否锁定行
  /// </summary>
  public static readonly IsRowLock = 'IsRowLock';
  /// <summary>
  /// 上传的GUID
  /// </summary>
  public static readonly UploadGUID = 'UploadGUID';
  /// <summary>
  /// Idx
  /// </summary>
  public static readonly Idx = 'Idx';
  /// <summary>
  /// 保存方式
  /// </summary>
  public static readonly AthSaveWay = 'AthSaveWay';
}

// 附件数据存储
export class FrmAttachmentDB extends EntityMyPK {
  constructor(no?: string) {
    // super("bp.demo.FrmAttachmentDB","TS.Demo.BPFramework.FrmAttachmentDB");
    super('TS.Sys.FrmAttachmentDB');

    this.setPKVal(no);
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
    const map = new Map('Sys_FrmAttachmentDB', '附件数据存储');

    map.AddMyPK();

    map.AddTBString(FrmAttachmentDBAttr.FK_MapData, null, 'FK_MapData', true, false, 1, 100, 20);
    map.AddTBString(FrmAttachmentDBAttr.FK_FrmAttachment, null, '附件主键', true, false, 1, 500, 20);
    map.AddTBString(FrmAttachmentDBAttr.NoOfObj, null, '附件标识', true, false, 0, 50, 20);

    map.AddTBString(FrmAttachmentDBAttr.RefPKVal, null, '实体主键', true, false, 0, 50, 20);
    map.AddTBInt(FrmAttachmentDBAttr.FID, 0, 'FID', true, false);
    map.AddTBInt(FrmAttachmentDBAttr.NodeID, 0, '节点ID', true, false);

    map.AddTBString(FrmAttachmentDBAttr.Sort, null, '类别', true, false, 0, 200, 20);
    map.AddTBString(FrmAttachmentDBAttr.FileFullName, null, '文件路径', true, false, 0, 700, 20);
    map.AddTBString(FrmAttachmentDBAttr.FileName, null, '名称', true, false, 0, 500, 20);
    map.AddTBString(FrmAttachmentDBAttr.FileExts, null, '扩展', true, false, 0, 50, 20);
    map.AddTBFloat(FrmAttachmentDBAttr.FileSize, 0, '文件大小', true, false);

    map.AddTBDateTime(FrmAttachmentDBAttr.RDT, null, '记录日期', true, false);
    map.AddTBString(FrmAttachmentDBAttr.Rec, null, '记录人', true, false, 0, 50, 20);
    map.AddTBString(FrmAttachmentDBAttr.RecName, null, '记录人名字', true, false, 0, 50, 20);
    map.AddTBString(FrmAttachmentDBAttr.FK_Dept, null, '所在部门', true, false, 0, 50, 20);
    map.AddTBString(FrmAttachmentDBAttr.FK_DeptName, null, '所在部门名称', true, false, 0, 50, 20);
    map.AddTBStringDoc(FrmAttachmentDBAttr.MyNote, null, '备注', true, false, true);

    map.AddTBInt(FrmAttachmentDBAttr.IsRowLock, 0, '是否锁定行', true, false);

    //顺序.
    map.AddTBInt(FrmAttachmentDBAttr.Idx, 0, '排序', true, false);

    //这个值在上传时候产生.
    map.AddTBString(FrmAttachmentDBAttr.UploadGUID, null, '上传GUID', true, false, 0, 500, 20);

    map.AddTBAtParas(3000); //增加参数属性.

    this._enMap = map;
    return this._enMap;
  }
}

//附件数据存储s
export class FrmAttachmentDBs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmAttachmentDB();
  }
  constructor() {
    super();
  }
}
