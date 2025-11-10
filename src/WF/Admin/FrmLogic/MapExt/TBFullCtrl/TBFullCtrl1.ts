import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
// 节点属性
export class TBFullCtrl1 extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.TBFullCtrl1');
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
    const map = new Map('Sys_MapExt', '文本框自动完成');
    map.AddMyPK();
    //   map.AddDDLSysEnum(MapExtAttr.DBType, 0, '数据源类型', true, true, 'DBType', '@0=执行SQL@1=执行url返回JSON@2=执行CCFromRef.js返回JSON', null, false);
    map.AddDDLSysEnum('ShowModel', 0, '显示内容', true, true, 'TBFullShowModel', '@0=显示编号@1=显示名称', null, false);
    map.SetHelperAlert('ShowModel', '当选择一个Item时候，把那个数据填充到当前文本框里?');
    map.AddTBAtParas(4000);

    const url = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=TBFullCtrl&DBModel=SFTable');
    map.AddLink('Tag4', '设置-搜索列表数据源配置', url, true, GPNReturnType.OpenUrlByDrawer50, this.Desc1, 'icon-settings');

    map.ParaFields = ',ShowModel,';
    // map.AddRM_GPE(new GPE_SingleDBSrc(),null,"icon-file");
    this._enMap = map;
    return this._enMap;
  }

  public readonly Desc1 = `
  #### 说明
   - 填充SQL帮助
   1. 设置一个查询的SQL语句，该SQL必须包含 No, Name 列, 用与展示快速补全的部分。
   1. 该SQL必须包含 @Key 关键字，@Key 输入文本框的值.
   1. SQL返回的列与其他字段名称保持一致，就可以完成控件数据的自动填充。
   1. 比如: SELECT No, Name FROM WF_Emp WHERE No LIKE '@key%'
   1. 为防止URL编码规定like的第一个%写成[%],如果like '%@Key%' 写成'[%]@Key%'
   - 填充Url帮助
   1. 设置URL，返回的必须是json格式。
   1. 比如: /App/Handler.ashx?DoType=Emps&Key=@Key
   1. @Key 是输入的关键字

 
  `;
}
