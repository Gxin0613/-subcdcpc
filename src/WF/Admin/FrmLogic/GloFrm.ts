import HttpHandler from '/@/utils/gener/HttpHandler';

export default class GloFrm {
  static async CheckForm(frmID: string) {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_FoolFormDesigner');
    handler.AddPara('FrmID', frmID);
    await handler.DoMethodReturnString('Designer_CheckFrm');
  }
}
