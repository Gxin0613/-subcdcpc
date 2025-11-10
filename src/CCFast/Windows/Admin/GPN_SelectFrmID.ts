import { RptPage } from '../RptPage/RptPage';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { MapData } from '/@/WF/Admin/FrmLogic/MapData';
import { GloWF } from '/@/WF/Admin/GloWF';
import { GloComm } from '/@/WF/Comm/GloComm';

export class GPN_SelectFrmID extends PageBaseGroupNew {
  override async GenerSorts(): Promise<Array<any>> {
    return [];
  }
  constructor() {
    super('GPN_SelectFrmID');
    this.PageTitle = '选择表单';
  }

  public async Init() {
    this.AddGroup('A', '选择表单'); //增加分组.
    this.SelectItemsByGroupList('BillNo', '选择单据', '选择单据', false, GloWF.srcFrmTree, GloWF.srcFrmListOfBill);
    this.AddIcon('icon-cloud-upload', 'BillNo');
    this.SelectItemsByGroupList('EntityNoName', '选择实体', '选择要实体', false, GloWF.srcFrmTree, GloWF.srcFrmEntityNoName);
    this.AddIcon('icon-link', 'EntityNoName');
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string) {
    const pageID = this.RequestVal('PageID');
    const rptID = this.RequestVal('RptID');
    const mapData = new MapData(tb1);
    await mapData.Retrieve();
    const rp = new RptPage(pageID);
    await rp.Retrieve();
    rp.FrmID = tb1;
    rp.FrmName = mapData.Name;
    await rp.Update();
    const url = GloComm.UrlGPN('GPN_WindowFrm', '&RptID=' + rptID + '&FrmID=' + tb1 + '&PageID=' + pageID);
    console.log({ url });
    return new GPNReturnObj(GPNReturnType.GoToUrl, url);
  }
}
