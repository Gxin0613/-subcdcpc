// 页面模式
export enum PageModelEdit {
  //空白的帮助.
  Blank = 0,
  // 自定义url.
  SelfComponent = 1,
  // 单个文本框.
  SingleTB = 2,
  // 单个文本框，数据存入参数字段.
  SingleTBPara = 3,
  // 单个大块文本.
  SingleTextArea = 4,
  // 富文本.
  SingleRichTxt = 5,
  // SQL文本.
  SingleTBSQL = 6,
  // 实体编辑器.
  Entity = 7,
  // 单独枚举
  SingleEnumRadioButton = 8,
  // 枚举下拉
  SingleDDLEnum = 9,
  // SQL下拉框
  SingleDDLSQL = 10,
  // Entities 下拉框
  SingleDDLEntities = 11,
  //两个文本框.
  TextBox2 = 12,
  // 复选框
  SingleCheckbox = 13,
  //列表选择
  SelectItemsByList = 14,
  //分组列表选择
  SelectItemsByGroupList = 15,
  //树选择
  SelectItemsByTree = 16,
  //树实体选择。
  SelectItemsByTreeEns = 17,

  DBSrcSQL = 18,
  DBSrcWebApiGet = 19,
  DBSrcWebApiPost = 20,
}

// 页面模式
export enum PageModelNew {
  //帮助文档
  Help = -2,
  ///空白的
  Blank = -1,
  // 自定义url.
  SelfComponent = 0,
  //单行文本框.
  Text1Name = 1,
  // 文本域
  Textarea = 4,
  // 2个文本框.
  Text2NoName = 2,
  // 名称 + 描述 -> saas模式流程创建
  Text2NameNote = 201,
  // 3个文本框.
  Text3NoNameNote = 3,
  // 名称 + 下拉框（理论需要3个参数） -> saas模式流程创建
  NameAndDDL = 301,
  // 文件上传
  FileUpload = 10,
  // 文件夹上传
  FolderUpload = 9,
  SelectItemsByTable = 101,
  SelectItemsByList = 11,
  SelectItemsByGroupList = 12,
  SelectItemsByTree = 13,
  SelectItemsByTreeEns = 14,
  TextSQL = 15,
  Finish = 16,
  //增加一个方法，根据方法返回内容执行.
  Func = 17,
  TextUrl = 18,

  // 打开链接
  GoToUrl = 19,
  GoToIFrm = 20,
  CreateMenu = 99,
}
