// 实体类
import request from '/@/utils/request';
import { REQUEST_URL } from '/@/config/EnvProperties';
import { message } from 'ant-design-vue';
import { getAppEnvConfig } from '/@/utils/env';
import { SFTable } from '/@/WF/Admin/FrmLogic/SFTable/SFTable';
import { SFSearch } from '/@/WF/Admin/FrmLogic/SFSearch/SFSearch';
import { AesEncryption } from '../cipher';
import { DataBankBase } from '/@/bp/UIEntity/DataBankBase';
import { ClassFactory } from '/@/bp/da/ClassFactory';
import { is } from '/@/utils/is';

export default class DBAccess {
  public static GenerGUID() {
    return 'xxxx-4xxx-yxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString();
    });
  }
  public static GenerOID() {
    return 100;
  }

  public static data: Array<any> = [];

  /**
   * 执行数据返回信息
   * @param dbSrc 表达式
   * @param dbType 0=SQL, 1=URL, 2=function
   * @param dbSource 数据源
   * @returns 返回信息.
   */
  public static async RunDBSrc(dbSrc: string, dbType: number, dbSource = '') {
    if (dbSrc == null || dbSrc === '') {
      message.error('执行的数据语句不能为空');
      return [];
    }
    if (dbType == 0) return await this.RunSQLReturnTable(dbSrc, dbSource);
    if (dbType == 1) return await this.RunUrlReturnJSON(dbSrc);
    if (dbType == 2) {
      const str = this.RunFunctionReturnStr(dbSrc);
      if (str == null || str == '') {
        return [];
      }
      return JSON.parse(str);
    }
    return [];
  }
  /**
   * 执行sql的扩展方法:
   * @param sqlOrSFTableNo  执行的数据源：可能是一个sql, 或者是SFTale编号，或者是SFSearch编号.
   * @param paras  要执行的参数.
   * @returns 返回json的结果集合.
   */
  public static async RunSQLReturnDict(sqlOrSFTableNo: string, srcType = 0, paras = 'xxxx') {
    try {
      if (sqlOrSFTableNo == null || typeof sqlOrSFTableNo === 'undefined' || sqlOrSFTableNo == '') {
        console.trace('sql为空，请求无效');
        message.error('数据查询为空，请求无效');
        return;
      }
      if (typeof sqlOrSFTableNo === 'string' && !sqlOrSFTableNo.includes(' ') && srcType == 1) {
        const sfTable = new SFTable(sqlOrSFTableNo);
        const data = await sfTable.GenerData(paras);
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item) => {
            return {
              value: item.No || item.MyPK || item.WorkID || item.OID,
              label: item.Name,
              text: item.Name,
            };
          });
        }
        return [];
      }

      // if (sql.includes('@')==true)
      const formData = new FormData();
      const { VITE_GLOB_ENCRYPTION_KEY } = getAppEnvConfig();
      const encryption = new AesEncryption({ key: VITE_GLOB_ENCRYPTION_KEY });
      formData.append('SQL', encryption.encryptByAES(encodeURIComponent(sqlOrSFTableNo)));
      formData.append('DBSrc', 'local');
      return await request.post<any, any>(REQUEST_URL, formData, {
        params: {
          DoType: 'DBAccess_RunSQLReturnTable',
          t: Date.now(),
        },
      });
    } catch (e: any) {
      message.error(e.toString());
    }
  }
  /**
   * 执行sql的扩展方法:
   * @param sqlOrSearchNo  执行的数据源：可能是一个sql,或者是SFSearch编号.
   * @param paras  要执行的参数.
   * @returns 返回json的结果集合.
   */
  public static async RunSQLReturnSearch(sqlOrSearchNo: string, paras = 'xxxx') {
    try {
      if (sqlOrSearchNo == null || typeof sqlOrSearchNo === 'undefined' || sqlOrSearchNo == '') {
        console.trace('sql为空，请求无效');
        message.error('数据查询为空，请求无效');
        return;
      }
      if (typeof sqlOrSearchNo === 'string' && !sqlOrSearchNo.includes(' ')) {
        const sfTable = new SFSearch(sqlOrSearchNo);
        const data = await sfTable.GenerData(paras);
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item) => {
            return {
              value: item.No || item.MyPK || item.WorkID || item.OID,
              label: item.Name,
              text: item.Name,
            };
          });
        }
        return [];
      }
      // if (sql.includes('@')==true)
      const formData = new FormData();
      const { VITE_GLOB_ENCRYPTION_KEY } = getAppEnvConfig();
      const encryption = new AesEncryption({ key: VITE_GLOB_ENCRYPTION_KEY });
      formData.append('SQL', encryption.encryptByAES(encodeURIComponent(sqlOrSearchNo)));
      formData.append('DBSrc', 'local');
      return await request.post<any, any>(REQUEST_URL, formData, {
        params: {
          DoType: 'DBAccess_RunSQLReturnTable',
          t: Date.now(),
        },
      });
    } catch (e: any) {
      message.error(e.toString());
    }
  }
  /**
   * 执行SQL语句
   * @param sql 执行的语句
   * @param dbSource 数据源类型 本地和外部数据源
   * @constructor
   */
  public static async RunSQLReturnTable(sql: string, dbSource = 'local', paras = '', isFirst = true) {
    if (sql.startsWith('DBSrc.') == true) {
      return await DataBankBase.GenerStringByMarkID(sql);
    }

    try {
      if (sql == null || typeof sql === 'undefined' || sql == '') {
        console.trace('sql为空，请求无效');
        message.error('数据查询为空，请求无效');
        return;
      }
      if (typeof sql === 'string' && !sql.includes(' ') && sql.startsWith('Ens,') == true) {
        const sfTable = new SFTable(sql.replace('Ens,', ''));
        const data = await sfTable.GenerData();
        if (Array.isArray(data) && data.length > 0) {
          return data.map((item) => {
            return {
              value: item.No || item.MyPK || item.WorkID || item.OID,
              label: item.Name,
              text: item.Name,
            };
          });
        }
        return [];
      }
      // if (sql.includes('@')==true)
      const formData = new FormData();
      const { VITE_GLOB_ENCRYPTION_KEY } = getAppEnvConfig();
      const encryption = new AesEncryption({ key: VITE_GLOB_ENCRYPTION_KEY });
      formData.append('SQL', encryption.encryptByAES(encodeURIComponent(sql)));
      formData.append('DBSrc', dbSource);
      formData.append('Paras', paras);
      return await request.post<any, any>(REQUEST_URL, formData, {
        params: {
          DoType: 'DBAccess_RunSQLReturnTable',
          t: Date.now(),
        },
      });
    } catch (e: any) {
      if ((sql.toLowerCase().startsWith('ens://') || sql.toLowerCase().startsWith('en://')) && isFirst) {
        let exp = sql;
        const remark = exp.trim().toLowerCase().startsWith('ens://') ? 'Ens' : 'En';
        if (remark === 'Ens') exp = exp.substring(6);
        else exp = exp.substring(5);
        const strs = exp.split('/');
        const classID = strs[0];
        if (e.toString() === '没有找到[' + classID + ']的map。') {
          const entity = await ClassFactory.GetEn(classID);
          await entity.Init();
          return await this.RunSQLReturnTable(sql, dbSource, paras, false);
        }
      }
      message.error(e.toString());
    }
  }

  /**
   * 根据URl请求返回字符串数据
   * @param url
   * @constructor
   */
  public static async RunUrlReturnString(url: string) {
    if (url == null || typeof url === 'undefined') {
      message.error('url为空，请求无效');
      return;
    }
    if (url.match(/^http:\/\//) == null && url.match(/^https:\/\//) == null) {
      const { VITE_GLOB_API_URL } = getAppEnvConfig();
      url = VITE_GLOB_API_URL + '/' + url;
    }
    const formData = new FormData();
    formData.append('urlExt', url);
    return await request.post<any, any>(REQUEST_URL, formData, {
      params: {
        DoType: 'RunUrlCrossReturnString',
        t: Date.now(),
      },
    });
  }

  /**
   * 根据URl请求返回JSON格式数据
   * @param url
   * @constructor
   */
  public static async RunUrlReturnJSON(url: string) {
    let str = await this.RunUrlReturnString(url);
    if (Array.isArray(str) && str.length > 0) {
      str = JSON.stringify(str);
    }
    if (typeof str == 'string') {
      if (str.includes('url为空') == true) {
        this.data = [];
        return;
      }
      if (str.includes('err@') == true) {
        message.error(str.replace('err@', ''));
        this.data = [];
        return;
      }
      try {
        this.data = JSON.parse(str);
      } catch (e: any) {
        message.error('值获取失败,技术信息:' + e.toString());
        console.log('RunUrlReturnJSON数据解析失败:' + str);
        this.data = [];
      }
    }
    if (typeof str == 'object') {
      this.data = [str];
    }
  }
  /**
   * 执行方法
   * @param funcName 方法名称
   * @constructor
   */
  public static RunFunctionReturnStr(funcName: string) {
    //可能需要动态引入js/ts文件
    try {
      funcName = funcName.replace(/~/g, "'");
      if (funcName.indexOf('(') == -1) return eval(funcName + '()');
      else return eval(funcName);
    } catch (e: any) {
      if (e.message) message.error('执行方法[' + funcName + ']错误:' + e.message);
    }
  }
}
