import { TableColumn } from 'naive-ui/es/data-table/src/interface';
import { Map as EntityMap } from '/@/bp/en/Map/Map';
import { Entity } from '../en/Entity';
import { Rule } from 'ant-design-vue/es/form';
import { StyleValue } from 'vue';

type TableHeaderCfg = {
  type: 'byAttrGroup' | 'custom';
  custom?: (map: EntityMap) => TableColumn[];
};

type BasicBtn = {
  label: string;
  onClick: (rowData: Recordable) => void;
};

type BasicToolbarBtn = {
  label: string;
  onClick: (selectedItems: string[]) => void;
};

type SearchOption = {
  toolbar?: {
    buttons: Array<BasicToolbarBtn> | (() => Array<BasicToolbarBtn>);
  };
  rowOption?: {
    buttons: Array<BasicBtn> | ((rowData: Recordable) => Array<BasicBtn>);
    width: number;
  };
  headerConfig?: TableHeaderCfg;
};

type DtlRowButton = {
  label: string;
  onClick: (rowData: Recordable, mainTableRowData: Recordable) => void;
};
type DtlOption = {
  toolbar?: {
    buttons: Array<BasicToolbarBtn> | (() => Array<BasicToolbarBtn>);
  };
  rowOption?: {
    buttons: Array<DtlRowButton> | ((rowData: Recordable, mainTableRowData: Recordable) => Array<BasicBtn>);
    width: number;
  };
  headerConfig?: TableHeaderCfg;
  allowBatchEdit: boolean; // 是否允许批处理按钮
};

type AttrController = {
  visibleBy: (rowData: Recordable) => boolean; // 当满足 条件时显示
  disabledBy: (rowData: Recordable) => boolean; // 当满足 条件时可用
  autoEvalBy: (rowData: Recordable) => void; // 自动计算
  dateBefore: (targetDateAttrKey: string, rowData: Recordable) => string; // 位于某个时间字段之后
  dateAfter: (targetDateAttrKey: string, rowData: Recordable) => string;
  onDDLChange: (rowData: Recordable) => string; //
  style: StyleValue; // 样式
  showSummary: boolean; // 显示汇总
};

type EnOption = {
  isFramework: boolean; // 作为框架，不显示字段属性
};

type EnOnlyOption = {
  buttons?: Array<BasicBtn> | ((rowData: Recordable) => Array<BasicBtn>);
  validator?: Record<string, Rule[]> | (() => Record<string, Rule[]>); // 支持配置，也可以根据函数创建
  attrControl?: Record<string, AttrController>;
};

export class BaseEntityExt {
  constructor(refEntity: Entity) {
    if (!refEntity) {
      throw new Error('扩展类必须传入相关实体的引用');
    }
    this.refEntity = refEntity;
  }
  protected refEntity: Entity;
  // 在查询组件中的配置
  public SearchOption: SearchOption = {};

  // 在从表查询组件（dtlSearch）中的配置
  public DtlSearchOption: DtlOption = {
    allowBatchEdit: true,
  };
  // 在从表批处理组件（dtlBatch）中的配置
  public DtlBatchOption: DtlOption = {
    allowBatchEdit: true,
  };
  // En配置
  public EnOption: EnOption = {
    isFramework: false,
  };
  public EnOnlyOption: EnOnlyOption = {};
  // 用于创建新实体的GPN class id
  public GPNClassName = '';
}
