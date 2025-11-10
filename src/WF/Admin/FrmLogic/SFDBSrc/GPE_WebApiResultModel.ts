import { SFDBSrc } from './SFDBSrc';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import HttpHandler from '/@/utils/gener/HttpHandler';

export class GPE_WebApiResultModel extends PageBaseGroupEdit {
  constructor() {
    super('GPE_WebApiResultModel');
    this.PageTitle = '数据标准转换模式';
  }
  async Init() {
    this.entity = new SFDBSrc(); //对应的类.
    this.KeyOfEn = 'WebApiResultModel'; //要修改的字段.

    //增加子页面.
    this.AddGroup('A', '数据标准转换模式'); //增加分组.
    this.Blank('0', '不转换,采用标准格式.', this.Desc0);
    this.SelectItemsByList('1', '使用业务单元转换', this.Desc1, false, await this.GenerBuessUnit(), 'WebApiResultObjEnName', 'WebApiResultObjEnNameT');
  }
  ///业务单元.
  public async GenerBuessUnit() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AttrNode');
    const data = await handler.DoMethodReturnJson('ActionDtl_Init');
    return JSON.stringify(data);
  }

  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID === pageVal || pageID == btnName) {
    }
    // throw new Error('Method not implemented.');
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) {
      //const idx = 1;
    }
  }

  public readonly Desc0 = `  
  #### 帮助
  - 驰骋提供的格式.
{
  code:200,
  message:'执行成功',
  data:'xxxxx'
  }

  - code=200 执行成功. code=500 执行失败, code=404 标识配置错误，没有连接.
   - 如果对方按照这个格式返回的数据,就不需要转换。
   #### 请参考
     ![输入图片说明](./resource/Admin/DBSrc/Dbsrc_resultObj.png "屏幕截图.png")  
  `;
  public readonly Desc1 = `
  #### 帮助
  - 要写一个 BuessUnit 类
  - 请参考:  BP.App.Demo.WebApi.BuessUnit_LocalWebApi_ResultObj
  - 在这个类里，把您的格式转换为驰骋的格式返回数据.
  `;
}
