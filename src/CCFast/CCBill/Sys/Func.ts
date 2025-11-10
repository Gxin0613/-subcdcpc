import { EntityNoNameAttr, EntityNoName, EntitiesNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { Entity } from '/@/bp/en/Entity';
import DBAccess from '/@/utils/gener/DBAccess';

//属性列表
export class FuncAttr extends EntityNoNameAttr {
  /// <summary>
  /// 名称
  /// </summary>
  public static readonly Name = 'Name';
  /// <summary>
  /// 功能ID
  /// </summary>
  public static readonly FuncID = 'FuncID';
  /// <summary>
  /// 功能来源
  /// </summary>
  public static readonly FuncSrc = 'FuncSrc';
  /// <summary>
  /// 功能内容
  /// </summary>
  public static readonly DTSName = 'DTSName';

  public static readonly Icon = 'Icon';
  public static readonly Docs = 'Docs';
  public static readonly WarningMsg = 'WarningMsg';

  public static readonly MethodDocTypeOfFunc = 'MethodDocTypeOfFunc';

  public static readonly MethodDoc_Url = 'MethodDoc_Url';

  public static readonly MsgSuccess = 'MsgSuccess';

  public static readonly MsgErr = 'MsgErr';
  public static readonly IsHavePara = 'IsHavePara';
}

// 功能
export class Func extends EntityNoName {
  constructor(no?: string) {
    // super("bp.demo.Func","TS.Demo.BPFramework.Func");
    super('TS.CCFast.Func');
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
    const map = new Map('Frm_Func', '功能');

    map.AddTBStringPK(FuncAttr.No, null, '编号', true, true, 0, 50, 10);
    map.AddTBString(FuncAttr.Name, null, '方法名', true, false, 0, 300, 10, true);

    map.AddTBString(FuncAttr.FuncID, null, '方法ID', true, false, 0, 300, 10, true);
    map.AddTBString(FuncAttr.Icon, null, '图标', true, false, 0, 50, 10, true);

    map.AddDDLSysEnum(FuncAttr.FuncSrc, 0, '功能来源', true, false, 'FuncSrc', '@0=自定义@1=系统内置');
    map.AddTBString(FuncAttr.DTSName, null, '功能内容', true, false, 0, 300, 10, true);

    map.AddTBStringDoc(FuncAttr.Docs, null, '功能说明', true, false, true);
    map.SetHelperAlert(FuncAttr.Docs, '对于该功能的描述.');

    map.AddTBString(FuncAttr.WarningMsg, null, '独立方法警告信息', true, false, 0, 300, 10, true);
    map.AddDDLSysEnum(FuncAttr.MethodDocTypeOfFunc, 0, '内容类型', true, false, 'MethodDocTypeOfFunc', '@0=SQL@1=URL@2=JavaScript@3=业务单元');

    map.AddTBString(FuncAttr.MethodDoc_Url, null, 'URL执行内容', false, false, 0, 300, 10);
    map.AddTBString(FuncAttr.MsgSuccess, null, '成功提示信息', true, false, 0, 300, 10, true);
    map.AddTBString(FuncAttr.MsgErr, null, '失败提示信息', true, false, 0, 300, 10, true);
    map.AddTBInt(FuncAttr.IsHavePara, 0, '是否含有参数?', true, false);

    const rm = new RefMethod();
    //rm.Title = "方法参数";
    //rm.ClassMethodName = this.ToString() + ".DoParas";
    //rm.Visable = true;
    //rm.RefMethodType = RefMethodType.RightFrameOpen;
    //rm.Target = "_blank";
    //rm.GroupName = "开发接口";
    //  map.AddRefMethod(rm);
    // map.AddRM_Url_RightFrameOpen("","")

    rm.Title = '方法内容';
    rm.ClassMethod = 'DoDocs';
    rm.Visable = true;
    rm.RefMethodType = RefMethodType.RightFrameOpen;
    rm.Target = '_blank';
    //rm.GroupName = "开发接口";
    map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    if (!this.No) this.No = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }

  /// <summary>
  /// 方法参数
  /// </summary>
  /// <returns></returns>
  public DoParas() {
    return '../../CCBill/Admin/MethodParas.htm?No=' + this.No;
  }
  /// <summary>
  /// 方法内容
  /// </summary>
  /// <returns></returns>
  public DoDocs() {
    return '../../CCBill/Admin/MethodDocSys/Default.htm?No=' + this.No;
  }
}

//功能s
export class Funcs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Func();
  }
  constructor() {
    super();
  }
}
