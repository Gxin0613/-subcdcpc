import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

// 单实体平铺
export class PopList extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.PopList');
    // this.RefEnName = 'TS.Sys.MapExt'; //关联更新的类.
    if (!!mypk) this.MyPK = mypk;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapExt', '单实体平铺');

    map.AddMyPK();

    map.AddTBInt('ShowCol', 3, '设置显示列数', true, false);
    map.AddRadioBtn('ShowModel', 0, '展示方式', false, false, 'ShowModel', '@0=POP弹出窗@1=下拉搜索选择', null);
    map.AddRadioBtn('PopSelectType', 1, '选择类型', true, true, 'PopSelectType', '@0=单选@1=多选', null);
    map.AddTBString('Title', null, '标题', true, false, 0, 50, 200);
    map.AddTBString('BtnLab', '查找', '查找按钮标签', true, false, 0, 50, 200);
    map.AddTBString(MapExtAttr.Tag5, null, '确定后执行的JS', true, false, 0, 50, 200, true, this.DescTag1);
    map.AddTBInt(MapExtAttr.H, 400, '弹窗高度', true, false);
    map.AddTBInt(MapExtAttr.W, 500, '弹窗宽度', true, false);
    map.AddTBAtParas(4000);
    map.ParaFields = ',ShowCol,Title,BtnLab,ShowModel,PopSelectType,';

    const url = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=Pop.Dtl&DBModel=SFTable');
    map.AddLink(MapExtAttr.Doc, '设置-实体数据源', url, true, GPNReturnType.OpenUrlByModal, '', 'icon-settings');

    this._enMap = map;
    return this._enMap;
  }

  public readonly DescTag1 = ` 
  ### 说明
   - 该选项可以为空,弹出框确定后执行的JS，可以直接写方法名或者方法().
   `;
}
