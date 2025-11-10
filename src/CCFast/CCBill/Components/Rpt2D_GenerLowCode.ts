import { Rpt2DBase, Rpt2DWorkType } from '/@/bp/UIEntity/Rpt2DBase';
import { Modal } from 'ant-design-vue';
import HttpHandler from '/@form/dto/HttpHandler';

export class Rpt2D_GenerLowCode extends Rpt2DBase {
  constructor() {
    super('Rpt2D_GenerLowCode');
    this.PageTitle = '通用的低代码2D报表,需要有参数调用.';
  }

  //重写的构造方法.
  override async Init() {
    const handler = new HttpHandler('BP.CCFast.DataV_Lowcode');
    handler.AddJson(this.params);
    const data = await handler.DoMethodReturnString('Rpt2D_Init');
    if (typeof data === 'string') {
      Modal.error({
        content: data.replace('err@', ''),
      });
      return;
    }
    const en = data[0];
    this.PageTitle = en['Name'];
    //1维度数据源.
    this.WorkType = en['ListModel'] == 0 ? Rpt2DWorkType.Left : en['ListModel'] == 1 ? Rpt2DWorkType.Top : Rpt2DWorkType.TopLeft;

    //一维
    this.SetD1Src(en['Tag1'], JSON.parse(en['Tag2']?.replace(/~/g, "'")), en['D1Key'], 'No', 'Name');

    //二维
    this.SetD2Src(en['Tag3'], JSON.parse(en['Tag4'].replace(/~/g, "'")), en['D2Key'], 'No', 'Name');

    //显示的数据源.
    this.Rows = JSON.parse(en['Docs']);
    //维度之间的关系.
    this.RefKey = en['RefPKey'];
    this.RowValKey = en['RowValKey'] || 'Num';
  }
  override CellFieldClick(object: Record<string, any>) {
    alert(object);
  }
  override BtnClick(btnName: string, record: Record<string, any>, ids?: string) {
    alert(btnName + record + ids);
  }
}
