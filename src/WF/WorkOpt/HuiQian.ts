import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { WorkOptAttr } from './WorkOpt';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { message } from 'ant-design-vue';
import { Emps } from '/@/bp/port/Emp';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import WebUser from '/@/bp/web/WebUser';
import DBAccess from '/@/utils/gener/DBAccess';
import { GloWF } from '/@/WF/Admin/GloWF';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
/// <summary>
/// 会签
/// </summary>
export class HuiQian extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.WorkOpt.HuiQian');
    if (!!pkval) this.MyPK = pkval;
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_WorkOpt', '会签');
    map.AddMyPK();
    map.AddTBInt(WorkOptAttr.WorkID, 0, '工作ID', false, true, false, null);
    map.AddTBInt(WorkOptAttr.NodeID, 0, '节点ID', false, true, false, null);
    map.AddTBString(WorkOptAttr.EmpNo, null, '操作员', false, true, 0, 100, 10);

    map.AddTBString('HQEmps', null, '加签到人员', true, false, 0, 100, 10, true, null);
    map.AddTBString('HQDepts', null, '加签到部门', true, false, 0, 100, 10, true, null);
    map.AddTBString('HQStas', null, '加签到角色', true, false, 0, 100, 10, true, null);
    map.AddTBStringDoc('HQNote', null, '加签内容', false, true, true);
    let rootNo = '0';
    if (WebUser.CCBPMRunModel != CCBPMRunModel.Single) rootNo = '@WebUser.OrgNo';
    map.SetPopTreeEns('HQEmps', GloWF.srcDeptLazily, rootNo, GloWF.srcEmpLazily, GloWF.srcEmpSearchKey, true, '800px', '400px', '选择接收人', 'icon-people', '1', false, true);

    //部门选择
    map.SetPopTree('HQDepts', GloWF.srcDepts, GloWF.srcDeptRoot, true, '800px', '500px', '选择部门', 'icon-people');

    //角色选择.
    map.SetPopGroupList('HQStas', GloWF.srcStationTypes, GloWF.srcStations, true, '800px', '500px', '选择发送到的角色', 'icon-people');

    const rm = new RefMethod();
    rm.Title = '执行加签';
    rm.ClassMethod = 'HuiQian_Send';
    rm.Icon = 'icon-paper-plane';
    rm.RefMethodType = RefMethodType.FuncToolbar;
    map.AddRefMethod(rm);
    this._enMap = map;
    return this._enMap;
  }

  /**
   * 增加会签人
   * @constructor
   */
  public async HuiQian_Send() {
    if (!this.HQEmps && !this.HQDepts && !this.HQStas) {
      message.error('请选择加签人');
      return new GPNReturnObj(GPNReturnType.DoNothing);
    }
    const WorkID = this.GetValByKey('WorkID');
    const NodeID = this.GetValByKey('NodeID');
    const huiQianType = this.GetValByKey('HuiQianType');
    let emps = this.HQEmps;
    emps = ',' + emps + ',';
    if (!!this.HQDepts) {
      const depts = this.HQDepts.split(',');
      for (const deptNo of depts) {
        if (deptNo != '') {
          const ens = new Emps();
          await ens.Retrieve('FK_Dept', deptNo);
          ens.forEach((emp) => {
            if (emps.includes(',' + emp.No + ',') == false) {
              emps = emps + emp.No + ',';
            }
          });
        }
      }
    }
    if (!!this.HQStas) {
      const stas = this.HQStas.split(',');
      let empNo = 'No';
      if (WebUser.CCBPMRunModel == CCBPMRunModel.SAAS) empNo = 'UserID as No';
      for (const staNo of stas) {
        if (staNo == '') continue;
        // const sql = 'SELECT A.' + empNo + ", A.Name, a.FK_Dept FROM Port_Emp A, Port_DeptEmpStation B  WHERE a.No=B.FK_Emp AND B.FK_Station='" + staNo + "'";
        const data = await DBAccess.RunSQLReturnTable('Port_HuiQianEmp@Key=' + staNo);
        data.forEach((emp) => {
          if (emps.includes(',' + emp.No + ',') == false) {
            emps = emps + emp.No + ',';
          }
        });
      }
    }
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handler.AddPara('WorkID', WorkID);
    handler.AddPara('FK_Node', NodeID);
    handler.AddPara('AddEmps', emps);
    handler.AddPara('HuiQianType', huiQianType);
    const data = await handler.DoMethodReturnString('HuiQian_AddEmps');
    if (typeof data === 'string' && data.includes('err@')) {
      message.error(data.replace('@', ''));
      return false;
    }
    handler.Clear();
    handler.AddPara('WorkID', WorkID);
    handler.AddPara('FK_Node', NodeID);
    const result = await handler.DoMethodReturnString('HuiQian_SaveAndClose');
    if (typeof result === 'string' && result.includes('err@')) {
      message.error(result.replace('@', ''));
      return false;
    }
    if (!result) return new GPNReturnObj(GPNReturnType.Message, '会签成功');
    return new GPNReturnObj(GPNReturnType.Message, result);
  }

  /**
   * 执行会签
   * @constructor
   */
  public async HuiQian() {
    //处理发送
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handler.AddPara('WorkID', this.WorkID);
    handler.AddPara('FK_Node', this.NodeID);
    const data = await handler.DoMethodReturnString('HuiQian_SaveAndClose');
    if (typeof data === 'string' && data.includes('err@')) {
      message.error(data.replace('@', ''));
      return false;
    }
    //显示消息 Todo暂时这么处理
    message.success(data);
    return true;
  }
}
