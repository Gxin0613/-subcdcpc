import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { message } from 'ant-design-vue';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloWF } from '/@/WF/Admin/GloWF';
export class RelToEmp extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.AskFrm.RelToEmp');
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
    const map = new Map('Frm_GenerAskFrm', '发布到人员');
    map.GroupBarShowModel = 0; //标签模式.

    map.AddGroupAttr('发送');
    map.AddMyPK();
    map.AddTBInt('AskFrmState', 0, '状态', false, false);
    // map.AddDDLSysEnum('AskFrmSta', 0, '状态', true, true, 'AskFrmSta', '@0=设计中@1=运行中@2=已完成');
    map.AddTBString('SendEmps', null, '发送给', true, false, 0, 500, 10, true, null);
    map.AddTBString('SendDepts', null, '到部门', true, false, 0, 500, 10, true, null);
    map.AddTBString('SendStations', null, '到角色', true, false, 0, 500, 10, true, null);
    map.AddBoolean('IsJiaoJi', false, '是否求角色与部门的交集?', true, true, true, '求交集是:选择部门下的具有角色的人员集合.');
    map.AddTBString('SendDeptLeaders', null, '到部门领导', true, false, 0, 500, 10, true, null);
    //  map.AddTBStringDoc(WorkOptAttr.SendNote, null, '小纸条', true, false, true);
    // map.SetHelperAlert(WorkOptAttr.SendNote, '发送给接受人的备注信息,其他人看不到.');
    //人员选择. - 发送
    // map.SetPopGroupList(WorkOptAttr.SendEmps, GloWF.srcDepts, GloWF.srcEmps, true, '', '300px', '500px', '选择接收人', 'icon-people');
    //人员选择，懒加载模式.
    map.SetPopTreeEns(
      'SendEmps',
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
    map.SetPopTree('SendDepts', GloWF.srcDepts, GloWF.srcDeptRoot, true, '500px', '500px', '选择部门', 'icon-people');

    map.SetPopTree('SendDeptLeaders', GloWF.srcDepts, GloWF.srcDeptRoot, true, '500px', '500px', '选择部门', 'icon-people');

    //角色选择.
    map.SetPopGroupList('SendStations', GloWF.srcStationTypes, GloWF.srcStations, true, '600px', '500px', '选择发送到的角色', 'icon-people');

    const rm = new RefMethod();
    rm.Title = '主动下发';
    rm.ClassMethod = 'SendFlow'; //执行的方法.
    rm.Icon = 'icon-paper-plane';
    rm.RefMethodType = RefMethodType.FuncToolbar; //工具栏按钮.
    map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }

  protected override async beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }

  public async SendFlow() {
    if (this.AskFrmSta == 2) {
      message.error('当前已经完成,您不能执行下发.');
      return new GPNReturnObj(GPNReturnType.DoNothing);
    }

    //检查.
    if (!this.SendEmps && !this.SendDepts && !this.SendStations) {
      message.error('请选择接受人.');
      return new GPNReturnObj(GPNReturnType.DoNothing);
    }

    message.info('正在执行请稍后...');
    try {
      //处理发送
      const handler = new HttpHandler('BP.CCBill.AskFrm.HttpHandlerFrmAsk');
      handler.AddPara('MyPK', this.MyPK);
      handler.AddPara('IsJiaoJi', this.IsJiaoJi || this.GetValByKey('IsJiaoJi'));
      const data = await handler.DoMethodReturnString('TS_Send'); //发送.
      if (typeof data === 'string' && data.includes('err@')) {
        message.error(data.replace('@', ''));
        return new GPNReturnObj(GPNReturnType.DoNothing);
      }
      //message.success(data);
      // return true;
      //提示发送送信.
      return new GPNReturnObj(GPNReturnType.Message, data);
    } catch (e) {
      message.error(e as string);
      return new GPNReturnObj(GPNReturnType.DoNothing);
      //return new GPNReturnObj(GPNReturnType.Message, e as string);
    }
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
}
