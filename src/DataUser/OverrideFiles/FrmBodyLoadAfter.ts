import WebUser from '/@/bp/web/WebUser';
/**
 * 从表重写类使用说明.
 * 1. 该类文件位于 datauser下，开发人员可以重写该文件，不会对cc的核心代码造成影响.
 * 2. 定义的按钮展现在 /WF/Comm/Frm.vue.
 * 3. 可以通过写方法实现业务逻辑,通过返回值，可以修改表单的数据.
 */
export class FrmBodyLoadAfter {
  constructor() {}
  /**
   * 重写的按钮事件
   * @param _frmID 表单的编号
   * @param _pkval  表单主键值int类型， 比如: 55555
   * @param _bodyJson 主表的数据. 不需要改变表单数据时返回null,改变值返回变更后的表单JSON值_bodyJson
   */
  public static async FrmBodyLoadAfter(_frmID: string, _pkval: number | string, _bodyJson: Record<string, any>, _attrs: Array<Recordable>) {
    if (_frmID === 'ND3101' && WebUser.DeptNo == '100') {
      // //显示测试
      // this.HidUnCtrl('RDT', _attrs);
      // this.HidUnCtrl('Rec', _attrs);
      // this.HidUnCtrl('Title', _attrs);
      // //隐藏测试
      // this.HidCtrl('SQRQ', _attrs);
      // this.HidCtrl('FuWenBenCeShi', _attrs);
      // //获取当前值测试
      // const RDT = this.GetCtrlVal('RDT', _bodyJson); //获得文本框的值.
      // console.log('接收时间', RDT);
      // //设置当前值测试
      // this.SetFieldLab('Title', '济南驰骋有限公司', _attrs); //设置标签.

      return {
        _bodyJson,
        _attrs,
      };
    }
    return null;
  }

  /**
   * 获得控件.   无法获取
   * @param _attrKey 属性key
   * @returns  控件对象
   */
  public static GetCtrl(_attrKey: string) {
    return '';
  }
  /**
   * 隐藏字段
   * @param _attrKey 隐藏字段
   * @returns
   */
  public static HidCtrl(_attrKey: string, attrs: Array<Recordable>) {
    attrs.forEach((item) => {
      if (_attrKey == item.KeyOfEn) {
        item.UIVisible = 0; //隐藏字段.
        return;
      }
    });
    return attrs;
  }
  /**
   * 撤销隐藏字段
   * @param _attrKey Key
   * @returns
   */
  public static HidUnCtrl(_attrKey: string, attrs: Array<Recordable>) {
    attrs.forEach((item) => {
      if (_attrKey == item.KeyOfEn) {
        item.UIVisible = 1; //显示字段.
        return;
      }
    });
    return attrs;
  }

  /**
   * 设置控件值.
   * @param attrKey 要设置的字段.
   * @param val 设置的值.
   */
  public static SetCtrlVal(_attrKey: string, _val: string | number, json: Record<string, any>) {
    // rowData[attrKey] = val;
    return (json[_attrKey] = _val);
  }
  /**
   * 获取控件的值.
   * @param attrKey 字段属性
   * @returns 字段的值.
   */
  public static GetCtrlVal(_attrKey: string, json) {
    return json[_attrKey];
  }

  /**
   * 获得标签
   * @param attrKey 属性
   * @returns
   */
  public static GetFieldLab(_attrKey: string, attrs: Array<Recordable>) {
    attrs.forEach((item) => {
      if (_attrKey == item.KeyOfEn) {
        return item.Name; //显示字段.
      }
    });
  }
  /**
   * 设置标签
   * @param _attrKey 字段值
   * @param _attrLab 标签
   * @returns
   */
  public static SetFieldLab(_attrKey: string, _attrLab: string, attrs: Array<Recordable>) {
    attrs.forEach((item) => {
      if (_attrKey == item.KeyOfEn) {
        item.Name = _attrLab; //显示字段.
        return;
      }
    });
    return attrs;
  }
}
