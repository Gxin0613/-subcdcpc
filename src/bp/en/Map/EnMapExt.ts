import { type StyleValue } from 'vue';
import { AtPara } from '../../da/AtPara';
import { useDtlEventsStore } from '/@/store/modules/dtlEvents';

export enum ExtModel {
  DDLRelation = 'DDLRelation', // 下拉框关联
  AutoEval = 'AutoEval', // 自动计算
  FieldFill = 'FieldFill', // 字段填充
  PopupFill = 'PopupFill', // 控件填充
  Pop = 'Pop', // 弹出窗体
  Summary = 'Summary', // 弹出窗体
  Sort = 'Sort', // 排序
  CascadeControl = 'CascadeControl', // 级联控制
  DateRange = 'DateRange', // 日期控制
  SetStyle = 'SetStyle', // 自定义样式
  FieldLink = 'FieldLink', // 字段链接
  FieldLinkGenerList = 'FieldLinkGenerList',
  FieldChangeListener = 'FieldChangeListener', // 字段变化监听
  VisibleControl = 'VisibleControl',
  DDLSelect = 'DDLSelect', // 显示隐藏控制
  EditTableEvent = 'EditTableEvent', // 编辑表单事件
}

/// 属性
export class EnMapExt {
  // 标签
  public Lab = 'Lab';
  /// <summary>
  /// 表单ID
  /// </summary>
  public FK_MapData: string | null = null;
  public RefPKVal: string | null = null;
  /// <summary>
  /// ExtType
  /// </summary>
  public ExtType: string | null = null;
  /// <summary>
  /// 插入表单的位置
  /// </summary>
  public RowIdx: string | null = null;
  /// <summary>
  /// GroupID
  /// </summary>
  public GroupID: string | null = null;
  /// <summary>
  /// 高度
  /// </summary>
  public H: string | null = null;
  /// <summary>
  /// 宽度
  /// </summary>
  public W: string | null = null;
  /// <summary>
  /// 是否可以自适应大小
  /// </summary>
  public IsAutoSize: string | null = null;
  /// <summary>
  /// 设置的属性
  /// </summary>
  public AttrOfOper: string | null = null;
  //模式
  public ExtModel: string | null = null;
  /// <summary>
  /// 激活的属性
  /// </summary>
  public AttrsOfActive: string | null = null;
  /// <summary>
  /// 执行方式
  /// </summary>
  public DoWay: string | null = null;
  /// <summary>
  /// Tag
  /// </summary>
  public Tag: string | null = null;
  /// <summary>
  /// Tag1
  /// </summary>
  public Tag1: string | null = null;
  // 可见性控制方法
  public validFunc: Function | undefined;
  // 被控制字段
  public VisibleControlKeys: string[] = [];
  /// <summary>
  /// Tag2
  /// </summary>
  public Tag2: string | null = null;
  /// <summary>
  /// Tag3
  /// </summary>
  public Tag3: string | null = null;
  /// <summary>
  /// tag4
  /// </summary>
  public Tag4: string | null = null;
  /// <summary>
  /// tag5
  /// </summary>
  public Tag5: string | null = null;
  public Tag6: string | null = null;

  public Validator: Function | null = null;
  /// <summary>
  /// 数据源
  /// </summary>
  public DBType: string | null = null;
  /// <summary>
  /// Doc
  /// </summary>
  public Doc: string | Function | null = null;
  /// <summary>
  /// Event
  /// </summary>
  public Event: Recordable = {};
  /// <summary>
  /// 参数
  /// </summary>
  public AtPara: AtPara | null = null;
  /// <summary>
  /// 计算的优先级
  /// </summary>
  public PRI: string | null = null;
  /// <summary>
  /// 数据源
  /// </summary>
  public FK_DBSrc: string | null = null;
  /// <summary>
  /// 排序
  /// </summary>
  public Idx: string | null = null;
  // constructor(fileNo = '', fileName = '') {
  //   this.FileNo = fileNo;
  //   this.FileName = fileName;
  // }
  public Styles: StyleValue = {};
}

export class EnMapExts extends Array {
  constructor() {
    super();
  }

  /**
   * 设置排序列，Search页面解析
   * @param columns 排序列
   * @param sortType 排序方式
   */
  public AddSortColumns(columns: string, priority = 0) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = ExtModel.Sort;
    popMapExt.ExtType = ExtModel.Sort;
    popMapExt.Tag1 = columns;
    popMapExt.Tag2 = priority + '';
    this.push(popMapExt);
  }
  /**
   * 添加合计列，Search页面解析
   * @param columns 合计列
   */
  public AddSummaryColumns(columns: string) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = ExtModel.Summary;
    popMapExt.ExtType = ExtModel.Summary;
    popMapExt.Tag1 = columns;
    this.push(popMapExt);
  }
  /**
   * 级联下拉框:
   * @param parentAttr 第一个下拉框
   * @param subAttr 填充的下拉框.
   * @param srcExp 表达式，可以是sql, http, 可以是关联的实体的属性Key.
   */
  public SetJiLian(parentAttrDDL: string, subAttrDDL: string, srcExp: string | Function) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = ExtModel.DDLRelation;
    popMapExt.ExtType = ExtModel.DDLRelation;
    popMapExt.Tag1 = parentAttrDDL;
    popMapExt.Tag2 = subAttrDDL;
    popMapExt.Doc = srcExp;
    this.push(popMapExt);
  }
  /**
   * 级联下拉框:
   * @param parentAttr 第一个下拉框
   * @param subAttr 填充的下拉框.
   * @param srcExp 表达式，可以是sql, http
   */
  public SetJiLianByEnsFK(parentAttrDDL: string, subAttrDDL: string, refKey: string) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = ExtModel.DDLRelation;
    popMapExt.ExtType = ExtModel.DDLRelation;
    popMapExt.Tag1 = parentAttrDDL;
    popMapExt.Tag2 = subAttrDDL;
    popMapExt.Tag4 = refKey;
    this.push(popMapExt);
  }
  /**
   * 注册字段变化监听函数
   * @param targetKey 被监听的字段
   * @param listener 监听器
   */
  public AddFieldChangeListener(targetKey: string, listener: (val, row, mapAttrs, tableData?: Recordable[]) => void) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = ExtModel.FieldChangeListener;
    popMapExt.ExtType = ExtModel.FieldChangeListener;
    popMapExt.Tag1 = targetKey;
    popMapExt.Doc = listener;
    this.push(popMapExt);
  }
  /**
   * 编辑表单事件
   * @param events 事件
   */
  public AddEditTableEvents(events: {
    init?: (tableData: Recordable[]) => void;
    onDelete?: (tableData: Recordable[]) => void;
    handleReturnKeys?: (tableData: Recordable[]) => void;
    handleReturnVals?: (tableData: Recordable[]) => void;
  }) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = ExtModel.EditTableEvent;
    popMapExt.ExtType = ExtModel.EditTableEvent;
    popMapExt.Event = events;
    this.push(popMapExt);
  }
  /**
   * 更新从表列名前缀
   * @param targetKey 被监听的字段
   * @param dtlKey 从表key
   * @param dtlColKey 从表列名
   */
  public UpdateDtlColPrefix(targetKey: string, dtlKey: string, dtlColKey: string) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = ExtModel.FieldChangeListener;
    popMapExt.ExtType = ExtModel.FieldChangeListener;
    popMapExt.Tag1 = targetKey;
    popMapExt.Doc = (val: any, rowData: Recordable) => {
      const mainTableKey = rowData['No'] || rowData['OID'] || rowData['MyPK'] || rowData['NodeID'] || rowData['WorkID'];
      const dtlEventsStore = useDtlEventsStore();
      dtlEventsStore.setEvent(mainTableKey + '-' + dtlKey, {
        type: 'updateColPrefix',
        dtlKey: dtlKey,
        dtlColumn: dtlColKey,
        val,
      });
    };
    this.push(popMapExt);
  }

  /**
   * 当满足方法控制时，字段才显示
   * @param targetKey 触发字段
   * @param visibleControlFunc 校验条件，需要传入方法
   * @param visibleControlKeys 被控制字段
   */
  public AddVisibleControl(targetKey: string, validFunc: (row: Recordable) => boolean, visibleControlKeys: string[]) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = ExtModel.VisibleControl;
    popMapExt.ExtType = ExtModel.VisibleControl;
    popMapExt.Tag1 = targetKey;
    popMapExt.validFunc = validFunc;
    popMapExt.VisibleControlKeys = visibleControlKeys;
    this.push(popMapExt);
  }

  public SetJiLianByAttr(parentAttrDDL: string, subAttrDDL: string, refKey: string) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = ExtModel.DDLRelation;
    popMapExt.ExtType = ExtModel.DDLRelation;
    popMapExt.Tag1 = parentAttrDDL;
    popMapExt.Tag2 = subAttrDDL;
    popMapExt.Doc = '';
    popMapExt.Tag4 = refKey;
    this.push(popMapExt);
  }

  public SetColor(localAttr: string) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = 'MyColor';
    popMapExt.ExtType = 'MyColor';
    popMapExt.Tag1 = localAttr;
    this.push(popMapExt);
  }

  /**
   * 多选
   * @param localAttr 属性
   * @param exps 格式： '游泳,音乐,编程,喝酒,'
   */
  public SetCheckBoxs(localAttr: string, exps: string | Function) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = 'CheckBoxs';
    popMapExt.ExtType = 'CheckBoxs';
    popMapExt.Tag1 = localAttr;
    popMapExt.Doc = exps;
    this.push(popMapExt);
  }

  /**
   * 设置自动计算.
   * @param localAttr 计算的字段,etc: XiaoJi
   * @param exps 表达式,exc:@DanJia*@ShuLiang
   */
  public SetAutoEval(localAttr: string, exps: string | Function) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = ExtModel.AutoEval;
    popMapExt.ExtType = ExtModel.AutoEval;
    popMapExt.Tag1 = localAttr;
    popMapExt.Doc = exps;
    this.push(popMapExt);
  }
  /**
   * 设置填充，比如：文本框自动完成、Pop返回值，在确定按钮以后的自动填充.
   * @param localAttr 激活的属性,
   * @param exps 联动的数据源表达式,必须有@Key 字段,返回的列对应到空间ID上.
   */
  public SetAutoFillCtrls(localAttr: string, exps: string) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = ExtModel.PopupFill;
    popMapExt.ExtType = ExtModel.PopupFill;
    popMapExt.Tag1 = localAttr;
    popMapExt.Doc = exps;
    this.push(popMapExt);
  }

  /**
   * 设置进度，该字段是0-1的小数, 用于显示进度.
   * @param localAttr 设置的字段,
   */
  public SetProgressField(localAttr: string) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = 'ProgressField';
    popMapExt.ExtType = 'ProgressField';
    popMapExt.Tag1 = localAttr;
    popMapExt.Doc = localAttr;
    this.push(popMapExt);
  }
  /**
   * 设置文本框自动完成.
   * @param localAttr 激活的空间,必须是文本框.
   * @param exps 表达式,返回的必须是 No,Name两个字段.
   */
  public SetTextBoxFull(localAttr: string, exps: string | Function) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = ExtModel.FieldFill;
    popMapExt.ExtType = ExtModel.FieldFill;
    popMapExt.Tag1 = localAttr;
    popMapExt.Doc = exps;
    this.push(popMapExt);
  }

  /**
   * 设置级联控制， 如果前面字段为空，则目标字段不可选择
   * @param targetKey 被控制的字段
   * @param prevKey 控制字段
   */
  public SetCascadeControl(prevKey: string, targetKey: string, validator: Function | null = null) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = ExtModel.CascadeControl;
    popMapExt.ExtType = ExtModel.CascadeControl;
    popMapExt.Tag1 = prevKey;
    popMapExt.Tag2 = targetKey;
    popMapExt.Validator = validator;
    this.push(popMapExt);
  }

  /**
   * 设置时间关联，后面的日期将无法超过之前的日期
   * @param startDateKey 开始时间字段
   * @param endDateKey 结束时间字段
   */
  public SetDateRange(startDateKey: string, endDateKey: string) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = ExtModel.DateRange;
    popMapExt.ExtType = ExtModel.DateRange;
    popMapExt.Tag1 = startDateKey;
    popMapExt.Tag2 = endDateKey;
    this.push(popMapExt);
  }

  public SetFieldStyle(attrKey: string, styles: StyleValue) {
    const popMapExt = new EnMapExt();
    popMapExt.AtPara = new AtPara();
    popMapExt.ExtModel = ExtModel.SetStyle;
    popMapExt.ExtType = ExtModel.SetStyle;
    popMapExt.Tag1 = attrKey;
    popMapExt.Styles = styles;
    this.push(popMapExt);
  }

  public SetPopTreeEns(
    keyOfEn: string,
    srcOfTree: string,
    rootNo: string,
    srcOfList: string,
    srcSelectedKey = '',
    isMultipleChoice = true,
    popWidth = `500`,
    popHeight = `400`,
    lab = '请选择',
    icon = 'icon-options',
    isHaveUpperLevel = '0',
    isShowSearch = '0',
  ) {
    // if (1 == 2 && srcOfTree.includes('@Key') == false && srcOfTree.startsWith('DBSrc.') == false) {
    //   alert('错误:SetPopTreeEns数据源' + srcOfTree + '必须包含@Key变量.');
    //   return;
    // }

    // if ((1 == 2 && srcOfList.includes('@Key') == false && srcOfTree.startsWith('DBSrc.') == false) {
    //   alert('错误:SetPopTreeEns数据源' + srcOfList + '必须包含@Key变量.');
    //   return;
    // }

    const popMapExt = new EnMapExt();
    popMapExt.ExtModel = ExtModel.Pop;
    popMapExt.ExtType = 'PopTreeEns';
    popMapExt.AtPara = new AtPara();
    popMapExt.AttrOfOper = keyOfEn;
    popMapExt.Tag1 = srcOfTree;
    popMapExt.Tag3 = srcOfList;
    popMapExt.Tag4 = srcSelectedKey;
    popMapExt.Tag5 = rootNo;
    popMapExt.Tag6 = isHaveUpperLevel;

    //设置参数.
    popMapExt.AtPara.SetVal('Label', lab);
    popMapExt.AtPara.SetVal('Icon', icon);
    popMapExt.AtPara.SetVal('IsShowSearch', isShowSearch);

    //单选还是多选.
    if (isMultipleChoice == true) popMapExt.AtPara.SetVal('IsMultipleChoice', '1');
    else popMapExt.AtPara.SetVal('IsMultipleChoice', '0');

    popMapExt.W = popWidth;
    popMapExt.H = popHeight;
    this.push(popMapExt);
  }
}
