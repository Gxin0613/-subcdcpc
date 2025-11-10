/**
 * 表单类型
 */
export enum FormType {}

/**
 * 流程设计模式
 * @0=专业模式@1=极简模式@2=累加模式@3=绑定单表单@4=绑定多表单@5=SDK表单@6=嵌入式表单@7=物联网流程
 */
export enum FlowDevModel {
  Prefessional = 0, //专业模式
  JiJian = 1, //极简模式
  FoolTruck = 2, //累加模式
  RefOneFrmTree = 3, //绑定单表单
  FrmTree = 4, //绑定多表单
  SDKFrm = 5, // SDK表单
  SelfFrm = 6, //嵌入式表单
  InternetOfThings = 7, //物联网流程
  FrmExcel = 8, //vsto的Excel
  FrmWord = 9, //vsto的Word,
  TaskTree = 10, //任务树,
  EntityTS = 11, //高低码实体
}

/**
 * 节点表单类型
 */
export enum NodeFormType {
  FoolForm = 0, //经典表单
  FreeForm = 1, //自由表单（现在已经删除）
  SelfForm = 2, //嵌入式表单
  SDKForm = 3, //SDK表单
  SheetTree = 5, //表单树的表单
  SheetAutoTree = 6, //动态树表单
  WebOffice = 7, //公文表单
  ExcelForm = 8, //Excel表单
  WordForm = 9, // Word表单
  FoolTruck = 10, //累加表单
  RefOneFrmTree = 11, //单表单
  Develop = 12, //开发者表单
  ChapterFrm = 13, //章节表单
  RefNodeFrm = 14, //关联其它节点表单.

  EntityTS = 15,
  DisableIt = 100, //禁用(对多表单流程有效)
}

/**
 * 表单类型
 */
export enum FrmType {
  FoolForm = 0, //经典表单
  FreeForm = 1, //自由表单（现在已经删除）
  Url = 3, //URL表单(自定义)
  WordFrm = 4, //Word类型表单
  ExcelFrm = 5, //Excel表单
  VSTOForExcel = 6, // VSTOExccel模式.
  VSTOForWord = 61, // VSTOWord模式.
  Entity = 7, //实体类
  Develop = 8, //开发者表单
  WPSFrm = 9, //WPS表单
  ChapterFrm = 10, //章节表单
  DBList = 100, //外部数据源列表
}
