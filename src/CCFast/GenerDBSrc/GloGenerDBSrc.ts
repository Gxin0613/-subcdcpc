import { message } from 'ant-design-vue';
import { GenerDBSrcs } from './GenerDBSrc';
import HttpHandler from '/@/utils/gener/HttpHandler';

//公共处理类.
export class GloGenerDBSrc {
  //获得一个报表的所有的数据源.
  public static async GenerEns_ByRptID(rptID: string) {
    const ens = new GenerDBSrcs();
    await ens.Retrieve('RptID', rptID);
    return ens;
  }

  public static async GenerEns_ByFlowNo(rptID: string) {
    const ens = new GenerDBSrcs();
    await ens.Retrieve('RptID', rptID);
    return ens;
  }

  //根据MyPk获得数据.
  public static async GenerData_ByMyPK_WithAtPara(myPK: string, paras: string) {
    const handler = new HttpHandler('BP.CCFast.Handler_CCFast');
    handler.AddPara('MyPK', myPK);
    handler.AddPara('MyParas', paras);
    const data: any[] = await handler.DoMethodReturnJson('GenerDBSrc_ByMyPK_WithAtPara');
    return data;
  }
  //根据MyPk获得数据.
  public static async GenerData_ByMyPK_WithJson(myPK: string, json: Record<string, any>) {
    const handler = new HttpHandler('BP.CCFast.Handler_CCFast');
    handler.AddPara('MyPK', myPK);
    handler.AddPara('MyParas', encodeURIComponent(JSON.stringify(json)));
    const data: any[] = await handler.DoMethodReturnJson('GenerDBSrc_ByMyPK_WithJson');
    return data;
  }

  //预制数据
  public static async InitGenerDBSrc_BySQL(objModel: string, objPKVal: string, markID: string, dbModel = 'Search', sql: string) {
    const handler = new HttpHandler('BP.CCFast.Handler_CCFast');
    handler.AddPara('MarkID', markID);
    handler.AddPara('DBModel', dbModel);
    handler.AddPara('PKVal', objPKVal);
    handler.AddPara('Doc', sql);
    handler.AddPara('DoWay', 'SelfSQL');
    await handler.DoMethodReturnJson('GenerDBSrc_InitData');
  }
  /**
   * 获取单个数据值
   * @param myPK
   * @param json
   * @returns
   */
  public static async GenerData_ByMyPK_WithJsonReturnString(myPK: string, json: Record<string, any>) {
    const handler = new HttpHandler('BP.CCFast.Handler_CCFast');
    handler.AddPara('MyPK', myPK);
    handler.AddPara('MyParas', encodeURIComponent(JSON.stringify(json)));
    const data: any = await handler.DoMethodReturnString('GenerDBSrc_ByMyPK_WithJson');
    if (Array.isArray(data)) {
      if (data.length > 1) {
        message.error('获取信息有多条数据不能返回单个值');
        return;
      }
      const keys = Object.keys(data[0]);
      if (keys.length > 1) {
        message.error('获取信息有多列不能返回单个值');
        return;
      }
      return data[0][keys[0]];
    }
    return data;
  }
}
