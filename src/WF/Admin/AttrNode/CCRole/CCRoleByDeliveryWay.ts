import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPE_AccepterRole } from '../AccepterRole/GPE_AccepterRole';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
/// 按照接受人规则计算
export class CCRoleByDeliveryWay extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.AttrNode.CCRoleByDeliveryWay');
    if (!!pkval) {
      this.MyPK = pkval;
    }
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_CCRole', '按照接受人规则计算');
    map.AddMyPK();
    // map.AddTBStringDoc(CCRoleAttr.EnIDs, null, '按接受人规则', false, false, false);
    map.AddGroupMethod('基本设置');
    // map.AddTBAtParas();
    const url = GloComm.UrlGPE(new GPE_AccepterRole(), '@MyPK');
    map.AddRM_UrlTabOpen('设置接受人', url);

    const url2 = 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3579867&doc_id=31094';
    map.AddRM_UrlTabOpen('帮助', url2);

    // map.AddRM_UrlRightFrameOpen('设置接受人1', url);
    //map.AddRM_Func('设置接收人2', 'Setting', '', 'icon-peopele');
    this._enMap = map;
    return this._enMap;
  }
  public Setting() {
    const url = GloComm.UrlGPE(new GPE_AccepterRole(), this.MyPK);
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
  }
}
