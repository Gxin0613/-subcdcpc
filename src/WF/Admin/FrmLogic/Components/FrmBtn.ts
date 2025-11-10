import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapAttrAttr } from '../MapAttrs/MapAttr';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { GPE_DDLFullCtrlts } from '../MapExt/DDLFullCtrl/GPE_DDLFullCtrlts';

// 按钮
export class FrmBtn extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.FrmUI.SelfCommonent.FrmBtn');
    if (!!mypk) this.MyPK = mypk;
  }

  // 实体的权限控制
  public get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public get EnMap() {
    const map = new Map('Sys_MapAttr', '按钮');

    map.AddMyPK(false);
    map.AddTBString(MapAttrAttr.FK_MapData, null, '表单ID', true, true, 0, 100, 20);
    map.AddTBString(MapAttrAttr.Name, null, '按钮标签(文字)', true, false, 0, 50, 20);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '按钮ID', true, true, 0, 50, 20);

    map.AddDDLSysEnum(MapAttrAttr.UIIsEnable, 0, '事件类型', true, true, 'EventType', '@0=禁用@1=执行JavaScript');
    map.AddTBStringDoc(MapAttrAttr.Tag, null, '事件内容', true, false, true);
    map.SetHelperAlert(MapAttrAttr.Tag, '可以写JS函数.');

    //map.AddTBString(FrmBtnAttr.MsgOK, null, "运行成功提示", true, false, 0, 500, 20);
    //map.AddTBString(FrmBtnAttr.MsgErr, null, "运行失败提示", true, false, 0, 500, 20);
    //map.AddTBString(FrmBtnAttr.BtnID, null, "按钮ID", true, false, 0, 128, 20);
    // const rm = new RefMethod();
    // rm.Title = '填充其他控件';
    // rm.ClassMethod = 'DoFullCtrl';
    // rm.RefMethodType = RefMethodType.RightFrameOpen;
    // map.AddRefMethod(rm);

    //填充其他控件
    map.AddRM_GPE(new GPE_DDLFullCtrlts(), 'icon-arrow-right-circle');

    this._enMap = map;
    return this._enMap;
  }
}
