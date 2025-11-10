import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';
import { Student } from './Student';
import { DataType } from '/@/bp/en/DataType';
import WebUser from '/@/bp/web/WebUser';
import Dev2InterfaceCCBill from '/@/CCFast/Dev2InterfaceCCBill';

/**
 * GPN_Demo 示例类
 * 展示 GPN（Group Page New）组件的各种用法
 * GPN 是系统中用于创建向导式页面的基础组件类
 */
export class GPN_Demo extends PageBaseGroupNew {
  constructor() {
    super('GPN_Demo');
    this.PageTitle = '新建Demo - GPN组件示例';
    // this.ForEntityClassID = 'TS.Demo.Student'; // 关联的实体类ID
  }

  public async Init() {
    // ==================== 分组A: 文本输入类组件 ====================
    this.AddGroup('A', '文本输入类组件', 'icon-edit', '各种文本输入框的使用示例');

    // 示例1: 单个文本框（仅名称）
    this.TextBox1_Name('TextBox1_Name', '单文本框-名称', this.Help_TextBox1_Name, '名称', '默认学生姓名', '请输入学生姓名，不能为空');

    // 示例2: 双文本框（编号+名称）
    this.TextBox2_NameNo(
      'TextBox2_NameNo',
      '双文本框-编号+名称',
      this.Help_TextBox2_NameNo,
      'Stu_', // 编号前缀
      '学生编号',
      '学生名称',
      '', // 默认值
    );

    // 示例3: 三文本框（编号+名称+备注）
    this.TextBox3_NameNoNote(
      'TextBox3_NameNoNote',
      '三文本框-编号+名称+备注',
      this.Help_TextBox3_NameNoNote,
      'Stu_', // 编号前缀，会自动生成拼音
      '学生编号',
      '学生姓名',
      '备注说明',
      '', // 默认值
    );

    // 示例4: 大文本框（多行文本）
    this.TextArea('TextArea', '多行文本框', this.Help_TextArea, '学生简介', '这是一段默认的学生简介...', '请输入学生简介，长度在1-900字符');

    // 示例5: SQL文本框（用于输入SQL语句）
    this.TextSQL('TextSQL', 'SQL语句输入', this.Help_TextSQL, 'SQL查询语句', 'SELECT * FROM Demo_Student WHERE 1=1', '请输入有效的SQL查询语句');

    // 示例6: URL文本框
    this.TextUrl('TextUrl', 'URL地址输入', this.Help_TextUrl, '个人主页', 'https://example.com', '请输入完整的URL地址');

    // ==================== 分组B: 列表选择类组件 ====================
    this.AddGroup('B', '列表选择类组件', 'icon-list', '各种列表选择模式的示例');

    // 示例7: SQL数据源单选列表
    this.SelectItemsByList(
      'SelectItemsByListSQL',
      '单选列表-SQL数据源',
      this.Help_SelectItemsByListSQL,
      false, // 单选
      'DemoStudent_Student_BanJi', // SQL标记
    );

    // 示例8: JSON枚举数据源多选列表
    this.SelectItemsByList(
      'SelectItemsByListJSON',
      '多选列表-JSON数据源',
      this.Help_SelectItemsByListJSON,
      true, // 多选
      this.GenerZZMM, // 方法返回JSON数据
      true, // 显示编号
      true, // 启用搜索
      '0,1', // 默认选中项
    );

    // 示例9: 表格选择模式
    this.Table(
      'TableSelect',
      '表格选择-人员列表',
      this.Help_TableSelect,
      true, // 多选
      'SELECT No,Name,DeptName,Tel FROM Port_Emp ORDER BY No',
    );

    // 示例10: 带自定义列的表格
    this.AddTableByOptions({
      no: 'TableSelectWithColumns',
      name: '自定义列表格',
      helpDocs: this.Help_TableSelectWithColumns,
      IsMultiSelect: false,
      srcOfList: this.GenerStudentTableData,
      columns: [
        { title: '编号', key: 'No', width: 100 },
        { title: '姓名', key: 'Name', width: 120 },
        { title: '班级', key: 'BanJi', width: 100 },
        { title: '分数', key: 'Score', width: 80 },
      ],
    });

    // ==================== 分组C: 树形和分组选择 ====================
    this.AddGroup('C', '树形与分组选择', 'icon-tree', '树形结构和分组列表的选择');

    // 示例11: 树形选择（组织架构）
    this.SelectItemsByTree(
      'TreeSelect',
      '树形选择-组织架构',
      this.Help_TreeSelect,
      false, // 单选
      this.GenerOrgTree, // 生成树形数据的方法
      '0', // 根节点编号
      true, // 启用搜索
      '', // 默认选中
      false, // 非懒加载
    );

    // 示例12: 分组列表选择
    this.SelectItemsByGroupList(
      'GroupListSelect',
      '分组列表-按部门选人',
      this.Help_GroupListSelect,
      true, // 多选
      'SELECT No,Name FROM Port_Dept ORDER BY No', // 分组数据源
      'SELECT No,Name,FK_Dept FROM Port_Emp ORDER BY No', // 列表数据源
      true, // 启用搜索
      '', // 默认选中
      'FK_Dept', // 关联字段
    );

    // 示例13: 树表结构（左侧树右侧表）
    this.SelectItemsByTreeEns(
      'TreeEnsSelect',
      '树表结构-部门人员',
      this.Help_TreeEnsSelect,
      true, // 多选
      'SELECT No,Name,ParentNo FROM Port_Dept', // 树数据源
      '0', // 根节点
      'SELECT No,Name,FK_Dept,Tel FROM Port_Emp', // 表数据源
      'No=编号,Name=姓名,Tel=电话', // 列映射
      false, // 非懒加载
      'SELECT No,Name FROM Port_Emp WHERE Name LIKE @Key', // 搜索数据源
      true, // 启用搜索
    );

    // ==================== 分组D: 功能与导航 ====================
    this.AddGroup('D', '功能与导航组件', 'icon-function', '按钮、链接、自定义功能');

    // 示例14: 跳转到实体编辑页面
    this.AddGoToUrl('GoToEntity', '跳转-实体编辑页面', GloComm.UrlEn('TS.Demo.Student', ''), this.Help_GoToEntity);

    // 示例15: 跳转到IFrame页面
    this.AddGoToIFrm('GoToIFrame', '跳转-IFrame页面', 'https://doc.ccflow.org', this.Help_GoToIFrame);

    // 示例16: 执行自定义函数
    this.AddFunction('CustomFunction', '执行自定义功能', this.ExecuteCustomFunction);

    // 示例17: 执行异步函数
    this.AddFunction('AsyncFunction', '执行异步计算', async () => {
      // 模拟异步操作
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return new GPNReturnObj(GPNReturnType.Message, '异步操作执行完成！当前时间：' + new Date().toLocaleTimeString());
    });

    // ==================== 分组E: 文件操作 ====================
    this.AddGroup('E', '文件操作组件', 'icon-upload', '文件上传与导入导出');

    // 示例18: 单文件上传
    this.FileUpload('FileUpload', '单文件上传', '支持的文件格式：.xlsx, .xls, .csv', this.Help_FileUpload);

    // 示例19: 文件夹上传
    this.FolderUpload('FolderUpload', '文件夹上传', '支持批量上传文件夹内的所有文件', this.Help_FolderUpload);

    // ==================== 分组F: 帮助与说明 ====================
    this.AddGroup('F', '帮助文档示例', 'icon-help', '展示帮助文档的使用');

    // 示例20: 纯帮助页面
    this.AddHelp('HelpPage', '查看详细帮助', this.Help_DetailHelp);

    // 示例21: 空白页面（可用于占位或自定义）
    this.AddBlank('BlankPage', '空白自定义页面', this.Help_BlankPage, 'icon-code');
  }

  // ==================== 数据源方法 ====================

  /**
   * 生成政治面貌枚举数据
   * 用于 SelectItemsByList 的 JSON 数据源示例
   */
  public async GenerZZMM() {
    return JSON.stringify([
      { No: '0', Name: '群众' },
      { No: '1', Name: '团员' },
      { No: '2', Name: '党员' },
      { No: '3', Name: '预备党员' },
    ]);
  }

  /**
   * 生成学生表格数据
   * 用于表格选择的数据源示例
   */
  public async GenerStudentTableData() {
    return JSON.stringify([
      { No: 'S001', Name: '张三', BanJi: '一年级1班', Score: 95 },
      { No: 'S002', Name: '李四', BanJi: '一年级1班', Score: 88 },
      { No: 'S003', Name: '王五', BanJi: '一年级2班', Score: 92 },
      { No: 'S004', Name: '赵六', BanJi: '一年级2班', Score: 85 },
    ]);
  }

  /**
   * 生成组织树数据
   * 用于树形选择的数据源示例
   */
  public async GenerOrgTree() {
    return JSON.stringify([
      { No: '0', Name: '根组织', ParentNo: '-1', Icon: 'icon-org' },
      { No: '01', Name: '研发部', ParentNo: '0', Icon: 'icon-dept' },
      { No: '0101', Name: '前端组', ParentNo: '01', Icon: 'icon-team' },
      { No: '0102', Name: '后端组', ParentNo: '01', Icon: 'icon-team' },
      { No: '02', Name: '市场部', ParentNo: '0', Icon: 'icon-dept' },
      { No: '0201', Name: '销售组', ParentNo: '02', Icon: 'icon-team' },
    ]);
  }

  /**
   * 获得类别/分类
   * 如果返回为空数组，表示不需要分类
   * 如果返回分类列表，会在页面顶部显示分类选择
   */
  public async GenerSorts() {
    // 示例：返回学生类型分类
    // return Promise.resolve([
    //   { No: '1', Name: '本科生' },
    //   { No: '2', Name: '研究生' },
    //   { No: '3', Name: '博士生' },
    // ]);

    // 不需要分类时返回空数组
    return Promise.resolve([]);
  }

  // ==================== 自定义功能方法 ====================

  /**
   * 执行自定义功能示例
   * 演示如何通过 AddFunction 绑定自定义业务逻辑
   */
  public ExecuteCustomFunction = async () => {
    const userName = WebUser.Name;
    const currentTime = new Date().toLocaleString();

    return new GPNReturnObj(GPNReturnType.Message, `你好，${userName}！\n当前时间：${currentTime}\n这是一个自定义功能示例。`);
  };

  // ==================== 保存业务逻辑 ====================

  /**
   * 重写保存方法实现业务逻辑
   * 该方法会在用户点击"保存"或"下一步"时被调用
   * @param pageID 页面ID，对应 Init() 中定义的各个组件的 no 参数
   * @param sortNo 分类编号（如果使用了 GenerSorts 返回分类，这里会传入选中的分类编号）
   * @param tb1 第1个文本框的值
   * @param tb2 第2个文本框的值
   * @param tb3 第3个文本框的值
   */
  public override async Save_TextBox_X(pageID: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    // 示例1: 处理单文本框输入
    if (pageID === 'TextBox1_Name') {
      const name = _tb1;
      if (!name || name.trim() === '') {
        return new GPNReturnObj(GPNReturnType.Error, '姓名不能为空！');
      }
      console.log('收到姓名：', name);
      return new GPNReturnObj(GPNReturnType.Message, `姓名【${name}】保存成功！`);
    }

    // 示例2: 处理双文本框（编号+名称）
    if (pageID === 'TextBox2_NameNo') {
      const no = _tb2; // 编号
      const name = _tb1; // 名称

      // 验证编号是否已存在
      const stu = new Student(no);
      if (await stu.IsExits()) {
        return new GPNReturnObj(GPNReturnType.Error, `学生编号【${no}】已存在，请使用其他编号。`);
      }

      // 创建新学生记录
      stu.No = no;
      stu.Name = name;
      stu.RDT = DataType.CurrentDateTime;
      stu.RecNo = WebUser.No;
      stu.RecName = WebUser.Name;
      stu.RecDeptNo = WebUser.DeptNo;
      stu.RecDeptName = WebUser.DeptName;
      stu.OrgNo = WebUser.OrgNo;

      await stu.DirectInsert();
      await Dev2InterfaceCCBill.WriteTrack('Demo_Student', stu.No, '创建学生记录');

      // 保存成功后跳转到学生详情页
      return new GPNReturnObj(GPNReturnType.GoToUrl, GloComm.UrlEn('TS.Demo.Student', no));
    }

    // 示例3: 处理三文本框（编号+名称+备注）
    if (pageID === 'TextBox3_NameNoNote') {
      const no = _tb2;
      const name = _tb1;
      const note = _tb3;

      console.log('收到数据：', { no, name, note });
      return new GPNReturnObj(GPNReturnType.Message, `数据保存成功！\n编号：${no}\n姓名：${name}\n备注：${note || '无'}`);
    }

    // 示例4: 处理文本域
    if (pageID === 'TextArea') {
      const content = _tb1;
      if (content.length > 900) {
        return new GPNReturnObj(GPNReturnType.Error, '内容长度不能超过900字符！');
      }
      return new GPNReturnObj(GPNReturnType.Message, '学生简介保存成功！');
    }

    // 示例5: 处理SQL输入
    if (pageID === 'TextSQL') {
      const sql = _tb1;
      if (!sql.toLowerCase().includes('select')) {
        return new GPNReturnObj(GPNReturnType.Error, '请输入有效的SELECT查询语句！');
      }
      return new GPNReturnObj(GPNReturnType.Message, 'SQL语句验证通过！');
    }

    // 示例6: 处理URL输入
    if (pageID === 'TextUrl') {
      const url = _tb1;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return new GPNReturnObj(GPNReturnType.Error, 'URL必须以http://或https://开头！');
      }
      return new GPNReturnObj(GPNReturnType.Message, 'URL保存成功！');
    }

    // 示例7-10: 处理列表选择
    if (pageID === 'SelectItemsByListSQL' || pageID === 'SelectItemsByListJSON') {
      const selectedValue = _tb1; // 选中的值（单选为单个值，多选为逗号分隔的字符串）
      return new GPNReturnObj(GPNReturnType.Message, `选择成功！\n选中项：${selectedValue}`);
    }

    // 示例11-13: 处理树形和分组选择
    if (pageID === 'TreeSelect' || pageID === 'GroupListSelect' || pageID === 'TreeEnsSelect') {
      const selectedValue = _tb1;
      return new GPNReturnObj(GPNReturnType.Message, `选择成功！\n选中项：${selectedValue}`);
    }

    // 示例18: 处理文件上传
    if (pageID === 'FileUpload') {
      const uploadedFile = this.UploadFile;
      if (!uploadedFile) {
        return new GPNReturnObj(GPNReturnType.Error, '请先选择要上传的文件！');
      }
      console.log('上传的文件：', uploadedFile);
      // 这里可以添加文件处理逻辑
      return new GPNReturnObj(GPNReturnType.Message, `文件【${uploadedFile.name}】上传成功！`);
    }

    // 示例19: 处理文件夹上传
    if (pageID === 'FolderUpload') {
      const uploadedFiles = this.UploadFilArr;
      if (!uploadedFiles || uploadedFiles.length === 0) {
        return new GPNReturnObj(GPNReturnType.Error, '请先选择要上传的文件夹！');
      }
      return new GPNReturnObj(GPNReturnType.Message, `文件夹上传成功！共${uploadedFiles.length}个文件。`);
    }

    // 默认处理
    return new GPNReturnObj(GPNReturnType.Message, `页面【${pageID}】的数据已处理。`);
  }

  // ==================== 帮助文档 ====================

  // 文本输入类帮助文档
  public readonly Help_TextBox1_Name = `
#### 单文本框使用说明
- **功能**: 用于输入单个文本字段，通常是名称类信息
- **参数说明**:
  - \`no\`: 组件唯一标识
  - \`name\`: 页面显示的标题
  - \`helpDocs\`: 帮助文档（就是这个内容）
  - \`descName\`: 输入框的标签文字
  - \`defaultVal\`: 默认值
  - \`placeholder\`: 输入提示文字
- **使用场景**: 适用于姓名、标题等单一文本信息的输入
- **保存处理**: 在 \`Save_TextBox_X\` 方法中通过 \`tb1\` 参数获取输入值
`;

  public readonly Help_TextBox2_NameNo = `
#### 双文本框使用说明
- **功能**: 提供编号和名称两个输入框，编号支持前缀和自动拼音
- **参数说明**:
  - \`pix\`: 编号前缀（如'Stu_'），系统会自动根据名称生成拼音补全编号
  - \`descNo\`: 编号输入框的标签
  - \`descName\`: 名称输入框的标签
- **自动拼音**: 输入名称后，编号框会自动填充为"前缀+拼音"
- **保存处理**: 
  - \`tb1\` = 名称
  - \`tb2\` = 编号
- **适用场景**: 创建实体、部门、人员等需要编号+名称的业务对象
`;

  public readonly Help_TextBox3_NameNoNote = `
#### 三文本框使用说明
- **功能**: 提供编号、名称、备注三个输入框
- **参数说明**: 在双文本框基础上增加了 \`descNote\` 备注字段
- **保存处理**:
  - \`tb1\` = 名称
  - \`tb2\` = 编号
  - \`tb3\` = 备注
- **适用场景**: 需要更详细描述信息的业务对象创建
`;

  public readonly Help_TextArea = `
#### 多行文本框使用说明
- **功能**: 提供大块文本输入区域
- **特点**: 
  - 支持换行输入
  - 可设置字符长度限制
  - 适合输入描述、说明等长文本
- **保存处理**: 通过 \`tb1\` 参数获取文本内容
- **使用场景**: 简介、描述、备注等需要较长文本的字段
`;

  public readonly Help_TextSQL = `
#### SQL文本框使用说明
- **功能**: 专门用于输入SQL语句的文本框
- **特点**:
  - 支持SQL语法高亮（在某些UI实现中）
  - 通常用于配置数据源、查询条件等
- **注意事项**:
  - 需要验证SQL语法的合法性
  - 注意SQL注入风险
- **使用场景**: 数据源配置、自定义查询、报表定义等
`;

  public readonly Help_TextUrl = `
#### URL文本框使用说明
- **功能**: 用于输入URL地址的文本框
- **验证规则**:
  - 需要以 http:// 或 https:// 开头
  - 可以添加URL格式验证
- **使用场景**: 个人主页、外链配置、API接口地址等
`;

  // 列表选择类帮助文档
  public readonly Help_SelectItemsByListSQL = `
#### SQL数据源列表选择说明
- **功能**: 从数据库查询结果中选择一项或多项
- **数据源**: 使用SQL标记（在系统中预定义的SQL查询）
- **参数说明**:
  - \`IsMultiSelect\`: false为单选，true为多选
  - \`srcOfList\`: SQL标记名称或SQL语句
- **返回值**: 
  - 单选: 选中项的No值
  - 多选: 逗号分隔的No值字符串（如"1,2,3"）
- **使用场景**: 选择班级、部门、类别等基础数据
`;

  public readonly Help_SelectItemsByListJSON = `
#### JSON数据源列表选择说明
- **功能**: 从JSON数据中选择项
- **数据源**: 通过方法返回JSON字符串
- **JSON格式**: \`[{No:'值',Name:'显示文本'},...]\`
- **额外功能**:
  - 支持显示编号
  - 支持搜索功能
  - 支持默认选中项
- **使用场景**: 枚举值选择、状态选择等固定选项的场景
`;

  public readonly Help_TableSelect = `
#### 表格选择模式说明
- **功能**: 以表格形式展示数据供用户选择
- **特点**:
  - 可显示多列信息
  - 支持排序、筛选
  - 适合数据项较多的选择场景
- **数据源**: SQL查询语句
- **使用场景**: 选择人员、客户、产品等信息丰富的数据
`;

  public readonly Help_TableSelectWithColumns = `
#### 自定义列表格说明
- **功能**: 可自定义列定义的表格选择
- **优势**:
  - 完全控制列的显示
  - 可设置列宽度
  - 支持自定义渲染
- **列定义格式**: 
\`\`\`
{ title: '列标题', key: '字段名', width: 宽度 }
\`\`\`
- **使用场景**: 需要精确控制表格展示的复杂选择场景
`;

  // 树形和分组选择帮助文档
  public readonly Help_TreeSelect = `
#### 树形选择说明
- **功能**: 以树形结构展示和选择数据
- **数据结构**: \`{No:'',Name:'',ParentNo:'',Icon:''}\`
- **特点**:
  - 支持层级展示
  - 支持搜索
  - 可懒加载（大数据量场景）
- **参数说明**:
  - \`rootNo\`: 根节点编号
  - \`isLazily\`: 是否懒加载
- **使用场景**: 组织架构、分类目录、地区选择等层级数据
`;

  public readonly Help_GroupListSelect = `
#### 分组列表选择说明
- **功能**: 左侧显示分组，右侧显示该组下的列表项
- **数据源**: 需要两个SQL查询
  - 分组数据源: 返回分组列表
  - 列表数据源: 返回全部项（包含分组外键）
- **关联字段**: 列表中关联分组的外键字段名
- **使用场景**: 按部门选人员、按类别选商品等场景
`;

  public readonly Help_TreeEnsSelect = `
#### 树表结构选择说明
- **功能**: 左侧树形，右侧表格的组合选择模式
- **特点**: 
  - 点击树节点，右侧表格显示该节点关联的数据
  - 支持搜索全部数据
- **数据源**: 需要三个SQL
  - 树数据源
  - 表数据源
  - 搜索数据源（可选）
- **列映射**: 定义表格列的显示，格式: \`字段名=中文名,字段名=中文名\`
- **使用场景**: 复杂的层级数据选择，如部门人员、分类商品等
`;

  // 功能与导航帮助文档
  public readonly Help_GoToEntity = `
#### 跳转实体编辑页面说明
- **功能**: 跳转到指定实体的编辑页面
- **URL生成**: 使用 \`GloComm.UrlEn()\` 方法生成
- **参数**:
  - 实体类ID（如'TS.Demo.Student'）
  - 实体编号（为空表示新建）
- **使用场景**: 从向导直接跳转到实体详情页
`;

  public readonly Help_GoToIFrame = `
#### 跳转IFrame页面说明
- **功能**: 在IFrame中打开指定URL
- **特点**:
  - 在系统内部打开外部页面
  - 保持系统菜单和导航
- **使用场景**: 集成外部系统、帮助文档、第三方工具等
`;

  // 文件操作帮助文档
  public readonly Help_FileUpload = `
#### 文件上传说明
- **功能**: 上传单个文件
- **支持格式**: 可在 \`fileDesc\` 中说明支持的文件格式
- **获取文件**: 在 \`Save_TextBox_X\` 中通过 \`this.UploadFile\` 获取
- **处理方式**:
  - 可以读取文件内容
  - 可以上传到服务器
  - 可以解析Excel等文件
- **使用场景**: 导入Excel、上传附件、批量导入等
`;

  public readonly Help_FolderUpload = `
#### 文件夹上传说明
- **功能**: 批量上传文件夹内的所有文件
- **获取文件**: 通过 \`this.UploadFilArr\` 获取文件数组
- **使用场景**: 批量上传图片、文档、模板等
`;

  // 其他帮助文档
  public readonly Help_DetailHelp = `
#### GPN组件详细帮助文档

### 什么是GPN组件？
GPN（Group Page New）是系统中用于创建向导式页面的基础组件类。它将复杂的创建流程分解为多个简单的步骤，每个步骤完成特定的任务。

### GPN的核心特性

#### 1. 分组管理
- 使用 \`AddGroup()\` 创建分组
- 每个分组可包含多个步骤
- 支持图标和帮助说明

#### 2. 丰富的组件类型
- 文本输入: 单框、双框、三框、文本域
- 列表选择: 单选、多选、表格、树形
- 功能导航: 跳转、执行函数
- 文件操作: 上传文件、文件夹

#### 3. 灵活的数据源
- SQL查询
- JSON数据
- 自定义方法
- 实体对象

#### 4. 完整的生命周期
- \`Init()\`: 初始化页面结构
- \`GenerSorts()\`: 提供分类选择
- \`Save_TextBox_X()\`: 处理保存逻辑

### 返回类型说明
- \`Message\`: 显示提示消息
- \`Error\`: 显示错误消息
- \`GoToUrl\`: 跳转到指定URL
- \`Close\`: 关闭当前窗口
- \`CloseAndReload\`: 关闭并刷新父页面
- \`OpenUrlByDrawer\`: 侧边栏打开
- \`OpenUrlByModal\`: 模态框打开

### 最佳实践
1. 合理分组，每组4-6个步骤为宜
2. 提供清晰的帮助文档
3. 验证用户输入，及时给出错误提示
4. 使用合适的返回类型引导用户
5. 记录操作日志，便于追溯

### 相关文档
- 基类: \`PageBaseGroupNew\`
- 位置: \`/@/bp/UIEntity/PageBaseGroupNew\`
- 示例: 本Demo文件
`;

  public readonly Help_BlankPage = `
#### 空白页面说明
- **功能**: 创建一个空白页面占位符
- **用途**:
  - 功能未实现时的占位
  - 自定义复杂组件的容器
  - 纯展示性页面
- **特点**: 
  - 只显示帮助文档
  - 不包含任何输入组件
  - 可自定义图标
  `;
}
