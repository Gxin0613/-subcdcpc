import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../MapExt';
import { SFDBSrc } from '../SFDBSrc/SFDBSrc';

// 树干弹窗
export class DtlImpEn3 extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.DtlImpEn3');
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
    // map.AddTBString(MapExtAttr.FK_MapData, null, '表单ID', false, false, 0, 50, 200);
    // map.AddTBString(MapExtAttr.ExtModel, 'Pop', '模式(大类)', false, false, 0, 50, 200);
    // map.AddTBString(MapExtAttr.ExtType, null, '类型(小类)', false, false, 0, 50, 200);
    //const enumVal = '@0=执行SQL@1=执行url返回JSON@2=执行CCFromRef.js返回JSON';
    // map.AddDDLSysEnum(MapExtAttr.DBType, 0, '数据源类型', true, true, 'DBType', enumVal, null, false);
    map.AddDDLEntities(MapExtAttr.FK_DBSrc, 'local', '数据源', new SFDBSrc(), true, null, false);

    map.AddTBStringDoc(MapExtAttr.Tag1, null, '查询条件设置', true, false, true, this.NoteTag1);
    map.AddTBStringDoc(MapExtAttr.Tag2, null, '查询数据源 ', true, false, true, this.NoteTag2);
    map.AddTBStringDoc(MapExtAttr.Tag3, null, '总条数', true, false, true, this.NoteTag3);
    map.AddTBStringDoc(MapExtAttr.Tag, null, '数据列名与中文意思对照', true, false, true, this.NoteTag);
    // map.AddTBString(MapExtAttr.Tag4, null, '设定导入数据列表的主键', true, false, 0, 50, 200, true, this.NoteTag4);

    map.AddGroupAttr('基本信息');
    map.AddTBString('Title', null, '标题', true, false, 0, 50, 200, true);
    // map.AddRadioBtn('ShowModel', 1, '展示方式', true, true, 'ShowModel', '@0=POP弹出窗@1=下拉搜索选择', null, true);
    // map.AddDDLSysEnum(MapExtAttr.DBType, 0, '数据源类型', true, true, 'DBType', enumVal, null, false);
    //  map.AddDDLSysEnum('SelectType', 1, '选择类型', true, true, 'SelectType', '@0=平铺模式@1=下拉框模式', null, true);
    // map.AddRadioBtn('OpenPopType', 1, '打开Pop弹出窗的方式', true, true, 'OpenPopType', '@0=双击打开@1=点击按钮打开', null, true);
    map.AddTBString('SearchTip', null, '搜索提示', true, false, 0, 50, 200, true, this.NoteSearchTip);
    // map.AddTBString('BtnLab', '查找', '查找按钮标签', true, false, 0, 50, 200);
    map.AddTBInt(MapExtAttr.H, 500, '弹窗高度', true, false);
    map.AddTBInt(MapExtAttr.W, 800, '弹窗宽度', true, false);
    map.AddTBAtParas(4000);
    // map.AddBoolean('IsEnter', false, '是否允许手工输入', true, true);
    //参数字段.  @SelectType=1@IsEnter=0
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
   - 该设置对table查询有效,(可以为空)：日期的默认值是JS函数表达式.
   - SQL格式为:
   - $Para=BanJiNo#Label=所在班级#ListSQL=Select No,Name FROM Demo_BanJi 
   - $Para=XB#Label=性别#EnumKey=XB
   - $Para=DTFrom#Label=注册日期从#DefVal=(new Date( (new Date().setDate(-30 + new Date().getDate()))))
   - $Para=DTTo#Label=到#DefVal=(new Date())
   - URL格式为:
   - $Para=BanJiNo#Label=所在班级#ListURL=/DataUser/Handler.ashx?xxx=sss 
   - 执行CCFromRef.js返回JSON格式为:
   - $Para=BanJiNo#Label=所在班级#ListFuncName=MyFunc 
    
    `;
  public readonly NoteTag2 = ` 
 
  #### 帮助
 
 
   -设置一个查询的SQL语句，必须返回No,Name两个列。
   - 该参数支持ccbpm表达式,比如:SELECT No, Name FROM WF_Emp WHERE FK_Dept='@WebUser.DeptNo'
   - 必须有：@PageCount @PageSize @Key 三个参数,分别标识:@PageCount =第几页, @PageSize=每页大小. @Key=关键字
   - 比如For SQLServer: SELECT TOP @PageSize * FROM ( SELECT row_number() over(order by
      t.No) as rownumber,No,Name,Tel,Email FROM Demo_Student WHERE Name LIKE '%@Key%'
      ) A WHERE rownumber > @PageCount 
   - 总条数: SELECT COUNT(no) FROM Demo_Student WHERE (Name LIKE '%@Key%' OR No LIKE '%@Key%')
      AND BanJiNo=@BanJiNo AND XB=@XB 
   - 比如For Oracle: SELECT No,Name,Email,Tel FROM Demo_Student WHERE (Name LIKE '%@Key%'
       OR No LIKE '%@Key%') AND BanJiNo=@BanJiNo AND XB=@XB 
   - 比如For MySQL: SELECT No,Name,Email,Tel FROM Demo_Student WHERE (Name LIKE '%@Key%'
       OR No LIKE '%@Key%') AND BanJiNo=@BanJiNo AND XB=@XB 
   - 支持ccbpm的表达式,比如:@WebUser.DeptNo , @FieldName @WebUser.OrgNo
    
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
  public readonly NoteTag4 = ` 
 
  #### 帮助
 
   - 主键不为空，SQL查询的列表设置主键时，不会重复导入该数据
   - 主键为空时，则为选择的全部导入，不过滤已经导入的数据

  `;
}
