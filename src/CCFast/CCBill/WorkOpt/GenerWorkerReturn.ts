import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityWorkID } from '/@/bp/en/EntityWorkID';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GloWF } from '/@/WF/Admin/GloWF';
// 自定义审核
export class GenerWorkerReturn extends EntityWorkID {
  override get PK(): string {
    return 'WorkID';
  }
  constructor(no?: string) {
    super('TS.CCBill.WorkOpt.GenerWorkerReturn');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = false;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Frm_GenerBill', '审核退回');
    map.AddTBIntPK('WorkID', 0, 'WorkID', false);

    map.AddTBString('BillNo', null, '单据编号', true, true, 0, 100, 10);
    map.AddTBString('Title', null, '标题', true, true, 0, 1000, 10);

    //  map.AddTBString('EmpNo', null, '处理人编号', true, false, 0, 100, 150);
    // map.AddTBString('EmpName', null, '处理人名称', true, false, 0, 100, 150);
    map.AddDDLSQL('ReturnTo', '', '退回到', GloWF.SQLOfGenerWorkerReturn, true); //'SELECT Idx as No, EmpName as Name FROM Frm_GenerWorker WHERE WorkID=@WorkID Order BY Idx'
    map.AddTBStringDoc('CheckerNote', null, '退回原因', true, false, true);
    // map.AddTBString('DeptNo', null, '部门No', true, true, 0, 100, 10);
    // map.AddTBString('DeptName', null, '部门名称', true, true, 0, 100, 10);
    // map.AddTBString('FrmID', null, '表单ID', true, true, 0, 100, 10);
    map.AddTBAtParas(4000);
    // map.AddRM_DtlSearch
    this._enMap = map;
    return this._enMap;
  }

  public async ZhuXiaoXueJi(): Promise<string> {
    // const url = '';
    // return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    // return '执行成功';
    // alert('ssdsds');
    const handler = new HttpHandler('BP.TA.TA_App');
    handler.AddPara('No', this.No);
    handler.AddPara('Name', this.Name);
    //handler.AddFile
    const val = await handler.DoMethodReturnString('Student_ZhuXiaoXueJi');
    return val;
  }
}
