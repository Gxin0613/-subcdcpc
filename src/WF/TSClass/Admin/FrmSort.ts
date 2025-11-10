/// 表单目录 属性
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesTree, EntityTree } from '/@/bp/en/EntityTree';
import WebUser from '/@/bp/web/WebUser';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
/// <summary>
/// 表单目录
/// </summary>
export class FrmSort extends EntityTree {
  constructor(no?: string) {
    super('TS.WF.Admin.FrmSort');
    if (!!no) {
      this.setPKVal(no);
    }
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('Sys_FormTree', '表单目录');

    map.AddTBStringPK('No', null, '编号', true, false, 1, 100, 150);
    map.AddTBString('ParentNo', null, '父节点No', false, false, 0, 100, 30);

    map.AddTBString('Name', null, '名称', true, false, 0, 200, 250, true);
    map.AddTBString('ShortName', null, '简称', true, false, 0, 200, 250, true);

    map.AddTBString('OrgNo', '0', '组织编号(0为系统组织)', false, false, 0, 150, 250);
    map.SetHelperAlert('OrgNo', '用于区分不同组织的的流程,比如:一个集团有多个子公司,每个子公司都有自己的业务流程.');

    map.AddTBString('DomainExt', null, '域/系统编号', true, false, 0, 100, 250);
    map.SetHelperAlert('DomainExt', '用于区分不同系统的流程,比如:一个集团有多个子系统每个子系统都有自己的流程,就需要标记那些流程是那个子系统的.比如:OA,CRM,ERP');
    map.AddTBInt('Idx', 0, 'Idx', false, false);
    map.AddTBString('Icon', null, 'Icon', true, false, 0, 50, 100, true, null);

    this._enMap = map;
    return this._enMap;
  }
}

/**
 * 流程类别s
 */
export class FrmSorts extends EntitiesTree {
  get GetNewEntity(): EntityNoName {
    return new FrmSort();
  }
  constructor() {
    super();
  }
  //查询全部
  override async RetrieveAll() {
    if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) return await super.RetrieveAll('Idx');

    return await this.Retrieve('OrgNo', WebUser.OrgNo, 'Idx');
  }
}
