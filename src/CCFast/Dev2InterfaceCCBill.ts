// 实体类
import { DataType } from '../bp/en/DataType';
import WebUser from '../bp/web/WebUser';
import { FrmTrack } from '../WF/Comm/Components/FrmTrack';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { message } from 'ant-design-vue';

export default class Dev2InterfaceCCBill {
  //打开附件.
  public static OpenAthKKView(athPK: string) {
    return '';
  }
  public static OpenAthVSTO(athPK: string) {
    return '';
  }
  /**
   * 增加消息
   * @param frmID 表单ID
   * @param frmName 名称
   * @param workID 主键
   * @param ActionType 活动标记
   * @param ActionTypeText 活动名称.
   * @param note 信息
   * @returns 直接结果
   */
  public static async AddFrmTrackInfo(frmID: string, frmName: string, workID: string, ActionType: string, ActionTypeText: string, note: string): Promise<string> {
    const frmTrack = new FrmTrack();
    await frmTrack.Init();
    frmTrack.FrmID = frmID;
    frmTrack.FrmName = frmName;
    frmTrack.WorkID = workID;
    frmTrack.ActionType = ActionType;
    frmTrack.ActionTypeText = ActionTypeText;
    frmTrack.Msg = note;
    frmTrack.RecNo = WebUser.No;
    frmTrack.RecName = WebUser.Name;
    frmTrack.DeptNo = WebUser.DeptNo;
    frmTrack.DeptName = WebUser.DeptName;
    frmTrack.RDT = DataType.CurrentDateTime;
    await frmTrack.Insert();
    // frmTrack.frmName = frmName;
    //frmTrack.frmName = frmName;
    //const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    //handler.AddPara('FrmID', frmID);
    //const oid = await handler.DoMethodReturnString('MyBill_CreateBlankBillID');
    return '增加成功.';
  }
  /**
   * 创建一个空白的表单ID
   * @param frmID 表单模板编号
   * @returns OID.
   */
  public static async CreateBlankOID(frmID: string): Promise<number> {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('FrmID', frmID);
    const oid = await handler.DoMethodReturnString('MyBill_CreateBlankBillID');
    return parseInt(oid);
  }
  public static async SetTitle(workID: number, title: string): Promise<string> {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('WorkID', workID);
    handler.AddPara('Msg', title);
    return await handler.DoMethodReturnString('MyBill_SetTitle');
  }
  public static async GenerTitle(workID: number): Promise<string> {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('WorkID', workID);
    return await handler.DoMethodReturnString('MyBill_GenerTitle');
  }
  /**
   *保存草稿按照指定的OID
   * @param frmID 表单ID
   * @param oid 指定的OID
   * @returns 返回执行结果.
   */
  public static async SaveAsDraftByOID(frmID: string, oid: number): Promise<string> {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('FrmID', frmID);
    handler.AddPara('OID', oid);
    await handler.DoMethodReturnString('MyBill_CreateBlankBillID');
    return '执行成功.';
  }
  public static async SetEditing(frmID: string, oid: number): Promise<string> {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('FrmID', frmID);
    handler.AddPara('OID', oid);
    await handler.DoMethodReturnString('MyBill_SetEditing');
    return '执行成功.';
  }
  /**
   * 提交单据,设置BillState=3状态.
   * @param frmID 表单ID
   * @param oid 单据OID
   * @returns 执行结果.
   */
  public static async Submit(frmID: string, oid: number): Promise<string> {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('FrmID', frmID);
    handler.AddPara('OID', oid);
    await handler.DoMethodReturnString('MyBill_Submit');
    return '执行成功.';
  }

  /**
   *
   * @param frmID 表单ID
   * @param oid 工作ID
   * @returns 返回执行内容.
   */
  public static async UnSubmit(frmID: string, oid: number): Promise<string> {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('FrmID', frmID);
    handler.AddPara('OID', oid);
    await handler.DoMethodReturnString('MyBill_UnSubmit');
    return '执行成功.';
  }
  /**
   * 撤销发送.
   * @param frmID 单据
   * @param oid 流水号
   * @param msg 回滚流程原因.
   * @returns 执行结果.
   */
  public static async RebackFlow(frmID: string, oid: number, msg: string): Promise<string> {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('FrmID', frmID);
    handler.AddPara('OID', oid);
    handler.AddPara('Msg', msg);
    const data = await handler.DoMethodReturnString('MyBill_RebackFlow');
    return data;
  }
  /**
   * 为实体或者单据写入日志.
   * @param frmPTable 表单ID或者，表单的存储表.
   * @param pkVal 主键,WorkID,或者No.
   * @param msg 消息.
   * @returns 执行结果.
   */
  public static async WriteTrack(frmPTable: string, pkVal: string, msg: string, actionType = 'Info'): Promise<string> {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('FrmID', frmPTable); //表单ID表单表.
    handler.AddPara('PKVal', pkVal); //主键值.
    handler.AddPara('Msg', msg); //消息.
    handler.AddPara('ActionType', actionType); //消息类型.
    await handler.DoMethodReturnString('WriteTrack');
    return '执行成功.';
  }

  /**
   * 撤销发送.
   * @param frmID 表单ID
   * @param oid OID
   * @returns 执行结果.
   */
  public static async UnSend(frmID: string, oid: number): Promise<string> {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('FrmID', frmID);
    handler.AddPara('WorkID', oid);
    await handler.DoMethodReturnString('MyBill_UnSend');
    return '执行成功.';
  }
  /**
   * 撤销发送.
   * @param frmID 表单ID
   * @param oid OID
   * @returns 执行结果.
   */
  public static async Send(frmID: string, oid: number, msg: string): Promise<string> {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('FrmID', frmID);
    handler.AddPara('WorkID', oid);
    handler.AddPara('RefNo', msg);
    const info = await handler.DoMethodReturnString('MyBill_Send');
    return info;
  }
  /**
   * 执行退回
   * @param workID workid
   * @param returnToIdx 退回到节点
   * @param msg 退回信息.
   * @returns 执行结果
   */
  public static async ReturnWork(workID: number, returnToIdx: number, msg: string): Promise<string> {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('WorkID', workID);
    handler.AddPara('ReturnToIdx', returnToIdx);
    handler.AddPara('Msg', msg);
    const info = await handler.DoMethodReturnString('MyBill_ReturnWork');
    return info;
  }
  /**
   * 预置处理人
   * @param oid 工作ID
   * @param empNos 审核人员ID,比如: zhangsan,lisi,wangwu
   * @returns 执行结果.
   */
  public static async PreplaceChecker(oid: number, empNos: string): Promise<string> {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('RefNo', empNos);
    handler.AddPara('WorkID', oid);
    const data = await handler.DoMethodReturnString('MyBill_PreplaceChecker');
    if (data.includes('err@') == true) {
      alert(data);
      return data;
    }
    return '执行成功.';
  }

  public static async GetDtlInfo(oid: number, frmID: string, dtlNo: string) {
    try {
      const handler = new HttpHandler('BP.CCBill.WF_CCBill');
      handler.AddPara('RefPK', oid);
      handler.AddPara('FrmID', frmID);
      handler.AddPara('DtlNo', dtlNo);
      const data = await handler.DoMethodReturnString('MyBill_GetDtlInfo');
      return data;
    } catch (e) {
      message.error(e as string);
    }
    return null;
  }

  public static async UpdateMainInfo(oid: number, frmID: string, keyOfEn: string, name: string, val: string, msg: string): Promise<string> {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('OID', oid);
    handler.AddPara('FrmID', frmID);
    handler.AddPara('KeyOfEn', keyOfEn);
    handler.AddPara('Name', name);
    handler.AddPara('Val', encodeURIComponent(val));
    handler.AddPara('Msg', msg);
    return await handler.DoMethodReturnString('MyBill_UpdateMainInfo');
  }
  public static async UpdateDtlInfo(dtlNo: string, dtlName: string, oid: string, keyOfEn: string, name: string, val: string, refPK: number, msg: string): Promise<string> {
    const handler = new HttpHandler('BP.CCBill.WF_CCBill');
    handler.AddPara('DtlNo', dtlNo);
    handler.AddPara('DtlName', dtlName);
    handler.AddPara('OID', oid);
    handler.AddPara('RefPK', refPK);
    handler.AddPara('KeyOfEn', keyOfEn);
    handler.AddPara('Name', name);
    handler.AddPara('Val', encodeURIComponent(val));
    handler.AddPara('Msg', msg);
    return await handler.DoMethodReturnString('MyBill_UpdateDtlInfo');
  }
}
