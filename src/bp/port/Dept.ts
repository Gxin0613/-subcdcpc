import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesTree, EntityTree } from '/@/bp/en/EntityTree';
import { CCBPMRunModel } from '../difference/SystemConfig';
import WebUser from '../web/WebUser';
import BSEntity from '/@/utils/gener/BSEntity';
import { GPN_GenerOrg } from '/@/WF/Admin/Organization/AdminGroup/GPN_GenerOrg';
import { GloWF } from '/@/WF/Admin/GloWF';
import { GPN_Adminer } from '/@/WF/Admin/Organization/GPN_Adminer';
/// <summary>
/// 部门
/// </summary>
export class Dept extends EntityTree {
  constructor(no?: string) {
    super('TS.Port.Dept');
    if (!!no) {
      this.setPKVal(no);
    }
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.OpenForAdmin();
    return uac;
  }

  public override get EnMap() {
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('Port_Dept', '部门');

    map.AddTBStringPK('No', null, '编号', true, true, 3, 200, 75);
    map.AddTBString('Name', null, '名称', true, false, 0, 50, 150);
    map.AddTBString('ParentNo', null, '父节点编号', false, false, 0, 50, 100);
    map.AddTBString('Leader', null, '部门领导账号', true, false, 0, 50, 150);
    map.SetPopTreeEns(
      'Leader',
      GloWF.srcDeptLazily,
      '@WebUser.DeptNo',
      GloWF.srcEmpLazily,
      GloWF.srcEmpSearchKey,
      true,
      '800px',
      '600px',
      '部门领导账号',
      'icon-people',
      '1',
      true,
      true,
    );
    map.AddTBString('LinkMan', null, '部门联络员', true, false, 0, 50, 150);
    map.SetPopTreeEns(
      'LinkMan',
      GloWF.srcDeptLazily,
      '@WebUser.DeptNo',
      GloWF.srcEmpLazily,
      GloWF.srcEmpSearchKey,
      true,
      '800px',
      '600px',
      '部门领导账号',
      'icon-people',
      '1',
      true,
      true,
    );
    map.SetHelperAlert('LinkMan', '特定场景下使用联络人字段，如联络人需要处理待办等');
    map.AddTBString('Specer', null, '分管领导账号', true, false, 0, 50, 150);
    map.SetPopTreeEns(
      'Specer',
      GloWF.srcDeptLazily,
      '@WebUser.DeptNo',
      GloWF.srcEmpLazily,
      GloWF.srcEmpSearchKey,
      true,
      '800px',
      '600px',
      '部门领导账号',
      'icon-people',
      '1',
      true,
      true,
    );
    map.SetHelperAlert('Specer', '用于接收人规则一个账号可以分管多个部门.');

    if (WebUser.CCBPMRunModel != CCBPMRunModel.Single) map.AddTBString('OrgNo', null, '组织编号', false, false, 0, 50, 200);
    map.AddTBInt('Idx', 0, '排序顺序号', true, false);
    map.SetHelperAlert('Idx', '此数字表示左侧树结构中节点的排序顺序号，值越小越靠前。');

    if (WebUser.No === 'admin' && WebUser.CCBPMRunModel == CCBPMRunModel.GroupInc) {
      map.AddRM_GPN(new GPN_GenerOrg(), 'icon-drop', '&DeptNo=@No');
    }
    if (WebUser.No === 'admin' && WebUser.CCBPMRunModel == CCBPMRunModel.Single) {
      map.AddRM_GPN(new GPN_Adminer(), 'icon-drop', '&DeptNo=@No');
    }
    // map.AddGroupAttr('项目信息');
    // map.AddTBString('PrjNo', null, '项目编号', true, false, 0, 50, 100);
    // map.AddTBString('PrjName', null, '项目名称', true, false, 0, 50, 200);
    // map.AddTBString('PrjShortName', null, '项目简称', true, false, 0, 50, 150);

    this._enMap = map;
    return this._enMap;
  }

  // protected override beforeInsert(): Promise<boolean> {
  //   if (this.No==null)
  //     this.No=DBAccess.GenerGUID();
  // }
  /**
   * 把指定的部门设置为独立组织并设置管理员
   * @param p1 组织管理员编号
   * @returns 返回“设置成功”或“异常信息”
   */
  public async SetDept2Org(p1: String): Promise<string> {
    const dept = new BSEntity('BP.WF.Port.Admin2Group.Dept', this.No);
    await dept.RetrieveFromDBSources();
    const msg = await dept.DoMethodReturnString('SetDept2Org', p1);
    return msg;

    // const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
    // handler.AddPara('Index', 0);
    // handler.AddPara('EnName', 'BP.WF.Port.Admin2Group.Dept');
    // handler.AddPara('EnsName', 'BP.WF.Port.Admin2Group.Depts');
    // handler.AddPara('PKVal', this.No);
    // handler.AddPara('TB_adminer', p1);
    // return await handler.DoMethodReturnString('Refmethod_Done');
  }
}

//部门s
export class Depts extends EntitiesTree {
  get GetNewEntity(): Dept {
    return new Dept();
  }

  constructor() {
    super();
  }
}
