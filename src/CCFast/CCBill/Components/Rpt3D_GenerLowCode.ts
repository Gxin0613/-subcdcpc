import { Rpt3DBase, Rpt3DWorkType } from '/@/bp/UIEntity/Rpt3DBase';
import { Modal } from 'ant-design-vue';
import HttpHandler from '/@form/dto/HttpHandler';
import WebUser from '/@/bp/web/WebUser';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

export class Rpt3D_GenerLowCode extends Rpt3DBase {
  override CellDoubleClick(_object: Record<string, any>, _d1?: string, _d2?: string, _d3?: string) {
    //  throw new Error('Method not implemented.');
  }
  override CellOnBlur(_object: Record<string, any>, _d1?: string, _d2?: string, _d3?: string, _val?: string, _valOld?: string) {
    //throw new Error('Method not implemented.');
  }
  constructor() {
    super('Rpt3D_GenerLowCode');
    this.PageTitle = '通用的低代码3D报表,需要有参数调用.';
  }

  //重写的构造方法.
  override async Init() {
    const handler = new HttpHandler('BP.CCFast.DataV_Lowcode');
    handler.AddJson(this.params);
    const data = await handler.DoMethodReturnString('Rpt3D_Init');
    if (typeof data === 'string') {
      Modal.error({
        content: data.replace('err@', ''),
      });
      return;
    }

    if (WebUser.IsAdmin == true) this.BtnOfToolbar = '设置';

    const en = data[0];
    this.PageTitle = en['Name'];
    //1维度数据源.
    this.WorkType = en['ListModel'] == 0 ? Rpt3DWorkType.Left : Rpt3DWorkType.Top;

    //一维
    this.SetD1Src(en['Tag1'], JSON.parse(en['Tag2']?.replace(/~/g, "'")), en['D1Key'], 'No', 'Name');

    //二维
    this.SetD2Src(en['Tag3'], JSON.parse(en['Tag4'].replace(/~/g, "'")), en['D2Key'], 'No', 'Name');

    //三维
    this.SetD3Src(en['Tag5'], JSON.parse(en['Tag6'].replace(/~/g, "'")), en['D3Key'], 'No', 'Name');

    //显示的数据源.
    this.Rows = JSON.parse(en['Docs']);
    //维度之间的关系.
    this.RefKey = en['RefPKey'];
    this.RowValKey = en['RowValKey'] || 'Num';
  }
  override BtnClick(btnName: string, record: Record<string, any>, ids?: string) {
    if (btnName === '设置') {
      const val = this.RequestVal('RptID');
      const url = GloComm.UrlEn('TS.CCFast.Rpt3DLowCodeForDBSrc', val);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer60, url);
    }
    alert(btnName + record + ids);
  }
}
