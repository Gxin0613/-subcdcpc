import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';

// 树干叶子弹窗
export class PopTreeEns extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.PopTreeEns');
    if (!!mypk) this.MyPK = mypk;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsUpdate = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapExt', '树干叶子弹窗');

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
    const NoteTag = `
#### 帮助：列名中文对照参数说明
- 该选项可以为空,列表的表头需要用中文显示.
- **示例**：
  \`\`\`
  No=编号,Name=名称,Tel=电话,Email=邮件
  \`\`\`
`;
    map.AddTBString('Tag', null, '列名中文对照', true, false, 0, 50, 200, true, NoteTag);

    const NoteTag1 = `
#### 帮助：搜索数据源参数说明
- **描述**：通过点击弹窗中的查询按钮执行搜索操作，返回相应的数据源。
- **@Key 参数说明**：
  - 描述：这是搜索的关键字。
  - 示例：输入关键字后，系统将基于该关键字进行搜索。
##### 使用示例
- **URL 示例**：
  \`\`\`
  /DataUser/Handler.ashx?DoType=SearchEmps&Keyword=@Key
  \`\`\`
  - 说明：在 URL 中，\`@Key\` 将被替换为实际的关键字，用于执行搜索操作。
- **SQL 示例**：
  \`\`\`sql
  SELECT No, Name FROM Port_Emp WHERE No LIKE '%@Key%' OR Name LIKE '%@Key%'
  \`\`\`
  - 说明：在 SQL 查询中，\`@Key\` 将被替换为实际的关键字，用于在 \`Port_Emp\` 表中搜索匹配的记录。
    `;

    const url = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=Pop.TreeSearch');
    map.AddLink('Tag1', '设置-搜索数据源', url, false, GPNReturnType.OpenUrlByDrawer50, NoteTag1, 'icon-settings');

    const NoteTag2 = `
#### 帮助：左侧树列表数据源参数说明
- **数据源要求**：
  - 必须能够返回 JSON 格式的数据。
  - 数据源应包含以下三个约定的列：\`No\`（编号）、\`Name\`（名称）、\`ParentNo\`（父级编号）。
##### 使用示例
- **URL 示例**：
  \`\`\`
  /DataUser/Handler.ashx?DoType=ReqDepts
  \`\`\`
- **SQL 示例**：
  \`\`\`sql
  SELECT No, Name, ParentNo FROM Port_Dept
  \`\`\`
    `;
    //map.AddTBStringDoc('Tag2', null, '左侧树列表数据源', true, false, true, NoteTag2);
    const url2 = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=Pop.Tree');
    map.AddLink('Tag2', '设置-树数据源', url2, false, GPNReturnType.OpenUrlByDrawer50, NoteTag2, 'icon-settings');
    const NoteTag3 = `
#### 帮助：实体数据源参数说明
- **选择左边的树返回的详细信息列表数据源**：
  - \`@Key\` 是关键字，代表选择的树节点编号。
##### 使用示例
- **URL 示例**：
  \`\`\`
  /DataUser/Handler.ashx?DoType=ReqEmpsByDeptNo&DeptNo=@Key
  \`\`\`
- **SQL 示例**：
  \`\`\`sql
  SELECT No, Name, Tel, Email FROM Port_Emp WHERE FK_Dept = '@Key'
  \`\`\`
    `;

    const url3 = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', '@MyPK', '&MarkID=Pop.Dtl');
    map.AddLink('Tag3', '设置-实体数据源', url3, false, GPNReturnType.OpenUrlByDrawer50, NoteTag3, 'icon-settings');

    const NoteTag5 = `
#### 帮助
 - 该选项可以为空,弹出框确定后执行的JS，可以直接写方法名或者方法.
        `;
    map.AddTBString('Tag5', null, '确定后执行的JS', false, false, 0, 50, 200, true, NoteTag5);
    map.AddGroupAttr('外观');
    map.AddRadioBtn('ShowModel', 0, '展示方式', false, false, 'ShowModel', '@0=POP弹出窗@1=下拉搜索选择', null, true);
    map.AddRadioBtn('PopSelectType', 1, '选择类型', true, true, 'PopSelectType', '@0=单选@1=多选', null, true);
    //map.AddRadioBtn('OpenPopType', 1, '打开Pop弹出窗的方式', true, true, 'OpenPopType', '@0=双击打开@1=点击按钮打开', null, true);
    map.AddTBString('Title', null, '标题', true, false, 0, 50, 200, false);
    map.AddTBString('BtnLab', '查找', '查找按钮标签', true, false, 0, 50, 200);
    map.AddTBInt('H', 400, '弹窗高度', true, false);
    map.AddTBInt('W', 500, '弹窗宽度', true, false);
    map.AddTBAtParas(4000);
    //参数字段.  @SelectType=1@IsEnter=0
    map.ParaFields = ',Title,BtnLab,SearchTip,ShowModel,PopSelectType,';

    this._enMap = map;
    return this._enMap;
  }
}
