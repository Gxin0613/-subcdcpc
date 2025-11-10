import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { WorkOptAttr } from '../WorkOpt';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { message } from 'ant-design-vue';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { GloWF } from '../../Admin/GloWF';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
/// <summary>
/// 发送
/// </summary>
export class SendAndCC extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.WorkOpt.SendAndCC');
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
    const map = new Map('WF_WorkOpt', '发送');
    map.GroupBarShowModel = 0; //标签模式.

    map.AddGroupAttr('发送');
    map.AddMyPK();
    map.AddTBInt(WorkOptAttr.NodeID, 0, '节点ID', false, false, false, null);
    map.AddTBInt(WorkOptAttr.WorkID, 0, 'WorkID', false, false, false, null);

    map.AddTBString(WorkOptAttr.SendEmps, null, '发送给', true, false, 0, 500, 10, true, null);
    map.AddTBString(WorkOptAttr.SendDepts, null, '到部门', true, false, 0, 500, 10, true, null);
    map.AddTBString(WorkOptAttr.SendStations, null, '到角色', true, false, 0, 500, 10, true, null);
    map.AddBoolean('IsJiaoJi', false, '是否求角色与部门的交集?', true, true, true, '求交集是:选择部门下的具有角色的人员集合.');
    map.AddTBString('SendDeptLeaders', null, '到部门领导', true, false, 0, 500, 10, true, null);
    map.AddTBStringDoc(WorkOptAttr.SendNote, null, '小纸条', true, false, true);
    map.SetHelperAlert(WorkOptAttr.SendNote, '发送给接受人的备注信息,其他人看不到.');

    map.AddGroupAttr('抄送');
    map.AddTBString(WorkOptAttr.CCEmps, null, '抄送给', true, false, 0, 500, 10, true, null);
    map.AddTBString(WorkOptAttr.CCDepts, null, '到部门', true, false, 0, 500, 10, true, null);
    map.AddTBString(WorkOptAttr.CCStations, null, '到角色', true, false, 0, 500, 10, true, null);
    map.AddTBStringDoc(WorkOptAttr.CCNote, null, '抄送说明', true, false, true);
    // map.SetHelperAlert(WorkOptAttr.CCNote, '发送给接受人的备注信息,其他人看不到.');
    map.AddGroupAttr('工作信息');
    map.AddTBString(WorkOptAttr.Title, null, '标题', true, true, 0, 200, 10, true);
    map.AddTBString(WorkOptAttr.NodeName, null, '当前节点', true, true, 0, 500, 10, false, null);
    map.AddTBString(WorkOptAttr.ToNodeName, null, '到达节点', false, true, 0, 500, 10, false, null);
    map.AddTBInt(WorkOptAttr.ToNodeID, 0, '到达节点ID', false, false, false, null);
    map.AddTBString(WorkOptAttr.TodoEmps, null, '处理人', false, true, 0, 100, 10);
    map.AddTBString(WorkOptAttr.SenderName, null, '发送人', false, true, 0, 100, 10);
    map.AddTBString(WorkOptAttr.SendRDT, null, '发送日期', false, true, 0, 100, 10);
    map.AddTBString(WorkOptAttr.SendSDT, null, '限期', false, true, 0, 100, 10);
    map.AddTBInt(WorkOptAttr.WorkID, 0, '工作ID', true, true, false, null);
    map.AddTBString(WorkOptAttr.UseTimeFlow, null, '流程耗时', true, true, 0, 100, 10, false, null);
    map.AddTBString(WorkOptAttr.UseTimeNode, null, '节点耗时', true, true, 0, 100, 10, false, null);

    map.AddTBString(WorkOptAttr.EmpNo, null, '操作员', false, false, 0, 100, 10);
    map.AddTBString(WorkOptAttr.EmpName, null, '操作员', true, true, 0, 100, 10);

    //人员选择. - 发送
    // map.SetPopGroupList(WorkOptAttr.SendEmps, GloWF.srcDepts, GloWF.srcEmps, true, '', '300px', '500px', '选择接收人', 'icon-people');
    //人员选择，懒加载模式.
    map.SetPopTreeEns(
      WorkOptAttr.SendEmps,
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
    map.SetPopTree(WorkOptAttr.SendDepts, GloWF.srcDepts, GloWF.srcDeptRoot, true, '600px', '500px', '选择部门', 'icon-people');
    map.SetPopTree('SendDeptLeaders', GloWF.srcDepts, GloWF.srcDeptRoot, true, '600px', '500px', '选择部门', 'icon-people');

    //角色选择.
    map.SetPopGroupList(WorkOptAttr.SendStations, GloWF.srcStationTypes, GloWF.srcStations, true, '600px', '500px', '选择发送到的角色', 'icon-people');

    //人员选择 - 抄送.
    map.SetPopGroupList(WorkOptAttr.CCEmps, GloWF.srcDepts, GloWF.srcEmps, true, '600px', '500px', '选择接收人', 'icon-people');

    //部门选择
    map.SetPopTree(WorkOptAttr.CCDepts, GloWF.srcDepts, GloWF.srcDeptRoot, true, '600px', '500px', '选择部门', 'icon-people');

    //角色选择.
    map.SetPopGroupList(WorkOptAttr.CCStations, GloWF.srcStationTypes, GloWF.srcStations, true, '600px', '500px', '选择发送到的角色', 'icon-people');

    const rm = new RefMethod();
    rm.Title = '发送';
    rm.ClassMethod = 'SendFlow'; //执行的方法.
    rm.Icon = 'icon-paper-plane';
    rm.RefMethodType = RefMethodType.FuncToolbar; //工具栏按钮.
    map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }

  protected override async beforeInsert(): Promise<boolean> {
    //说明: 再插入这笔数据的事后，要把以前的发送过的加载出来.
    // const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    // handler.AddUrlData();
    // handler.AddPara('WorkID', this.WorkID);
    // handler.AddPara('FK_Node', this.NodeID);
    // handler.AddPara('ToNode', this.ToNodeID);
    // const data = await handler.DoMethodReturnJson('AccepterOfGener_Init');
    // [{No:xxx, Name:xxx}]
    // data.forEach((row) => {
    //   nos = row.No;
    //   names = row.Name;
    // });
    // this.SendEmps = data.map((item) => item.No).join(',');
    // this.SendEmpsT = data.map((item) => item.No).join(',');
    return Promise.resolve(true);
  }

  public async SendFlow() {
    //检查.
    if (this.SendEmps == '' && this.SendDepts == '' && this.SendStations == '') {
      message.error('请选择接受人.');
      return new GPNReturnObj(GPNReturnType.DoNothing);
      // return null;
    }

    //处理发送
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handler.AddPara('MyPK', this.MyPK);
    handler.AddPara('WorkID', this.WorkID || this.GetValByKey('WorkID'));
    handler.AddPara('NodeID', this.NodeID || this.GetValByKey('NodeID'));
    handler.AddPara('IsJiaoJi', this.IsJiaoJi || this.GetValByKey('IsJiaoJi'));
    handler.AddPara('OperType', 'Send');
    const data = await handler.DoMethodReturnString('TS_Send'); //发送.
    if (typeof data === 'string' && data.includes('err@')) {
      message.error(data.replace('@', ''));
      return new GPNReturnObj(GPNReturnType.DoNothing);
    }
    // return true;
    //提示发送送信.
    return new GPNReturnObj(GPNReturnType.Message, data);
  }

  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    if (
      this.IsJiaoJi &&
      (this.SendDepts == null || this.SendDepts == '' || this.SendDepts == undefined || this.SendStations == null || this.SendStations == '' || this.SendStations == undefined)
    ) {
      message.info('求角色与部门交集的情况下到部门或到到角色不能为空');
      return false;
    }
    return true;
  }

  /**
   * 执行成功后的事件
   */
  // override async afterUpdate(): Promise<boolean> {
  //  // return this.SendFlow();
  // }
}
