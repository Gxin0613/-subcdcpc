// 实体类
import HttpHandler from '/@/utils/gener/HttpHandler';
import BSEntities from '/@/utils/gener/BSEntities';
import BSEntity from '/@/utils/gener/BSEntity';

export default class CCFormAPI {
  //自动的加载js Gener.js config.js QueryString.js

  //%%%%%%%%%%%%%%%%%%%%%%%%%%%%%  前台操作的方法： %%%%%%%%%%%%%%%%%%%%%%%%%%%%%

  static async Port_Login(userNo: string, prkey: string) {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_AppClassic');
    handler.AddPara('UserNo', userNo);
    handler.AddPara('PKey', prkey);
    const token = await handler.DoMethodReturnString('Port_Login');
    return token;
  }

  /* 获得可以操作的单据列表. 返回: No,Name,FrmType,TreeNo,TreeName 的 json. FrmType=是单据，还是实体.
   * 1. 该方法可以用于生成当前用户可以发起的单据列表.
   * 2. 我们提供了一个通用的百搭款的风格的页面. /WF/CCBill/Start.htm
   * */
  static CCFrom_GenerFrmListOfCanOption() {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill_API');
    const data = handler.DoMethodReturnJson('CCFrom_GenerFrmListOfCanOption');
    return data;
  }

  /**
   * 获得可以操作的单据列表
   * @param {执行的目录树下的单据} specTreeNo
   */
  static CCFrom_GenerFrmListBySpecTreeNo(specTreeNo) {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill_API');
    handler.AddPara('TreeNo', specTreeNo);
    const data = handler.DoMethodReturnJson('CCFrom_GenerFrmListBySpecTreeNo');
    return data;
  }

  /**
   * 获得单据状态,一个单据编号下面有多个单据.
   * 返回的数据就是查询的 SELECT * FROM Frm_GenerBill WHERE BillNo='@BillNo';
   * 单据的状态为: @0=空白@1=草稿@2=编辑中@100=归档.
   * @param {单据编号} billNo
   */
  public static CCFrom_GenerBillsByBillNo(billNo) {
    const ens = new BSEntities('BP.CCBill.GenerBills');
    ens.Retrieve('BillNo', billNo);
    return ens;
  }

  /**
   * 获得一个表单的操作权限.
   * @param {any} frmID
   * 返回 IsView, IsNew, IsSubmit, IsUpdate IsDelete 的json.
   */
  public static CCFrom_FrmPower(frmID) {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill_API');
    handler.AddPara('FrmID', frmID);
    handler.AddPara('IsReadonly', 0);
    const data = handler.DoMethodReturnJson('CCFrom_ToolBar_Init');
    return data;
  }

  /**
   * 获得表单的Url.
   * @param {表单ID} frmID
   * @param {主键} oid
   */
  public static CCFrom_FrmOptionUrlByOID(frmID, oid) {
    return '../WF/CCBill/MyBill.htm?FrmID=' + frmID + '&OID=' + oid;
  }

  /**
   * 获得表单的Url.
   * @param {表单ID} frmID
   * @param {主键} pkval
   */
  public static CCFrom_FrmOptionUrlByBillNo(frmID, billNo) {
    return '../WF/CCBill/MyBill.htm?FrmID=' + frmID + '&BillNo=' + billNo;
  }

  /**
   * 获得表单查看的Url.
   * @param {表单ID} frmID
   * @param {主键} oid
   */
  public static CCFrom_FrmViewUrl(frmID, oid) {
    return '../WF/CCForm/Frm.htm?FrmID=' + frmID + '&OID=' + oid;
  }

  /**
   * 获得表单查看的Url.
   * @param {表单ID} frmID
   * @param {单据编号} billNo
   */
  public static CCFrom_FrmViewUrlByBillNo(frmID, billNo) {
    const frm = new BSEntity(frmID); //??这里需要解析 BillNo传入的值.
    const i = frm.Retrieve('BillNo', billNo);
    // if (i == 1) {
    //   return '../WF/CCForm/Frm.htm?FrmID=' + frmID + '&OID=' + frm.OID;
    // }
    // alert('无此数据.');
  }
  /**
   * 创建一个空白的BillID.
   * @param {表单ID} frmID.
   */
  public static async CreateBlankOID(frmID: string) {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('FrmID', frmID);
    const oid = await handler.DoMethodReturnString('MyBill_CreateBlankBillID');
    return Number.parseInt(oid);
  }

  public static SaveData(frmID: string, oid: number, json: any) {
    //设置实体,执行保存.
    const en = new BSEntity(frmID, oid.toString());
    en.Copy(json);
    en.Update();
    return true;
  }
  public static Delete(frmID: string, oid: number) {
    //设置实体,执行保存.
    const en = new BSEntity(frmID, oid.toString());
    en.Delete();
    return true;
  }

  /**
   * 保存草稿 By OID
   * @param {表单ID} frmID
   * @param {主键} oid
   */
  public static SaveAsDraftByOID(frmID, oid) {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('FrmID', frmID);
    handler.AddPara('OID', oid);
  }

  /**
   * 保存草稿By BillNo
   * @param {表单ID} frmID
   * @param {单据编号} BillNo
   */
  public static SaveAsDraftByBillNo(frmID, billNo) {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('FrmID', frmID);
    handler.AddPara('BillNo', billNo);
    // var billOID = handler.DoMethodReturnString('MyBill_CreateBlankBillID');
    //return billOID;
  }

  /**
   * 创建表单实例. 说明:指定表单的ID, specID,与参数创建表单实例.
   * @param {表单ID} frmID
   * @param {指定的int类型的OID，作为主键} specOID
   * @param {指定的Title，可以为空} specTitle
   * @param {主表字段的参数，一个key val 的json格式的数据.} paras
   */
  public static CCFrom_NewFrmEntityAsSpecOID(frmID: string, specOID: number, specTitle: string, paras: any) {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill_API');
    handler.AddPara('FrmID', frmID);
    handler.AddPara('OID', specOID);
    handler.AddPara('Title', specTitle);
    handler.AddJson(paras); //把参数加入.

    const data = handler.DoMethodReturnJson('CCFrom_NewFrmEntityAsSpecOID');
    // if (data.indexOf('err@') == -1) {
    //   throw Exception(data); // ??是不是这个语法？
    // }
    return data;
  }

  /**
   * 创建表单实例. 说明:指定表单的ID, specID,与参数创建表单实例.
   * @param {表单ID} frmID
   * @param {指定的int类型的OID，作为主键} specBillNo
   * @param {指定的Title，可以为空} specTitle
   * @param {主表字段的参数，一个key val 的strs格式的数据,比如:@Name=zhangsan@Age=12@Add=山东济南} paras
   */
  public static CCFrom_NewFrmEntityAsSpecBillNo(frmID: string, specBillNo: string, specTitle: string, paras: any) {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill_API');
    handler.AddPara('FrmID', frmID);
    handler.AddPara('BillNo', specBillNo);
    handler.AddPara('Title', specTitle);
    handler.AddPara('Paras', paras); //加入参数.
    const data = handler.DoMethodReturnString('CCFrom_NewFrmBillAsSpecBillNo');
    // if (data.indexOf('url@') == -1) {
    //   alert(data);
    //   return;
    //   //throw Exception(data); // ??是不是这个语法？
    // }
    return data;
  }

  /**
   *  创建表单实例： 返回一个 frmJson。
   * @param {表单ID} frmID
   * @param {标题/名称:可以为空} specTitle
   * @param {主表的参数 Key Val 可为空} paras
   */
  public static CCFrom_NewFrmEntity(frmID: string, specTitle: string, paras: any) {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill_API');
    handler.AddPara('FrmID', frmID);
    handler.AddPara('Title', specTitle);
    handler.AddJson(paras); //

    const data = handler.DoMethodReturnJson('CCFrom_NewFrmEntity');
    // if (data.indexOf('err@') == -1) {
    //   throw Exception(data); // ??是不是这个语法？要检查是否可以创建的权限.
    // }
    return data;
  }

  /**
   * 删除表单实例. 说明:指定表单的ID,OID删除实例.
   *
   * @param {表单ID} frmID
   * @param {单据编号} oid
   * 如果返回 err@xxxx 则表是失败.
   */
  public static CCFrom_DeleteFrmEntityByOID(frmID: string, oid: number) {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill_API');
    handler.AddPara('FrmID', frmID);
    handler.AddPara('OID', oid);
    const data = handler.DoMethodReturnJson('CCFrom_DeleteFrmEntityByOID');
    // if (data.indexOf('err@') == -1) {
    //   throw Exception(data); // ??是不是这个语法？要检查删除权限.
    // }
    return data;
  }

  /**
   * 删除表单实例. 说明:指定表单的ID,OID删除实例.
   *
   * @param {表单ID} frmID
   * @param {单据编号} BillNo
   * 如果返回 err@xxxx 则表是失败.
   */
  public static CCFrom_DeleteFrmEntityByBillNo(frmID: string, billNo: string) {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill_API');
    handler.AddPara('FrmID', frmID);
    handler.AddPara('BillNo', billNo);
    const data = handler.DoMethodReturnJson('CCFrom_DeleteFrmEntityByBillNo');
    // if (data.indexOf('err@') == -1) {
    //   throw Exception(data); // ??是不是这个语法？要检查删除权限.
    // }
    return data;
  }

  // public static FrmSearch(frmID, frmType) {
  //   //单据
  //   if (frmType == 1) {
  //     return "./SearchBill.htm?FrmID=" + frmID;
  //   }
  //   if (frmType == 2) {
  //     return "./SearchDict.htm?FrmID=" + frmID;
  //   }
  // }
}
