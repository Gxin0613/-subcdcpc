import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapAttrAttr } from '../MapAttrs/MapAttr';
import { GloWF } from '../../GloWF';

//关联流程单据
export class FlowRefLink extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.FrmUI.SelfCommonent.FlowRefLink');
    if (!!mypk) this.MyPK = mypk;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public get EnMap() {
    const map = new Map('Sys_MapAttr', '关联流程单据');

    map.AddMyPK();
    map.AddTBString(MapAttrAttr.Name, '', '标签', true, false, 0, 500, 20, true);
    map.AddTBString(MapAttrAttr.Tag1, '_blank', '连接目标', true, false, 0, 4000, 20);
    map.SetHelperAlert(MapAttrAttr.Tag1, '比如:_blank,_parent,_self');

    map.AddTBString(MapAttrAttr.Tag2, null, '流程模板编号', true, false, 0, 500, 20, true);
    map.SetPopGroupList('Tag2', GloWF.srcFlowSorts, GloWF.srcFlows, false, '600px', '500px', '选流程', 'icon-drop');

    map.AddTBString(MapAttrAttr.Tag3, null, '显示的列', true, false, 0, 500, 20, true);

    //角色选择.

    // map.SetPopGroupList('Tag2', GloWF.srcFlowSortLazily, GloWF.srcStations, true, '300px', '500px', '选择发送到的角色', 'icon-people');

    //map.SetPopTreeEns('Tag2', GloWF.srcFlowSortLazily, '@WebUser.DeptNo', GloWF.srcFlowsLazily, '', true, '300px', '500px', '选择流程', 'icon-people', '1', '1');
    //map.SetHelperAlert(MapAttrAttr.Tag2, '比如:001,002');

    this._enMap = map;
    return this._enMap;
  }
}
