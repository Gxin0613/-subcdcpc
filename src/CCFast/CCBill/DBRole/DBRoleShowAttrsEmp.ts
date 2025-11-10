import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GloWF } from '/@/WF/Admin/GloWF';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { ClassFactory } from '/@/bp/da/ClassFactory';
import WebUser from '/@/bp/web/WebUser';

// 集合方法
export class DBRoleShowAttrsEmp extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.CCBill.DBRoleShowAttrsEmp');
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
    const map = new Map('Frm_DBRole', '人员数据权限');
    map.AddMyPK();
    map.AddTBString('FrmID', null, '表单ID', true, true, 0, 300, 10);
    map.AddTBString('DBRole', 'DBList', '规则', false, false, 0, 300, 10);

    map.AddTBString('MarkID', null, '权限标记', true, true, 0, 50, 60, true);
    map.AddTBString('MarkName', null, '权限标记', true, true, 0, 50, 60, true);

    map.AddTBString('Docs', null, '人员', true, false, 0, 5000, 10, true, null);

    let rootNo = '0';
    if (WebUser.CCBPMRunModel != CCBPMRunModel.Single) rootNo = '@WebUser.OrgNo';
    map.SetPopTreeEns('Docs', GloWF.srcDeptLazily, rootNo, GloWF.srcEmpLazily, GloWF.srcEmpSearchKey, true, '800px', '400px', '选择', 'icon-people', '1', true, true);

    map.AddTBString('Objs', null, '字段', true, false, 0, 5000, 10, true, null);
    map.SetPopGroupList('Objs', 'GenerGroups', 'GenerAttrs', true, '800px', '1000px', '要显示的字段', 'icon-people');

    //map.AddTBString('Stats', null, '岗位编号', true);
    //是否启用？
    map.AddBoolean('IsEnable', true, '是否启用？', true, true, true);
    map.AddTBAtParas();
    this._enMap = map;
    return this._enMap;
  }
  public async GenerGroups() {
    const en = await ClassFactory.GetEn(this.FrmID);
    const groups = en._enMap.attrs.groups.map((group) => {
      return {
        Name: group.key,
        No: group.name,
      };
    });
    return JSON.stringify(groups);
  }
  public async GenerAttrs() {
    const en = await ClassFactory.GetEn(this.FrmID);
    //.
    const attrs = en._enMap.attrs
      .filter((attr) => !!attr.UIVisible)
      .map((attr) => {
        return {
          Name: attr.Desc,
          No: attr.Key,
          GroupNo: attr.GroupName,
        };
      });
    //如何获取该实体的EnMap的 KeyOfEn, Name 两个属性生成json.返回过去.
    return JSON.stringify(attrs);
  }
}
