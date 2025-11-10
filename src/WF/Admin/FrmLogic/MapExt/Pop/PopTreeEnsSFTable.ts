import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExt } from '../../MapExt';

// 树干叶子弹窗
export class PopTreeEnsSFTable extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.PopTreeEnsSFTable');
    // this.RefEnName = 'TS.Sys.MapExt'; //关联更新的类.
    if (!!mypk) this.MyPK = mypk;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsUpdate = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapExt', '树干叶子模式(绑定字典表)');

    map.AddGroupAttr('数据来源');
    map.AddMyPK();
    map.AddTBString('FK_MapData', null, '表单ID', false, false, 0, 50, 200);
    map.AddTBString('ExtModel', 'Pop', '模式(大类)', false, false, 0, 50, 200);
    map.AddTBString('ExtType', null, '类型(小类)', false, false, 0, 50, 200);

    const NoteSearchTip = `
#### 帮助：搜索提示参数说明
- **搜索提示背景文字**：显示在搜索文本框中的背景提示文字，旨在引导用户输入正确的搜索关键词。例如：
  - “请输入付款人名称，进行搜索。”
  - “输入人员编号、名称、名称全拼或简拼关键字进行搜索。”
    `;
    map.AddTBString('SearchTip', null, '搜索提示', true, false, 0, 50, 200, true, NoteSearchTip);
    //  map.AddTBStringDoc(Tag1, null, '搜索数据源', true, false, true, this.NoteTag1);
    MapExt.AddAttrSFTable(map, 'Tag1', '搜索数据源', 1);

    //map.AddTBStringDoc(Tag2, null, '左侧树列表数据源', true, false, true, this.NoteTag2);
    MapExt.AddAttrSFTable(map, 'Tag2', '左侧树列表数据源', 0, 1);

    map.AddTBString('Doc', null, '根节点树编号', true, false, 0, 50, 200, false, this.NotDoc);
    // map.AddTBStringDoc(Tag3, null, '实体数据源', true, false, true, this.NoteTag3);
    MapExt.AddAttrSFTable(map, 'Tag3', '实体数据源', 1);

    const NoteTag = `
#### 帮助：列名中文对照参数说明
- 该选项可以为空,列表的表头需要用中文显示.
- **示例**：
  \`\`\`
  No=编号,Name=名称,Tel=电话,Email=邮件
  \`\`\`
`;
    map.AddTBString('Tag', null, '列名中文对照', true, false, 0, 50, 200, true, NoteTag);
    map.AddTBString('Tag5', null, '确定后执行的JS', false, false, 0, 50, 200, true, this.NoteTag5);

    map.AddGroupAttr('外观');
    map.AddRadioBtn('ShowModel', 1, '展示方式', false, true, 'ShowModel', '@0=POP弹出窗@1=下拉搜索选择', null, true);
    map.AddRadioBtn('PopSelectType', 1, '选择类型', true, true, 'PopSelectType', '@0=单选@1=多选', null, true);
    map.AddRadioBtn('OpenPopType', 1, '打开Pop弹出窗的方式', true, true, 'OpenPopType', '@0=双击打开@1=点击按钮打开', null, true);
    map.AddTBString('Title', null, '标题', true, false, 0, 50, 200, false);
    map.AddTBString('BtnLab', '查找', '查找按钮标签', true, false, 0, 50, 200);
    map.AddTBInt('H', 400, '弹窗高度', true, false);
    map.AddTBInt('W', 500, '弹窗宽度', true, false);
    map.AddTBAtParas(4000);
    //参数字段.  @SelectType=1@IsEnter=0
    map.ParaFields = ',Title,BtnLab,SearchTip,ShowModel,PopSelectType,OpenPopType,';

    this._enMap = map;
    return this._enMap;
  }

  public readonly NoteTag1 = `
  #### 帮助
   - 点击关键字执行搜索返回的数据源，@Key是关键字,是搜索的关键字.
   - For URL:/DataUser/Handler.ashx?DoType=SearchEmps&Keyword=@Key
   - For SQL: SELECT No,Name FROM Port_Emp WHERE No like '%@Key%' OR Name like '%@Key%'
  `;
  public readonly NoteTag2 = `
  #### 帮助
   - 设置一个可以返回json的数据源该数据源有No,Name,ParentNo三个约定的列.
   - For URL:/DataUser/Handler.ashx?DoType=ReqDepts
   - For SQL:SELECT No,Name, ParentNo FROM Port_Dept
  `;
  public readonly NoteDoc = `
  #### 帮助
   - 支持ccbpm的表达式,比如:@WebUser.DeptNo , @FieldName ,@WebUser.OrgNo 
  `;
  public readonly NoteTag3 = `
  #### 帮助
   - 选择右边的树返回的详细信息列表数据源 ， @Key是关键字,是选择的树节点编号.
   - For URL:/DataUser/Handler.ashx?DoType=ReqEmpsByDeptNo&DeptNo=@Key
   - For SQL:SELECT No,Name FROM Port_Emp WHERE FK_Dept='@Key'
  `;
  public readonly NoteTag5 = `
  #### 帮助
   - 该选项可以为空,弹出框确定后执行的JS，可以直接写方法名或者方法. 
  `;
}
