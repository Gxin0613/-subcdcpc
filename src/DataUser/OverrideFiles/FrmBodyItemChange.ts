import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';

/**
 * 从表重写类使用说明.
 * 1. 该类文件位于 datauser下，开发人员可以重写该文件，不会对cc的核心代码造成影响.
 * 2. 定义的按钮展现在 /WF/Comm/Frm.vue.
 * 3. 可以通过写方法实现业务逻辑,通过返回值，可以修改表单的数据.
 */
export class FrmBodyItemChange {
  constructor() {}

  /**
   * 重写的按钮事件
   * @param _frmID 表单的编号
   * @param _pkval  表单主键值int类型， 比如: 55555
   * @param _attrKey 控件名称, 比如:  QianJiaYuanYin
   * @param _selectVal 选择的值
   * @param _bodyJson 主表的数据. 不需要改变表单数据时返回null,改变值返回变更后的表单JSON值_bodyJson
   */
  public static async FrmBodyItemChange(_frmID: string, _pkval: number | string, _attrKey: string, _selectVal: string, _bodyJson: Record<string, any>) {
    // if (CommonConfig.IsGZFrm) {
    //   //收入合同 变动金额=原合同金额-变动后金额 （这里监听变动后金额的变化进行计算）
    //   if (_frmID == 'ND201' && _attrKey == 'QueDingJinE') {
    //     //原合同金额
    //     const HeTongYuanJinE = parseFloat(_bodyJson.HeTongYuanJinE);
    //     //变动金额
    //     let BianGengJinE = 0;
    //     //变动后金额
    //     const QueDingJinE = parseFloat(_selectVal);
    //     BianGengJinE = HeTongYuanJinE - QueDingJinE;
    //     _bodyJson.BianGengJinE = BianGengJinE;
    //     return _bodyJson;
    //   }
    // }
    return null;
  }
}
