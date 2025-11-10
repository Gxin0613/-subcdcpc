// 实体类
import { number } from 'echarts';
import HttpHandler from './HttpHandler';
export default class DataPacket {
  //类名称.
  public readonly EnName: string = '';
  public Title = '';

  public data: any = {}; //数据源.
  public paras: any = {}; //参数.

  constructor(EnName: string) {
    this.EnName = EnName;
  }

  public AddPara(key: string, val: any) {
    val.toString().replaceAll("'", '');
    this.paras[key] = val;
    // if (this.paras.hasOwnProperty(key) && typeof this[key] !== 'function') {
    //   this[key] = val;
    // }
    // this[key] = val;
  }

  public GetValString(key: string) {
    const json = this.data[key];
    //alert(json);
    return json[0][0];
  }
  public GetValInt(key: string) {
    const val = this.GetValString(key);
    return number.parseDate(val);
  }
  public GetValFloat(key: string) {
    const val = this.GetValString(key);
    return number.parseDate(val);
  }
  public GetJson(key: string) {
    return this.data[key];
  }

  // 获取实体
  public async Init() {
    try {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CommTS');
      handler.AddPara('EnName', this.EnName);

      this.data = await handler.DoMethodReturnJson('DataPacket_GenerDB');
    } catch (e: any) {
      console.error(e);
    }
  }
}
