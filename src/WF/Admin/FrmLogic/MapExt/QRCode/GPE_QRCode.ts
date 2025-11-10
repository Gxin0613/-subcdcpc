import { MapExt, MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_QRCode extends PageBaseGroupEdit {
  constructor() {
    super('GPE_QRCode');
    this.PageTitle = '扫码录入';
  }
  async Init() {
    this.entity = new MapExt(); //对应的类.
    this.KeyOfEn = MapExtAttr.DoWay; //要编辑的字段.

    //初始化数据.
    await this.entity.InitDataForMapAttr('QRCode', this.GetRequestVal('PKVal'));

    //增加子页面.
    this.AddGroup('A', '扫码录入'); //增加分组.
    this.Blank('0', '禁用', this.Desc0);
    this.Blank('1', '二维码', this.Desc1);
    this.Blank('2', '条码', this.Desc2);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }

  public readonly Desc0 = `
  #### 帮助
   - 禁用：不使用扫码录入。
   - 二维码：适用于移动端，扫二维码获得一些信息，进行一些操作。
   - 条码：适用于移动端，扫条码获得一些信息，进行一些操作。
  #### 场景
   - 利用扫描枪或手机扫描功能，把带有识别码的物品信息录入到系统中。
   - 比如：维修工具归还流程中，当工具归还时，可以利用外置扫描枪，扫描工具上的识别码（二维码或条码）。
   - 把工具的编号，名称等信息自动录入到流程表单中。
   
  

  `;
  public readonly Desc1 = `
  #### 帮助
   - 用户向通过扫描二维码之后获得一些信息，进行一些操作。
   - 我们把这个场景叫做二维码，扫描。
  `;
  public readonly Desc2 = `
  #### 帮助
   - 适用于移动端，扫条码获得一些信息，进行一些操作
  `;
}
