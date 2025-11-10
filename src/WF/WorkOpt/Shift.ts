import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { WorkOptAttr } from './WorkOpt';
import { GloWF } from '/@/WF/Admin/GloWF';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { message } from 'ant-design-vue';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import WebUser from '/@/bp/web/WebUser';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
/// <summary>
/// 会签
/// </summary>
export class Shift extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.WorkOpt.Shift');
    if (!!pkval) this.MyPK = pkval;
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_WorkOpt', '移交');
    map.AddMyPK();
    map.AddTBInt(WorkOptAttr.WorkID, 0, '工作ID', false, true, false, null);
    map.AddTBInt(WorkOptAttr.NodeID, 0, '节点ID', false, true, false, null);
    map.AddTBString(WorkOptAttr.EmpNo, null, '操作员', false, true, 0, 100, 10);

    map.AddTBString('ShiftTo', null, '接收人', true, false, 0, 100, 10, true);
    map.AddTBStringDoc('ShiftNote', null, '移交原因', true, false, true, null);
    let rootNo = '0';
    if (WebUser.CCBPMRunModel != CCBPMRunModel.Single) rootNo = '@WebUser.OrgNo';
    map.SetPopTreeEns('ShiftTo', GloWF.srcDeptLazily, rootNo, GloWF.srcEmpLazily, GloWF.srcEmpSearchKey, true, '800px', '400px', '选择', 'icon-people', '1', true, true);

    const rm = new RefMethod();
    rm.Title = '移交';
    rm.ClassMethod = 'ShiftFlow'; //执行的方法.
    rm.Icon = 'icon-paper-plane';
    rm.RefMethodType = RefMethodType.FuncToolbar; //工具栏按钮.
    map.AddRefMethod(rm);
    this._enMap = map;
    return this._enMap;
  }
  public async ShiftFlow() {
    //检查.
    if (!this.ShiftTo) {
      //message.error('请选移交人.');
      // return new GPNReturnObj(GPNReturnType.Message, '请选移交人.');
      return '请选移交人';
    }
    if (!this.ShiftNote) {
      return '请填写移交原因';
      // return new GPNReturnObj(GPNReturnType.Message, '请填写移交原因');
    }
    try {
      //处理发送
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddPara('WorkID', this.WorkID);
      handler.AddPara('NodeID', this.NodeID);
      handler.AddPara('ToEmp', this.ShiftTo);
      handler.AddPara('Message', this.ShiftNote);
      const data = await handler.DoMethodReturnString('Shift_Save'); //发送.
      return new GPNReturnObj(GPNReturnType.Close, data, '移交');
    } catch (e) {
      // @ts-ignore
      //message.error(e.toString());
      return new GPNReturnObj(GPNReturnType.Message, e.toString());
    }
  }
}
