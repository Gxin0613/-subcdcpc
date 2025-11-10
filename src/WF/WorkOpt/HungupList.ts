import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { WorkOptAttr } from './WorkOpt';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
/// <summary>
/// 挂起延迟
/// </summary>
export class HungupList extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.WorkOpt.HungupList');
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
    const map = new Map('WF_WorkOpt', '挂起延迟');
    map.AddMyPK();
    map.AddTBInt(WorkOptAttr.WorkID, 0, '工作ID', false, true, false, null);
    map.AddTBInt(WorkOptAttr.NodeID, 0, '节点ID', false, true, false, null);
    map.AddTBString(WorkOptAttr.EmpNo, null, '操作员', true, true, 0, 100, 10);

    map.AddRadioBtn('DelayWay', 0, '延迟方式', true, true, 'DelayWay', '@0=无限期的延迟@1=按时间延迟', null, true);
    map.AddTBDate('RelDate', null, '延期到', true, false, false);
    map.AddTBStringDoc('DelayNote', null, '延迟原因', true, false, true, null);

    const rm = new RefMethod();
    rm.Title = '提交延迟申请';
    rm.ClassMethod = 'DoHungup'; //执行的方法.
    rm.Icon = 'icon-paper-plane';
    rm.RefMethodType = RefMethodType.FuncToolbar; //工具栏按钮.
    map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }
  public async DoHungup() {
    //检查.
    if (this.DelayWay == '1' && !this.RelDate) {
      //message.error('按时间延迟请选择延期到的时间.');
      return new GPNReturnObj(GPNReturnType.Message, '按时间延迟请选择延期到的时间.');
      // return null;
    }
    if (!this.DelayNote) {
      // message.error('请选择延期原因.');
      return new GPNReturnObj(GPNReturnType.Message, '请选择延期原因.');
    }
    try {
      //处理发送
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
      handler.AddPara('MyPK', this.MyPK);
      handler.AddPara('WorkID', this.WorkID);
      handler.AddPara('NodeID', this.NodeID);
      handler.AddPara('DelayWay', this.DelayWay);
      handler.AddPara('Doc', this.DelayNote);
      handler.AddPara('RelDate', this.RelDate);

      const data = await handler.DoMethodReturnString('Hungup_Save'); //发送.
      return new GPNReturnObj(GPNReturnType.Close, data);
    } catch (e) {
      //message.error(e as string);
      return new GPNReturnObj(GPNReturnType.Message, e as string);
    }
  }
}
