import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { WorkOptAttr } from '../WorkOpt';
import { GloWF } from '/@/WF/Admin/GloWF';
import { GenerWorkFlowExt } from '/@/WF/TSClass/FlowData/GenerWorkFlowExt';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { message } from 'ant-design-vue';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
/// <summary>
/// 抄送
/// </summary>
export class CCORShare extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.WorkOpt.CCORShare');
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
    const map = new Map('WF_WorkOpt', '抄送/分享');
    map.AddGroupAttr('抄送/分享');
    map.AddMyPK();
    map.AddTBInt(WorkOptAttr.WorkID, 0, '工作ID', false, true, false, null);
    map.AddTBInt(WorkOptAttr.NodeID, 0, '节点ID', false, true, false, null);
    map.AddTBString(WorkOptAttr.EmpNo, null, '操作员', false, true, 0, 100, 10);
    map.AddTBString(WorkOptAttr.EmpName, null, '操作员', true, true, 0, 100, 10);

    map.AddTBString(WorkOptAttr.CCEmps, null, '抄送到人员', true, false, 0, 100, 10, true, null);
    map.AddTBString(WorkOptAttr.CCDepts, null, '抄送到部门', true, true, 0, 100, 10, true, null);
    map.AddTBString(WorkOptAttr.CCStations, null, '抄送到岗位', true, true, 0, 100, 10, true, null);
    map.AddTBStringDoc(WorkOptAttr.CCNote, null, '抄送内容', true, false, true);
    map.AddGroupAttr('工作信息');
    map.AddTBInt(WorkOptAttr.WorkID, 0, '工作ID', true, true, false, null);
    map.AddTBString(WorkOptAttr.Title, null, '标题', true, true, 0, 200, 10, true);
    map.AddTBInt(WorkOptAttr.NodeID, 0, '节点ID', false, false, false, null);
    map.AddTBString(WorkOptAttr.NodeName, null, '当前节点', true, true, 0, 500, 10, false, null);

    //人员选择. - 抄送.
    map.SetPopTreeEns(
      WorkOptAttr.CCEmps,
      GloWF.srcDeptLazily,
      GloWF.srcDeptRoot,
      GloWF.srcEmpLazily,
      GloWF.srcEmpSearchKey,
      true,
      '800px',
      '400px',
      '选择接收人',
      'icon-people',
      '1',
      true,
      true,
    );
    //部门选择
    map.SetPopTree(WorkOptAttr.CCDepts, GloWF.srcDepts, GloWF.srcDeptRoot, true, '800px', '500px', '选择部门', 'icon-people');
    //角色选择.
    map.SetPopGroupList(WorkOptAttr.CCStations, GloWF.srcStationTypes, GloWF.srcStations, true, '800px', '500px', '选择发送到的角色', 'icon-people');
    const rm = new RefMethod();
    rm.Title = '抄送/分享';
    rm.ClassMethod = 'SendCC'; //执行的方法.
    rm.Icon = 'icon-paper-plane';
    rm.RefMethodType = RefMethodType.FuncToolbar; //工具栏按钮.
    map.AddRefMethod(rm);
    this._enMap = map;
    return this._enMap;
  }
  protected override async beforeInsert(): Promise<boolean> {
    //说明: 再插入这笔数据的事后，要把以前的发送过的加载出来.
    const gwf = new GenerWorkFlowExt(this.WorkID);
    await gwf.RetrieveFromDBSources();
    this.Title = gwf.Title;
    this.NodeID = gwf.FK_Node;
    this.NodeName = gwf.NodeName;
    this.SetValByKey(WorkOptAttr.Title, gwf.Title);
    this.SetValByKey(WorkOptAttr.NodeID, gwf.FK_Node);
    this.SetValByKey(WorkOptAttr.NodeName, gwf.NodeName);
    return Promise.resolve(true);
  }
  public async SendCC() {
    //检查.
    if (this.SendEmps == '' && this.SendDepts == '' && this.SendStations == '') {
      message.error('请选择接受人.');
      return new GPNReturnObj(GPNReturnType.DoNothing);
    }

    message.info('正在发送请稍后...');

    //处理发送
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handler.AddPara('MyPK', this.MyPK);
    handler.AddPara('WorkID', this.WorkID || this.GetValByKey('WorkID'));
    handler.AddPara('NodeID', this.NodeID || this.GetValByKey('NodeID'));
    const data = await handler.DoMethodReturnString('TS_CC'); //发送.
    if (typeof data === 'string' && data.includes('err@')) {
      message.error(data.replace('@', ''));
      return new GPNReturnObj(GPNReturnType.DoNothing);
    }

    //message.success(data);
    // return true;
    //提示发送送信.
    return new GPNReturnObj(GPNReturnType.Message, data);
  }
}
