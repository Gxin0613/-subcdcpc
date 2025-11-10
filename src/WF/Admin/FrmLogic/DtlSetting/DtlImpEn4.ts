import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../MapExt';
import { GloWF } from '../../GloWF';

// 树干弹窗
export class DtlImpEn4 extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.DtlImpEn4');
    if (!!mypk) this.setPKVal(mypk);
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
    const map = new Map('Sys_MapExt', '从表导入');

    map.AddGroupAttr('数据来源');
    map.AddMyPK();

    map.AddTBStringDoc(MapExtAttr.Tag1, null, '初始化列表数据源', true, false, true, this.NoteTag1);
    map.SetPopGroupList('Tag1', GloWF.srcDBSrc, GloWF.srcDBSFSearch, false);

    map.AddTBStringDoc(MapExtAttr.Tag2, null, '关键字查询数据源', true, false, true, this.NoteTag2);
    map.SetPopGroupList('Tag2', GloWF.srcDBSrc, GloWF.srcDBSFSearch, false);

    map.AddTBString(MapExtAttr.Tag, null, '数据列名与中文意思对照', true, false, 0, 200, 200, true, this.NoteTag);

    map.AddTBString('Title', null, '标题', true, false, 0, 50, 200, true);
    map.AddTBString('SearchTip', null, '搜索提示', true, false, 0, 50, 200, true, this.NoteSearchTip);
    map.AddTBInt(MapExtAttr.H, 500, '弹窗高度', true, false);
    map.AddTBInt(MapExtAttr.W, 800, '弹窗宽度', true, false);
    map.AddTBAtParas(4000);
    map.ParaFields = ',Title,SearchTip,';

    this._enMap = map;
    return this._enMap;
  }

  public readonly NoteTag = ` 
 
  #### 帮助
   - 该选项可以为空,在右上角的列表里查询或点树树干的数据源出现的列表,需要用中文显示列头..
   - 不为空时，设置几个字段则列表里面显示几个字段
   - 格式为:
   - 例如: No=编号,Name=名称,Addr=地址,Tel=电话,Email=邮件
   `;
  public readonly NoteTag1 = ` 
  #### 帮助
   - 用户打开导入页面的初始化数据内容.
   - 比如: SELECT No as EmpNo, Name as EmpName, Tel, Email FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo'
  #### 注意
   - 返回的列名于从表字段的ID相同,就可以匹配填充.
    `;
  public readonly NoteTag2 = ` 
  #### 帮助
   - 用户输入关键字点击查询按钮所执行结果返回的数据源.
   - 比如: SELECT No as EmpNo, Name as EmpName, Tel, Email FROM Port_Emp WHERE  Name LIKE '%@Key%' OR No LIKE '%@Key%'
  ##### 说明
  1. @Key 是文本框输入的参数.
  2. 返回的列名于从表的字段ID保持一致.

    `;
  public readonly NoteTag3 = ` 
 
  #### 帮助
 
 
   - 比如For SQLServer: SELECT count(No) FROM Demo_Student WHERE (Name LIKE '%@Key%' OR
     No LIKE '%@Key%') AND BanJiNo=@BanJiNo AND XB=@XB 
   - 比如For Oracle: SELECT count(No) FROM Demo_Student WHERE (Name LIKE '%@Key%' OR No
     LIKE '%@Key%') AND BanJiNo=@BanJiNo AND XB=@XB 
   - 比如For MySQL: SELECT count(No) FROM Demo_Student WHERE (Name LIKE '%@Key%' OR No
     LIKE '%@Key%') AND BanJiNo=@BanJiNo AND XB=@XB 
    `;
}
