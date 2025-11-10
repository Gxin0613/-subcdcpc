import { message } from 'ant-design-vue';
import { WaiGuaBaseFrm } from './WaiGuaBaseFrm';
import { MapExt, MapExts } from '/@/WF/Admin/FrmLogic/MapExt';
import { TableBaseColumn } from 'naive-ui/es/data-table/src/interface';
import { Entity } from '../en/Entity';
import { Rule } from 'ant-design-vue/es/form';

export abstract class WaiGuaBaseEntity extends WaiGuaBaseFrm {
  /**
   * @param classID 类名
   * @param frmID 流程编号或流程标记.
   */
  protected constructor(classID: string, billFrmID: string) {
    if (classID.includes('WGEntity_') == false) {
      message.warning('外挂类名[' + classID + ']不符合规范,必须以 WGEntity_ 开头.');
      return;
    }
    super(classID);
    this.FrmID = billFrmID;
  }
  //工作ID.
  public WorkID?: number;
  //初始化数据.
  abstract Init();
  // 列表的操作按钮.
  public SearchOptBtns?: string | Function;
  // 列表的操作列宽度
  public SearchOptBtnsWidth = 200;
  //增加的查询工具栏上的按钮.
  public SearchToolbarBtns?: string;
  public IgnoreReadonlyBtns?: string; // 忽略只读按钮
  // 实体卡片的按钮.
  public EntityToolbarBtns?: string;
  // 自定义列渲染
  public CustomColumnsRender?: Array<
    TableBaseColumn & {
      afterColumn?: string;
    }
  >;
  // 表格行属性
  public GetRowProps?: (row: Record<string, any>) => Record<string, any>;

  // 表单字段校验规则
  private _validator: Record<string, Rule[]> = {};
  /**
   * 获取扩展类定义的规则
   * @returns Record<string, Rule[]>
   */
  public GetFormRule() {
    return this._validator;
  }
  /**
   * 字段校验，多次调用AddRules最后会合并
   * 规则参考ant-design-vue
   * https://antdv.com/components/form/#api
   * @param rules 表单规则, 依赖于antdv-form组件
   */
  public SetFormRule(rules: Record<string, Rule[]>) {
    this._validator = {
      ...this._validator,
      ...rules,
    };
  }
  // 表单字段校验规则 end

  /* MapExt相关  */
  public HisMapExts?: MapExts; //扩展信息.
  public HisEntity?: Entity; //当前的实体.

  /**
   * 文本框的必填项，最小长度，最大长度
   * @param attrKey 字段
   * @param msg 提示消息
   * @param maxLen 最大长度
   * @param minLen 最小长度
   */
  public CheckEleRole_RequiredMaxMinLin(attrKey: string, msg: string, _maxLen: number, _minLen: number) {
    const en = new MapExt();
    en.AttrOfOper = attrKey;
    en.Msg = msg;
    en.ExtType = 'RegularExpression';
    en.Doc = '';
    en.Tag = 'blur';
    this.HisMapExts?.push(en);
  }
  //增则表达式: msg:提示信息
  /**
   * 增则表达式
   * @param attrKey 键值
   * @param msg 提示消息
   * @param regularExpression 表达式:
   */
  public CheckEleRole_RegularExpression(attrKey: string, msg: string, regularExpression: string) {
    const en = new MapExt();
    en.AttrOfOper = attrKey;
    en.Msg = msg;
    en.ExtType = 'RegularExpression';
    en.Doc = regularExpression;
    en.Tag = 'blur';
    en.Config({
      require: true,
    });
    this.HisMapExts?.push(en);
  }

  // 实体行方法事件，主要增强从表组件
  public RowFunctions: Array<{
    label: string;
    icon: string;
    onClick: (rowData, mainTableClassId, mainTableRowData) => any;
  }> = [];
  // 高代码表头分组配置
  public TableHeaderConfig(): Array<{
    key: string;
    title: string;
    children?: [];
  }> {
    return [];
  }
  //按钮事件.
  public abstract BtnClick(srcEvent: string, btnLab: string, _selectedRowIDs: string, record: Record<string, any> | undefined);
}
