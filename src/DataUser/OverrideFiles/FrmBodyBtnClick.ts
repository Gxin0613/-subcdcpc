import { markRaw, ShallowRef } from 'vue';
import BaseComponentVue from '/@/WF/Comm/BaseComponent.vue';
import HttpHandler from '/@/utils/gener/HttpHandler';
import MyEntityNoName from '/@/CCFast/CCBill/MyEntityNoName.vue';

/**
 *  按钮点击事件
 * 1. 该类文件位于 datauser下，开发人员可以重写该文件，不会对cc的核心代码造成影响.
 * 2. 定义的按钮展现在流程审批、查看页面
 * 3. 可以通过写方法实现业务逻辑
 */
export class FrmBodyBtnClick {
  constructor() {}

  /**
   * 重写的按钮事件
   * @param _frmID 表单的编号
   * @param _pkval  表单主键值int类型， 比如: 55555
   * @param _attrKey 控件名称, 比如:  QianJiaYuanYin
   * @param _bodyJson 主表的数据. 不需要改变表单数据时返回null,改变值返回变更后的表单JSON值_bodyJson
   */
  public static async FrmBodyBtnclick(
    _frmID: string,
    _pkval: number | string,
    _attrKey: string,
    _bodyJson: Record<string, any>,
    _baseComp: ShallowRef<InstanceType<typeof BaseComponentVue>>,
  ) {
    // console.log('FrmBodyBtnClick.FrmBodyBtnclick', _frmID, _pkval, _attrKey, _bodyJson);
    // 这里可以写业务逻辑代码.
    // 比如: alert('按钮被点击了');
    // 举例1： 如果是新增合作方按钮, 打开抽屉
    if (_frmID === 'ND901' && _attrKey === 'FrmBtnXinZengHeZuoFang') {
      // 1.要打开的实体表单编号
      const openFrmID = 'En_DaSe'; // 这里是实体表单的编号,修改为实际需要打开的表单编号
      // 2.执行方法获取一个新的主键值
      const handler = new HttpHandler('BP.CCBill.WF_CCBill');
      handler.AddPara('FrmID', openFrmID);
      const data = await handler.DoMethodReturnString('MyDict_CreateBlankDictID');
      // 3.调用抽屉组件打开方法
      return _baseComp.value?.openDrawer({
        title: '新增合作方',
        width: '70%',
        component: markRaw(MyEntityNoName),
        params: Object.assign({ No: data, RefNo: data, FrmID: openFrmID }, { isFixedbar: true }),
        showFooter: true,
      });
    }
  }
}
