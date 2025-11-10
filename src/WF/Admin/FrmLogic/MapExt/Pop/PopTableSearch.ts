import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

// 表格弹窗
export class PopTableSearch extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.PopTableSearch');
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
    map.AddTBString('SearchTip', null, '搜索提示', true, false, 0, 50, 200, true, this.NoteSearchTip);

    map.AddGroupAttr('外观');
    map.AddRadioBtn('ShowModel', 0, '展示方式', false, false, 'ShowModel', '@0=POP弹出窗@1=下拉搜索选择', null, true);
    map.AddRadioBtn('PopSelectType', 1, '选择类型', true, true, 'PopSelectType', '@0=单选@1=多选', null, true);
    //map.AddRadioBtn('OpenPopType', 1, '打开Pop弹出窗的方式', true, true, 'OpenPopType', '@0=双击打开@1=点击按钮打开', null, true);
    map.AddBoolean('IsFirstLoad', true, '打开是否直接加载数据', true, true, false);
    map.AddTBString('Title', null, '标题', true, false, 0, 50, 200, false);
    map.AddTBString('BtnLab', '查找', '查找按钮标签', true, false, 0, 50, 200);
    map.AddTBInt(MapExtAttr.H, 500, '弹窗高度', true, false);
    map.AddTBInt(MapExtAttr.W, 900, '弹窗宽度', true, false);

    map.AddGroupAttr('数据源2025');
    map.AddTBStringDoc(MapExtAttr.Tag1, null, '查询条件设置', true, false, true, this.NoteTag1);
    const url = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=Pop.TableInit');
    map.AddLink('Tag4', '设置-数据源', url, false, GPNReturnType.OpenUrlByDrawer50, this.NoteTag2, 'icon-settings');
    const url3 = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=Pop.TablePageNum');
    map.AddLink('Tag5', '设置-分页总数数据源', url3, false, GPNReturnType.OpenUrlByDrawer50, this.NoteTag3, 'icon-settings');
    map.AddTBString(MapExtAttr.Tag, null, '数据列名与中文意思对照', true, false, 0, 200, 200, true, this.NoteTag);

    //参数字段.  @SelectType=1@IsEnter=0
    map.AddTBAtParas(4000);
    map.ParaFields = ',Title,BtnLab,SearchTip,ShowModel,PopSelectType,IsFirstLoad,';

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
  SQL格式为:Para必须是对应查询表中的字段
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
   - 必须有：设置的查询条件必须在数据源中包含,时间的查询条件的设置增加RegDate>='@DTFrom_RegDate' AND RegDate<='@DTTo_RegDate'
   - 分页:MySQL不包含PageIdx,PageSize;SQLServer必须包含PageIdx,PageSize;Oracle,KingBaseR3,KingBaseR6可以包含也可以不包含PageIdx,PageSize,
   - 比如For SQLServer:SELECT TOP @PageSize * FROM ( SELECT row_number() over(order by t.No) as rownumber,No,Name,Tel,Email FROM Demo_Student WHERE Name LIKE '%@Key%' AND BanJiNo='@BanJiNo' AND XB='@XB' AND RegDate>='@DTFrom_RegDate' AND RegDate<='@DTTo_RegDate' ) A WHERE rownumber > @PageIdx
   - 比如For MySQL:SELECT No,Name,Tel,Email FROM Demo_Student WHERE Name LIKE '%@Key%' AND BanJiNo='@BanJiNo' AND XB='@XB' AND RegDate>='@DTFrom_RegDate' AND RegDate<='@DTTo_RegDate' 
  `;
  public readonly NoteTag3 = ` 
   #### 帮助
   - 分页总条数
   - 总条数: SELECT COUNT(no) FROM Demo_Student WHERE Name LIKE '%@Key%' AND BanJiNo='@BanJiNo' AND XB='@XB' AND RegDate>='@DTFrom_RegDate' AND RegDate<='@DTTo_RegDate'
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
