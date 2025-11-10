import { Json } from '@vicons/carbon';
import { AtPara } from '/@/bp/da/AtPara';
import { booleanType } from 'ant-design-vue/es/_util/type';
import { message } from 'ant-design-vue';
import { GloWF } from '../Admin/GloWF';

export class Glo {
  public static DealSQLStringEnumFormat(cfgString: string) {
    //把这个string,转化SQL. @tuanyuan=团员@dangyuan=党员
    const ap = new AtPara(cfgString);
    let sql = '';
    for (const [key, val] of ap.HisHT) {
      sql += ` SELECT '${key}' as No, '${val}' as Name FROM Port_Emp WHERE No='admin' UNION `;
    }
    // if (SystemConfig.AppCenterDSNDBType === 'MSSQL') {
    //   for (const [key, val] of ap.HisHT) {
    //     sql += ` SELECT ${key} as No, ${val} as Name  UNION`;
    //   }
    // } else {
    //   for (const [key, val] of ap.HisHT) {
    //     sql += ` SELECT ${key} as No, ${val} as Name From DUAL UNION`;
    //   }
    // }
    sql = sql.substring(0, sql.length - 6);
    return sql;
  }
  //表单ID.
  public static get SQLOfBillNo() {
    //let sql =  "SELECT '' AS No, '-请选择-' as Name FROM Port_Emp WHERE 1=2   union   SELECT KeyOfEn AS No,Name From Sys_MapAttr WHERE UIContralType=0 AND UIVisible=1 AND UIIsEnable=1 AND MyDataType=1  AND FK_MapData='@FK_Frm'";
    return GloWF.SQLOfSelectBillNo;
  }
  public static get srcGroupStationTypes() {
    //const sql = 'SELECT No,Name FROM Port_StationType Order By Idx ';
    return GloWF.srcStationTypes;
  }
  public static get srcListStations() {
    //const sql = 'SELECT No,Name,FK_StationType as GroupNo FROM Port_Station Order By Idx ';
    return GloWF.srcStations;
  }

  public static get srcTreeDept() {
    //const sql = 'SELECT No,Name,ParentNo FROM Port_Dept Order By ParentNo, Idx ';
    return GloWF.srcTreeDept;
  }
  //判断是否是json字符串.
  public static IsJsonOrBlank(str: string, attrKey: string) {
    if (str == null || str == '') return true;
    try {
      str = str.replaceAll('~~', '~');
      str = str.replaceAll('~', '"');
      JSON.parse(str);
      return true;
    } catch (e) {
      message.error('字段:' + attrKey + '不是json类型,请检查引号是否半角,以及格式是否正确?');
      return false;
    }
  }

  //表单ID.
  public static get SQLOfCheckField() {
    //let sql =  "SELECT '' AS No, '-请选择-' as Name FROM Port_Emp WHERE 1=2   union   SELECT KeyOfEn AS No,Name From Sys_MapAttr WHERE UIContralType=14 AND FK_MapData='@FK_Frm'";
    return GloWF.SQLOfSelectCheckField;
  }
}
