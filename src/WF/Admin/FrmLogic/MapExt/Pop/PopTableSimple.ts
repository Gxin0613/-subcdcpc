import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { SFDBSrc } from '../../SFDBSrc/SFDBSrc';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

// 表格弹窗
export class PopTableSimple extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.PopTableSimple');
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
    const map = new Map('Sys_MapExt', '表格弹窗');

    map.AddMyPK();

    map.AddRadioBtn('ShowModel', 0, '展示方式', false, false, 'ShowModel', '@0=POP弹出窗@1=下拉搜索选择', null, true);
    map.AddRadioBtn('PopSelectType', 1, '选择类型', true, true, 'PopSelectType', '@0=单选@1=多选', null, true);
    //map.AddRadioBtn('OpenPopType', 1, '打开Pop弹出窗的方式', true, true, 'OpenPopType', '@0=双击打开@1=点击按钮打开', null, true);
    //map.AddBoolean('IsFirstLoad', true, '打开是否直接加载数据', true, true, false);
    map.AddTBString('Title', null, '标题', true, false, 0, 50, 200, true);
    map.AddTBString('BtnLab', '查找', '查找按钮标签', true, false, 0, 50, 200);
    map.AddTBInt(MapExtAttr.H, 500, '弹窗高度', true, false);
    map.AddTBInt(MapExtAttr.W, 900, '弹窗宽度', true, false);

    const url = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=Pop.TableInit');
    map.AddLink('Tag1', '设置-初始化列表数据源', url, true, GPNReturnType.OpenUrlByDrawer50, this.NoteTag1, 'icon-settings');
    const url2 = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=Pop.TableSearch');
    map.AddLink('Tag2', '设置-关键字查询数据源', url2, true, GPNReturnType.OpenUrlByDrawer50, this.NoteTag1, 'icon-settings');
    map.AddTBString(MapExtAttr.Tag, null, '数据列名与中文意思对照', true, false, 0, 200, 200, true, this.NoteTag);

    //参数字段.  @SelectType=1@IsEnter=0
    map.AddTBAtParas(4000);
    map.ParaFields = ',Title,BtnLab,SearchTip,ShowModel,PopSelectType,';

    this._enMap = map;
    return this._enMap;
  }

  public readonly NoteSearchTip = ` 
  #### 帮助
  - 显示在搜索文本框的背景文字，比如:
  - 请输入付款人名称,进行搜索。
  - 输入人员编号,名称，名称全拼,简拼关键字搜索。
  `;
  public readonly NoteTag1 = ` 
  #### 帮助

  该设置对table查询有效,(可以为空)：日期的默认值是JS函数表达式.
  SQL格式为:
  $Para=BanJiNo#Label=所在班级#ListSQL=Select No,Name FROM Demo_BanJi
  $Para=XB#Label=性别#EnumKey=XB
  $Para=RegDate#Label=注册日期从#DefVal=(new Date( (new Date().setDate(-30 + new Date().getDate()))))
  $Para=RegDate#Label=到#DefVal=(new Date())
  URL格式为:
  $Para=BanJiNo#Label=所在班级#ListURL=/DataUser/Handler.ashx?xxx=sss
  执行CCFromRef.js返回JSON格式为:
  $Para=BanJiNo#Label=所在班级#ListFuncName=MyFunc
  `;
  public readonly NoteTag2 = ` 
  #### 帮助
   - 设置一个查询的SQL语句，必须返回No,Name两个列。
   - 该参数支持ccbpm表达式,比如:SELECT No, Name FROM WF_Emp WHERE FK_Dept='@WebUser.DeptNo'
   - 必须有：如果查询结果需要分页时必须包含@PageIdx @PageSize @Key 三个参数,查询结果不分页时必须包含@Key,分别标识:@PageIdx =第几页, @PageSize=每页大小. @Key=关键字
   - 比如For SQLServer: SELECT TOP @PageSize * FROM ( SELECT row_number() over(order by t.No) as rownumber,No,Name,Tel,Email FROM Demo_Student WHERE Name LIKE '%@Key%' ) A WHERE rownumber > @PageIdx
   - 比如For Oracle: SELECT No,Name,Email,Tel FROM Demo_Student WHERE (Name LIKE '%@Key%' OR No LIKE '%@Key%')
   - 比如For MySQL: SELECT No,Name,Email,Tel FROM Demo_Student WHERE (Name LIKE '%@Key%' OR No LIKE '%@Key%')
   - 查询结果分页时设置: 如果查询结果需要分页时，设置的查询条件必须在数据源中包含,时间的查询条件的设置增加RegDate>='@DTFrom_RegDate' AND RegDate<='@DTTo_RegDate'
   - 查询结果不分页时设置: 添加的查询条件为执行SQL查询时SQL语句后面不添加，解析的时候自动添加，其余的查询方式需要包含添加的查询条件
  `;
  public readonly NoteTag3 = ` 
   #### 帮助
   - 该值为空时查询结果不执行分页
   - 总条数: SELECT COUNT(no) FROM Demo_Student WHERE (Name LIKE '%@Key%' OR No LIKE '%@Key%')
  `;
  public readonly NoteTag = ` 
   #### 帮助
   - 该选项可以为空,在右上角的列表里查询或点树树干的数据源出现的列表,需要用中文显示列头.
   - 例如: No=编号,Name=名称,Addr=地址,Tel=电话,Email=邮件
  `;
  public readonly NoteTag5 = ` 
 
  #### 帮助
 
   - 该选项可以为空,弹出框确定后执行的JS，可以直接写方法名或者方法. 

  `;
}
