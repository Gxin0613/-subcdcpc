import { Ref } from 'vue';
import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
/**
 * 从表重写类使用说明.
 * 1. 该类文件位于 datauser下，开发人员可以重写该文件，不会对cc的核心代码造成影响.
 * 2. 定义的按钮展现在 /WF/Comm/DtlSearch.vue /WF/Comm/DtlBatch.vue 上,如果用户按下了事件,就调用 BtnClick 方法.
 * 3. 可以通过写方法实现业务逻辑.
 *
 * 实现表单某个组件的事件绑定
 * 1. 修改样式等 (元素的对象传入 element/dom)
 * 2. 提供当前修改的元素的数据 RowData
 * 3. 提供整个表单的数据 TableData
 * 4. 提供通过事件获取表单其他元素的能力 (dom)
 */

// FrmDtlBtnClick -> xxx

export class SelfFuncFrmBody {
  private row: Ref<Recordable>;
  private mapAttrs: Ref<MapAttrs>;
  constructor(_row: Ref<Recordable>, _mapAttrs: Ref<MapAttrs>) {
    this.row = _row;
    this.mapAttrs = _mapAttrs;
  }

  /**
   *
   * @param key 为控件设置值.
   * @param val
   * @returns
   */
  private SetValByKey(key: string, val: string) {
    return this.row.value[key];
  }

  private GetValByKey(key: string) {
    return this.row.value[key];
  }

  private GetValDDLByKey(key: string) {
    return this.row.value[key];
  }
  private GetValTexBoxByKey(key: string) {
    return this.row.value[key];
  }
  private GetValRaidoButtonByKey(key: string) {
    return this.row.value[key];
  }
  private GetValCheckBoxByKey(key: string) {
    return this.row.value[key];
  }
  /**
   * 重写的按钮事件
   * @param frmID 从表的实体比较,比如: ND101Dtl1
   * @param pkval  表单主键值int类型， 比如: 55555
   * @param attrKey 控件名称, 比如:  1001,10012,10013
   * @param selectVal 选择的值
   * @param bodyJson 主表的数据.
   */
  public test() {
    const name = this.GetValByKey('Name');
    const xb = this.GetValByKey('XB');
  }
}
