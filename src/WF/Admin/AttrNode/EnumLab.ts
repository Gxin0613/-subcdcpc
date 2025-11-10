// 表单类型
export enum FormSlnType {
  //经典表单
  FoolForm = 0,

  /// 自由表单.
  FreeForm = 1,

  /// 嵌入式表单.
  SelfForm = 2,

  /// SDKForm
  SDKForm = 3,

  /// SL表单
  SLForm = 4,

  /// 表单树
  SheetTree = 5,

  /// 动态表单树
  SheetAutoTree = 6,

  /// 公文表单
  WebOffice = 7,

  /// Excel表单
  ExcelForm = 8,

  /// Word表单

  WordForm = 9,

  /// 傻瓜轨迹表单
  FoolTruck = 10,

  /// 表单库的表单
  RefOneFrmTree = 11,

  /// 开发者表单
  Developer = 12,

  /// 只能SDK表单
  SDKFormSmart = 13,

  //引用指定节点表单.
  RefNodeFrm = 14,

  EntityTS = 15,

  /// 禁用(对多表单流程有效)
  DisableIt = 100,
}
