import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GloWF } from '../../GloWF';

export class OrgAdminerAttr {
  public static readonly FK_Emp = 'FK_Emp';
  public static readonly OrgNo = 'OrgNo';
  public static readonly FlowSorts = 'FlowSorts';
  public static readonly FrmTrees = 'FrmTrees';
  public static readonly EmpName = 'EmpName';
}

/// <summary>
/// 组织管理员
/// </summary>
export class OrgAdminer extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.Port.OrgAdminer');
    if (!!mypk) {
      this.MyPK = mypk;
    }
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('Port_OrgAdminer', '组织管理员');
    map.AddMyPK(false);

    map.AddTBString(OrgAdminerAttr.OrgNo, null, '组织', true, true, 0, 50, 150);
    map.AddTBString(OrgAdminerAttr.FK_Emp, null, '管理员账号', true, true, 0, 50, 100);
    map.AddTBString(OrgAdminerAttr.EmpName, null, '管理员名称', true, true, 0, 50, 100);

    map.AddTBStringDoc(OrgAdminerAttr.FlowSorts, null, '管理的流程目录', true, true, true);
    map.AddTBStringDoc(OrgAdminerAttr.FrmTrees, null, '管理的表单目录', true, true, true);

    map.SetPopTree('FlowSorts', GloWF.srcFlowSorts, '@WebUser.OrgNo', true, '300px', '500px', '选择流程目录', 'icon-people');
    map.SetPopTree('FrmTrees', GloWF.srcFrmTree, '@WebUser.OrgNo', true, '300px', '500px', '选择表单目录', 'icon-people');

    // map.AttrsOfOneVSM.AddGroupPanelModel(new OAFlowSorts(), new BP.WF.Template.FlowSorts(),
    //     OAFlowSortAttr.RefOrgAdminer,
    //     OAFlowSortAttr.FlowSortNo, "流程目录权限");
    // map.AttrsOfOneVSM.AddGroupPanelModel(new OAFrmTrees(), new BP.Sys.FrmTrees(),
    //     OAFrmTreeAttr.RefOrgAdminer,
    //     OAFrmTreeAttr.FrmTreeNo, "表单目录权限");
    // if (TS.Web.WebUser.No != null)
    //     map.AddHidden("OrgNo", " = ", "@WebUser.OrgNo");
    this._enMap = map;
    return this._enMap;
  }

  // protected override bool beforeUpdateInsertAction()
  // {
  //     string str = "";
  //     BP.WF.Template.FlowSorts ens = new Template.FlowSorts();
  //     ens.RetrieveInSQL("SELECT FlowSortNo FROM Port_OrgAdminerFlowSort WHERE  FK_Emp='" + this.FK_Emp + "' AND OrgNo='" + this.OrgNo + "'");
  //     foreach (BP.WF.Template.FlowSort item in ens)
  //         str += "(" + item.No + ")" + item.Name + ";";
  //     this.FlowSorts = str;
  //     str = "";
  //     BP.Sys.FrmTrees enTrees = new BP.Sys.FrmTrees();
  //     enTrees.RetrieveInSQL("SELECT FrmTreeNo FROM Port_OrgAdminerFrmTree WHERE  FK_Emp='" + this.FK_Emp + "' AND OrgNo='" + this.OrgNo + "'");
  //     foreach (BP.Sys.FrmTree item in enTrees)
  //         str += "(" + item.No + ")" + item.Name + ";";
  //     this.FrmTrees = str;
  //     Emp emp = new Emp(this.FK_Emp);
  //     this.EmpName = emp.Name;

  //     //@hontyan.
  //     this.MyPK = this.OrgNo + "_" + this.FK_Emp;

  //     return base.beforeUpdateInsertAction();
  // }
}

//组织管理员s
export class OrgAdminers extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new OrgAdminer();
  }
  constructor() {
    super();
  }
}
