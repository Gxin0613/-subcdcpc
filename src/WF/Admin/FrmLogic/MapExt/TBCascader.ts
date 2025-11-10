import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
// 级联数据源
export class TBCascader extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.TBCascader');
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
    const map = new Map('Sys_MapExt', '级联数据源');

    map.AddMyPK();

    const url = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=TBCascader.L1');
    map.AddLink('Tag1', '设置-1级数据源', url, true, GPNReturnType.OpenUrlByDrawer50, this.Desc1, 'icon-settings');

    const url2 = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=TBCascader.L2');
    map.AddLink('Tag2', '设置-2级数据源', url2, true, GPNReturnType.OpenUrlByDrawer50, this.Desc2, 'icon-settings');

    const url3 = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=TBCascader.L3');
    map.AddLink('Tag3', '设置-3级数据源', url3, true, GPNReturnType.OpenUrlByDrawer50, this.Desc3, 'icon-settings');

    this._enMap = map;
    return this._enMap;
  }

  public readonly Desc1 = `
  #### 说明
   - 设置一个数据源：必须包含No,Name两个列. 
   - 数据源支持ccbpm表达式,比如: SELECT * FROM Port_Dept WHERE ParentNo='@WebUser.DeptNo'
   - 比如: SELECT No,Name FROM CN_ShengFen 
   - 关于ccbpm表达式: @WebUser.No,@WebUser.Name,@WebUser.DeptNo 是当前用户登录信息.
   - 暂时不支持字典.
  `;

  public readonly Desc2 = `
  #### 说明
   1. 设置一个查询的SQL语句，该SQL必须包No,Name 两个列。
   1. 该SQL必须包含 @Key 关键字，@Key 就是上次选择的第1级数据项的编号.
   1. 比如: SELECT No,Name FROM CN_City WHERE ShengFenNo='@Key'
   1. 暂时不支持字典.
  `;
  public readonly Desc3 = `
  #### 说明
   1. 设置一个查询的SQL语句，该SQL必须包No,Name 两个列。  
   1. 该SQL必须包含 @Key 关键字，@Key 就是上次选择的第2级数据项的编号.
   1. 比如: SELECT No,Name FROM CN_QuXian WHERE CityNo='@Key'
   1. 暂时不支持字典.
  `;
}
