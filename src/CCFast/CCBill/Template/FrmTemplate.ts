import { EntityNoName, EntitiesNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { Entity } from '/@/bp/en/Entity';
import { FrmAttr } from '/@/WF/TSClass/Admin/FrmAdm';
import { MapDataAttr } from '/@/WF/Admin/FrmLogic/MapData';

//属性列表
export class FrmTemplateAttr extends FrmAttr {
  public static readonly RowOpenModel = 'RowOpenModel';
  public static readonly EntityShowModel = 'EntityShowModel';
  public static readonly BillNoFormat = 'BillNoFormat';
  public static readonly EntityEditModel = 'EntityEditModel';
}

// 单据模版
export class FrmTemplate extends EntityNoName {
  constructor(no?: string) {
    // super("bp.demo.FrmTemplate","TS.Demo.BPFramework.FrmTemplate");
    super('TS.CCBill.FrmTemplate');
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
    const map = new Map('Sys_MapData', '单据模版');

    map.CodeStruct = '4';

    //#region 基本属性.
    map.AddTBStringPK(MapDataAttr.No, null, '表单编号', true, true, 1, 190, 20);
    map.SetHelperAlert(MapDataAttr.No, '也叫表单ID,系统唯一.');

    map.AddDDLSysEnum(MapDataAttr.FrmType, 0, '表单类型', true, true, 'BillFrmType', '@0=经典表单@1=自由表单');
    map.AddTBString(MapDataAttr.PTable, null, '存储表', true, false, 0, 500, 20, true);
    map.SetHelperAlert(MapDataAttr.PTable, '存储的表名,如果您修改一个不存在的系统将会自动创建一个表.');

    map.AddTBString(MapDataAttr.Name, null, '表单名称', true, false, 0, 200, 20, true);
    // map.AddDDLEntities(MapDataAttr.FK_FormTree, "01", "表单类别", new FrmSort(), false);

    map.AddDDLSysEnum(
      FrmTemplateAttr.RowOpenModel,
      0,
      '行记录打开模式',
      true,
      true,
      FrmTemplateAttr.RowOpenModel,
      '@0=新窗口打开@1=弹出窗口打开,关闭后刷新列表@2=弹出窗口打开,关闭后不刷新列表',
    );
    //#endregion 基本属性.

    // #region 单据模版.
    map.AddDDLSysEnum(FrmTemplateAttr.EntityType, 0, '业务类型', true, false, FrmTemplateAttr.EntityType, '@0=独立表单@1=单据@2=编号名称实体@3=树结构实体@5=实体EntityNoName');
    map.SetHelperAlert(FrmTemplateAttr.EntityType, '该实体的类型,@0=单据@1=编号名称实体@2=树结构实体@5=实体EntityNoName');

    map.AddDDLSysEnum(FrmTemplateAttr.EntityShowModel, 0, '展示模式', true, true, FrmTemplateAttr.EntityShowModel, '@0=表格@1=树干模式');

    map.AddTBString(FrmTemplateAttr.BillNoFormat, null, '实体编号规则', true, false, 0, 100, 20, true);
    map.SetHelperAlert(
      FrmTemplateAttr.BillNoFormat,
      `	
实体编号规则: 	
 2标识:01,02,03等, 3标识:001,002,003,等..`,
    );
    //#endregion 单据模版.

    //#region 实体属性
    map.AddTBInt(FrmTemplateAttr.EntityEditModel, 0, '编辑模式', true, false);
    //map.AddDDLSysEnum(FrmAttr.EntityEditModel, 0, "编辑模式", true, true, FrmAttr.EntityEditModel, "@0=只读列表模式@1=Table编辑模式");
    // #endregion 实体属性.

    // //#region 可以创建的权限.
    // //平铺模式.
    // map.AttrsOfOneVSM.AddGroupPanelModel(new StationCreates(), new Stations(),
    //     StationCreateAttr.FrmID,
    //     StationCreateAttr.FK_Station, "可以创建的角色", StationAttr.FK_StationType);

    // map.AttrsOfOneVSM.AddGroupListModel(new StationCreates(), new TS.Port.Stations(),
    //   StationCreateAttr.FrmID,
    //   StationCreateAttr.FK_Station, "可以创建的角色AddGroupListModel", StationAttr.FK_StationType);

    // //节点绑定部门. 节点绑定部门.
    // map.AttrsOfOneVSM.AddBranches(new FrmDeptCreates(), new TS.Port.Depts(),
    //    FrmDeptCreateAttr.FrmID,
    //    FrmDeptCreateAttr.FK_Dept, "可以创建的部门AddBranches", TS.Port.EmpAttr.Name, TS.Port.EmpAttr.No, "@WebUser.DeptNo");

    // //节点绑定人员. 使用树杆与叶子的模式绑定.
    // map.AttrsOfOneVSM.AddBranchesAndLeaf(new EmpCreates(), new TS.Port.Emps(),
    //    EmpCreateAttr.FrmID,
    //    EmpCreateAttr.FK_Emp, "可以创建的人员", TS.Port.EmpAttr.FK_Dept, TS.Port.EmpAttr.Name, TS.Port.EmpAttr.No, "@WebUser.DeptNo");
    // //#endregion 可以创建的权限

    this._enMap = map;
    return this._enMap;
  }
}

//单据模版 s
export class FrmTemplates extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new FrmTemplate();
  }
  constructor() {
    super();
  }
}
