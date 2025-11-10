import { ShallowRef } from 'vue';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import BaseComponentVue from '/@/WF/Comm/BaseComponent.vue';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GenerBill } from '/@/CCFast/CCBill/GenerBill';
import { message } from 'ant-design-vue';

/**
 * 节点自定义工具栏操作
 */
export class MyFlowNodeToolBar {
  constructor() {}
  public static async btnClick(
    _workID: number,
    _nodeID: number,
    _params: Record<string, any>,
    _row: Record<string, any>,
    baseComp: ShallowRef<InstanceType<typeof BaseComponentVue>>,
  ) {
    // if (_nodeID == 1302) {
    //   const frmID = 'Bill_LuYinCeShiDanJu';
    //   let OID;
    //   //1.获取流程workID,在单据中创建一个字段存储这个WorkID  ==> 可以设置隐藏字段
    //   //2.每次点击自定义方法时,先查询单据数据中是否含有当前的WorkID,如果含有就把当前单据的主键获取到,放到链接上
    //   //3.如果没有查询到,就新建单据并把WorkID存储进去
    //   //先获取单据数据
    //   const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    //   handler.AddJson({ FrmID: frmID });
    //   const { DT = [] } = await handler.DoMethodReturnJson('Search_Init');
    //   for (const dt of DT) {
    //     if (dt.workID == _workID) {
    //       OID = dt.OID;
    //     }
    //   }
    //   if (!OID) {
    //     //新建
    //     OID = await handler.DoMethodReturnString('MyBill_CreateBlankBillID');
    //     handler.AddJson({ OID, workID: _workID });
    //     const msg = await handler.DoMethodReturnString('MyBill_SaveIt');
    //     message.info(msg);
    //   }
    //   const url = '/@/CCFast/CCBill/MyBill.vue?FrmID=' + frmID + '&WorkID=' + OID + '&RoutFrom=MyBill';
    //   return baseComp.value?.handleGPNCallback(new GPNReturnObj(GPNReturnType.OpenUrlByModal, url));
    // }
  }
}
