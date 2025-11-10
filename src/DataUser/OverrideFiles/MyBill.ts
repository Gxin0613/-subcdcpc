/**
 * 从表重写类使用说明.
 * 1. 该类文件位于 datauser下，开发人员可以重写该文件，不会对cc的核心代码造成影响.
 */
export function userMyFlowSelfLoader(_params) {
  /*
   1. beforeSave、beforeSend、 beforeReturn、 beforeDelete
   2 .MyFlowGener、MyFlowTree的固定方法，禁止删除
   3.主要写保存前、发送前、退回前、删除前事件
   4.返回值为 true、false,  如果返回false 就不执行该事件.
   */
  /**
   * 保存前事件:
   * 1. 返回的是row标识，要使用row从新对控件赋值.
   * 2. 参数row是主表字段的值，可以根据 row+控件id获取或者设置. 比如: row.Tel, row.Email
   * 3. 如果返回的是true, 表示可以保存, false 停止保存. 如果返回改变后的row, 系统就会重新按照row的值赋值.
   * 4. 对于树形流程的保存，每个表单使用frmID参数来区分.
   * 5. 常用的属性采用已经通过参数传递过来比如:workID,flowNo,nodeID, 不常用的使用 query.XXXXX 获取.
   */
  const beforeSave = async (_row: any, _frmID: string, _flowNo: string, _nodeID: number, _workID: number) => {
    return true;
  };
  /**
   * 发送前事件
   * 0. 发送之前，是一定调用  beforeSave 的,有关保存的业务逻辑写入到 beforeSave.
   * 1. 必须返回:true,false 如果返回的是true, 表示可以发送, false 停止发送.
   * 2. 常用的属性采用已经通过参数传递过来比如:workID,flowNo,nodeID, 不常用的使用 query.XXXXX 获取.
   * 3. row是表单主表的数据,可以通过 row.XXXX 来获取. 但是不能赋值.
   * @constructor
   */
  const beforeSend = async (_row: any, _frmID: string, _flowNo: string, _nodeID: number, _workID: number, _toEmps = '') => {};
  /**
   * 发送后事件
   * @constructor
   */
  const afterSend = async (_row: any, _frmID: string, _flowNo: string, _nodeID: number, _workID: number) => {
    return true;
  };

  /**
   * 退回前事件
   */
  const beforeReturn = () => {
    return true;
  };
  const afterReturn = async (_flowNo: string, _nodeID: number, _workID: number, _toNodeID: string, _toEmp: string) => {
    return true;
  };
  /**
   * 删除前事件
   */
  const beforeDelete = () => {
    return true;
  };
  return {
    beforeSave,
    beforeSend,
    afterSend,
    beforeReturn,
    beforeDelete,
    afterReturn,
  };

  //********************* 自定义事件的功能区 ************/
}
