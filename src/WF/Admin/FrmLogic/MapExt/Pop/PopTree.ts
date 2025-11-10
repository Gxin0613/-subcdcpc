import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';

// 树干弹窗
export class PopTree extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.PopTree');
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
    const map = new Map('Sys_MapExt', '树干弹窗');

    map.AddGroupAttr('数据来源');
    map.AddMyPK();
    const NoteSearchTip = `
#### 帮助：搜索提示参数说明
- **搜索提示背景文字**：显示在搜索文本框中的背景提示文字，旨在引导用户输入正确的搜索关键词。例如：
  - “请输入付款人名称，进行搜索。”
  - “输入人员编号、名称、名称全拼或简拼关键字进行搜索。”
    `;
    map.AddTBString('SearchTip', null, '搜索提示', true, false, 0, 50, 200, true, NoteSearchTip);
    const NoteDoc = `
#### 帮助：根节点树编号参数说明
- 此参数用来设置树结构的根节点编号。
- **支持ccbpm表达式**：允许使用特定的ccbpm表达式来指定参数。例如：
  - \`@WebUser.DeptNo\` 表示当前登录人的部门编号
  - \`@表单字段名\` 表示表单中的字段名称，需要填写具体的字段名称
  - \`@WebUser.OrgNo\` 表示当前登录人的组织编号
    `;
    map.AddTBString('Doc', null, '根节点树编号', true, false, 0, 50, 200, false, NoteDoc);
    //     const NoteTag = `
    // #### 帮助：列名中文对照参数说明
    // - 该选项可以为空,列表的表头需要用中文显示.
    // - **示例**：
    //   \`\`\`
    //   No=编号,Name=名称,Tel=电话,Email=邮件
    //   \`\`\`
    // `;
    //   map.AddTBString('Tag', null, '列名中文对照', true, false, 0, 50, 200, true, NoteTag);
    map.AddTBString('Tag5', null, '确定后执行的JS', false, false, 0, 50, 200, true, this.NotTag5);
    map.AddBoolean('IsLazy', false, '是否懒加载?', true, true);
    map.AddBoolean('NodeCascade', true, '父子节点是否级联', true, true);
    map.AddBoolean('IsShowFullPath', false, '是否全路径显示(不显示顶级父节点)', true, true, true);

    const url = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=Pop.TreeSearch');
    map.AddLink('Tag1', '设置-搜索数据源', url, false, GPNReturnType.OpenUrlByDrawer50, this.NotTag1, 'icon-settings');
    const url2 = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=Pop.TreeDB');
    map.AddLink('Tag2', '设置-树干数据源', url2, false, GPNReturnType.OpenUrlByDrawer50, this.NotTag2, 'icon-settings');

    map.AddGroupAttr('外观');
    map.AddRadioBtn('ShowModel', 0, '展示方式', true, true, 'ShowModel', '@0=POP弹出窗@1=下拉搜索选择', null, true);
    map.AddRadioBtn('PopSelectType', 1, '选择类型', true, true, 'PopSelectType', '@0=单选@1=多选', null, true);
    //map.AddRadioBtn('OpenPopType', 1, '打开Pop弹出窗的方式', true, true, 'OpenPopType', '@0=双击打开@1=点击按钮打开', null, true);
    map.AddTBString('Title', null, '标题', true, false, 0, 50, 200, false);
    map.AddTBString('BtnLab', '查找', '查找按钮标签', true, false, 0, 50, 200);
    map.AddTBInt('H', 400, '弹窗高度', true, false);
    map.AddTBInt('W', 500, '弹窗宽度', true, false);

    map.AddTBAtParas(4000);
    // map.AddBoolean('IsEnter', false, '是否允许手工输入', true, true);
    //参数字段.  @SelectType=1@IsEnter=0
    map.ParaFields = ',PopSelectType,Title,BtnLab,SearchTip,ShowModel,PopSelectType,IsLazy,NodeCascade,IsShowFullPath,';

    this._enMap = map;
    return this._enMap;
  }
  protected override beforeUpdateInsertAction(): Promise<boolean> {
    if (this.GetParaBoolean('IsLazy') == true && this.Tag2.includes('@Key') == false) {
      alert('配置错误:树干列表数据源必须包含, @Key 表达式, 请参考说明.');
    }
    return Promise.resolve(true);
  }

  public readonly NoteSearchTip = ` 
  #### 帮助
   - 显示在搜索文本框的背景文字，比如:
   - 请输入付款人名称,进行搜索。
   - 输入人员编号,名称，名称全拼,简拼关键字搜索。
   `;
  public readonly NotTag1 = ` 
 
  #### 帮助
   - 点击关键字执行搜索返回的数据源，@Key是关键字,是搜索的关键字.
   - For URL:/DataUser/Handler.ashx?DoType=SearchEmps&Keyword=@Key
   - For SQL: SELECT No,Name FROM Port_Emp WHERE No like '%@Key%' OR Name like '%@Key%'
    `;
  public readonly NotTag2 = ` 
  #### 帮助
   - 设置一个可以返回json的数据源该数据源有No,Name,ParentNo三个约定的列.
   - For URL:/DataUser/Handler.ashx?DoType=ReqDepts
   - For SQL:SELECT No,Name, ParentNo FROM Port_Dept ORDER BY Idx
  #### 懒加载说明:
   - 如果是懒加载，数据源里必须有 @Key 字段.
   - 初始化的时候，使用 @Key 作为父节点的编号。
   - 比如： SELECT No,Name,ParentNo FROM Port_Dept WHERE No='@Key' OR ParentNo='@Key' ORDER BY Idx
    `;

  public readonly NotDoc = ` 
  #### 帮助
   - 支持ccbpm的表达式,比如:@WebUser.DeptNo , @FieldName @WebUser.OrgNo
    `;

  public readonly NotTag5 = ` 
  #### 帮助
   - 该选项可以为空,弹出框确定后执行的JS，可以直接写方法名或者方法. 
  `;
}
