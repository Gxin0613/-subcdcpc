import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { CollectionAttr } from './Collection';
import { PCenters } from '../../GPM/PCenter/PCenter';
import { PowerCenterAttr } from '../../GPM/CCMenu/PowerCenter';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
// 新建实体
export class CollectionFlowNewEntity extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.CCBill.CollectionFlowNewEntity');
    if (!!pkval) this.No = pkval;
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
    const map = new Map('Frm_Collection', '新建实体');

    //主键.
    map.AddTBStringPK(CollectionAttr.No, null, '编号', true, true, 0, 100, 10);
    map.AddTBString(CollectionAttr.Name, null, '方法名称', true, false, 0, 300, 10);
    map.AddTBString(CollectionAttr.MethodID, null, '方法ID', true, true, 0, 300, 10);

    //功能标记.
    map.AddTBString(CollectionAttr.MethodModel, null, '方法模式', true, true, 0, 300, 10);
    map.AddTBString(CollectionAttr.Tag1, null, 'Tag1', true, true, 0, 300, 10);
    map.AddTBString(CollectionAttr.Mark, null, 'Mark', true, true, 0, 300, 10);

    map.AddTBString(CollectionAttr.FrmID, null, '表单ID', true, true, 0, 300, 10);
    map.AddTBString(CollectionAttr.FlowNo, null, '流程编号', true, true, 0, 10, 10);

    map.AddTBString(CollectionAttr.Icon, null, '图标', true, false, 0, 50, 10, true);
    map.AddBoolean('IsZD', false, '是否折叠?', true, true, true);
    map.SetHelperAlert('IsZD', '折叠后显示在更多按钮里.');
//    map.AddBoolean('IsRight', false, '右键显示?', true, true, true);


    map.AddRM_DtlSearch('权限', new PCenters(), PowerCenterAttr.CtrlPKVal, '', '', '', 'icon-drop', true);

    const rm7 = new RefMethod();
    rm7.Title = '设计流程';
    rm7.ClassMethod = 'DFlow';
    rm7.RefMethodType = RefMethodType.RightFrameOpen;
    rm7.IsCanBatch = false; //是否允许批处理，在Search.vue组件里.
    rm7.IsForEns = true;
    rm7.Icon = 'icon-link';
    map.AddRefMethod(rm7);

    this._enMap = map;
    return this._enMap;
  }
  public DFlow() {
    //return 'url@/DFilw.vue?FlowNo=' + this.No;

    // const url = `/#/WF/Designer/EditFlow?FlowNo=${this.Tag1}`;
    const url = GloComm.UrlFlowD(this.Tag1);

    return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    //const url = `/#/WF/Designer/EditFlow?FlowNo=${record.MethodID}`;
    return 'url@/DFlow.vue?FlowNo=@No';
    // const rand = Math.random();
    // postMsg['rand'] = rand;
    // return new GPNReturnObj(
    //   GPNReturnType.OpenIframeByCache,
    //   'http://127.0.0.1:9005/index.html',
    //   '测试回调',
    //   () => {
    //     return new GPNReturnObj(GPNReturnType.Close);
    //   },
    //   {
    //     data: postMsg,
    //     origin: '*',
    //   },
    // );
  }
}

//新建实体s
export class CollectionFlowNewEntitys extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new CollectionFlowNewEntity();
  }
  constructor() {
    super();
  }
}
