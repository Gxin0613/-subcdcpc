import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

// 节点属性
export class TBFullCtrl2 extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.TBFullCtrl2');
    this.RefEnName = 'TS.Sys.MapExt'; //关联更新的类.
    if (!!mypk) this.MyPK = mypk;
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
    const map = new Map('Sys_MapExt', '文本框自动完成2');

    map.AddMyPK();

    map.AddTBStringDoc(MapExtAttr.Tag3, null, '数据列名与中文意思对照 ', true, false, true, this.Desc1);
    map.AddDDLSysEnum('ShowModel', 0, '显示内容', true, true, 'TBFullShowModel', '@0=显示编号@1=显示名称', null, false);
    map.SetHelperAlert('ShowModel', '当选择一个Item时候，把那个数据填充到当前文本框里?');
    map.AddTBAtParas(4000);
    map.ParaFields = ',ShowModel,';

    const url = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=TBFullCtrl');
    map.AddLink('Tag4', '设置-搜索列表数据源配置', url, true, GPNReturnType.OpenUrlByDrawer50, this.Desc2, 'icon-settings');

    // map.AddRM_GPE(new GPE_SingleDBSrc(),null,"icon-file");

    this._enMap = map;
    return this._enMap;
  }
  public readonly Desc2 = `
  #### 说明
   
  1. 设置一个查询的SQL语句，该SQL必须包含 No, Name 列, 用与展示快速补全的部分。
  1. 该SQL必须包含 @Key 关键字，@Key 输入文本框的值.
  1. SQL返回的列与其他字段名称保持一致，就可以完成控件数据的自动填充。
  1. 比如:SELECT No,Name,Name as CaoZuoYuanMingCheng,Tel as DianHua,Email,FK_Dept FROM WF_Emp WHERE No LIKE '%@Key%'
  1. 为防止URL编码规定like的第一个%写成[%],如果like '%@Key%' 写成'[%]@Key%'
  `;
  public readonly Desc1 = `
  #### 说明
   
  1. 该选项可以为空,在右上角的列表里查询或点树树干的数据源出现的列表,需要用中文显示列头.
  1. 例如: No=编号,Name=名称,Addr=地址,Tel=电话,Email=邮件
  
  `;
}
