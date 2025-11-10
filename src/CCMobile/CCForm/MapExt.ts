import BSEntity from '/@/utils/gener/BSEntity';
import { DealExp } from '/@/utils/gener/StringUtils';
import DBAccess from '/@/utils/gener/DBAccess';
import { message } from 'ant-design-vue';
import { SysEnums } from '/@/WF/Admin/FrmLogic/SysEnum/SysEnum';
import WebUser from '/@/bp/web/WebUser';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { handleNoNameField } from '/@/utils/stringUtils';
import { GloGenerDBSrc } from '/@/CCFast/GenerDBSrc/GloGenerDBSrc';
import { GenerDBSrc } from '/@/CCFast/GenerDBSrc/GenerDBSrc';
import { showFailToast } from 'vant';

/**
 * 扩展属性的处理
 */
export function mapExtParse() {
  /**
   * MapExt中扩展属性值的获取
   * @param mapExt
   * @param field
   * @param keyVal
   * @param pkval
   * @param rowData
   * @constructor
   */
  const GetDataTableByDB = async (mapExt, field, keyVal, pkval, rowData = {}) => {
    if (!mapExt.DBSrc == null) return [];
    if (mapExt.DBType == 0) {
      const en = new BSEntity('BP.Sys.MapExt', mapExt.MyPK);
      await en.Init();
      //增加表单上的
      const paras = '@Key=' + keyVal;
      const data = await en.DoMethodReturnString('GetDataTableByField', field, paras, '', pkval, '');
      console.log(data);
      if (typeof data === 'string' && data.indexOf('err@') != -1) {
        message.error(data);
        return [];
      }
      return handleNoNameField(data);
    }
    //处理sql，url参数.
    let dbSrc = mapExt.DBSrc.replace(/~/g, "'");
    if (keyVal != null) {
      keyVal = keyVal.replace(/'/g, '');

      dbSrc = dbSrc.replace(/@Key/g, keyVal);
      dbSrc = dbSrc.replace(/@key/g, keyVal);
      dbSrc = dbSrc.replace(/@KEY/g, keyVal);
    }
    dbSrc = DealExp(dbSrc, rowData);

    return DBAccess.RunDBSrc(dbSrc, mapExt.DBType, '');
  };
  /**
   * 小范围单选/多选的查询
   * @param mapExt
   * @param pkval
   * @constructor
   */
  const GetDataTableOfTBChoice = async (mapExt, pkval) => {
    const data: any[] = [];
    let tag1 = mapExt.Tag1;
    const tag4 = mapExt.Tag4;
    switch (parseInt(mapExt?.DoWay)) {
      case 1:
        if (!tag1) {
          message.error('输入的值不能为空');
          return [];
        }
        tag1 = tag1.replace(/;/g, ',');
        let i = 0;
        tag1.split(',').forEach((item) => {
          data.push({
            value: i.toString(),
            text: item,
          });
          i++;
        });
        break;
      case 2: //枚举.
        if (!tag1) {
          message.error('请选择枚举值');
          return [];
        }
        const enums = new SysEnums();
        if (WebUser.CCBPMRunModel === CCBPMRunModel.SAAS) await enums.Retrieve('EnumKey', tag1, 'OrgNo', WebUser.OrgNo);
        else await enums.Retrieve('EnumKey', tag1);
        enums.forEach((item) =>
          data.push({
            value: item.IntKey.toString(),
            text: item.Lab,
          }),
        );
        break;
      case 3: //外键表.
        if (!tag1) {
          message.error('请选择外键字段');
          return [];
        }
        const en = new BSEntity('BP.Sys.SFTable', tag1);
        const dt = await en.DoMethodReturnString('GenerDataOfJson');
        if (dt.length > 400) {
          message.warning('数据量太大，请检查配置是否有逻辑问题，或者您可以使用搜索多选或者pop弹出窗选择:' + tag1);
          return [];
        }
        dt.forEach((item) =>
          data.push({
            value: item.No,
            text: item.Name,
          }),
        );
        break;
      case 4:
        if (!tag4) {
          message.error('请输入需要查询的SQL语句');
          return [];
        }
        const dtt = await GetDataTableByDB(mapExt, 'Tag4', '', pkval);
        if (typeof dtt === 'string' && dtt.includes('err@')) {
          message.error(dtt.replace('err@', ''));
          return [];
        }
        if (dtt.length > 400) {
          message.error('数据量太大，请检查配置是否有逻辑问题，或者您可以使用搜索多选或者pop弹出窗选择:' + mapExt.Tag3);
          return [];
        }
        dtt.forEach(function (item) {
          data.push({
            value: item.No,
            text: item.Name,
          });
        });
        break;
      default:
        message.error('未判断的模式');
        return null;
    }
    return data;
  };
  /***
   * 小写转大写
   * @param money
   * @constructor
   */
  const CovertMoneyToCN = (money: number) => {
    if (money.toString().includes(',')) {
      money = parseFloat(money.toString().replace(/,/g, ''));
    }
    const cnNums = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']; //汉字的数字
    const cnIntRadice = ['', '拾', '佰', '仟']; //基本单位
    const cnIntUnits = ['', '万', '亿', '兆']; //对应整数部分扩展单位
    const cnDecUnits = ['角', '分', '毫', '厘']; //对应小数部分单位
    let cnIntLast = '元'; //整型完以后的单位
    // eslint-disable-next-line @typescript-eslint/no-loss-of-precision
    const maxNum = 999999999999999.99; //最大处理的数字
    let IntegerNum = ''; //金额整数部分
    let DecimalNum = ''; //金额小数部分
    let ChineseStr = ''; //输出的中文金额字符串
    let parts: string[] = ['', '']; //分离金额后用的数组，预定义
    let zeroCount, IntLen, n, p, q, m, decLen;
    if (money == undefined) {
      return '';
    }
    if (money >= maxNum) {
      return '超出最大处理数字';
    }
    //表示负数
    const isNegative = money < 0;
    const str = isNegative ? '负' : '';
    if (money == 0) {
      ChineseStr = cnNums[0] + cnIntLast;
      return str + ChineseStr;
    }
    const strMoney = isNegative ? money.toString().substring(1) : money.toString();
    if (strMoney.indexOf('.') == -1) {
      IntegerNum = strMoney;
      DecimalNum = '';
      cnIntLast = '元整';
    } else {
      parts = strMoney.split('.');
      IntegerNum = parts[0];
      DecimalNum = parts[1].substr(0, 2);
    }
    if (parseInt(IntegerNum, 10) > 0) {
      //获取整型部分转换
      zeroCount = 0;
      IntLen = IntegerNum.length;
      for (let i = 0; i < IntLen; i++) {
        n = IntegerNum.substr(i, 1);
        p = IntLen - i - 1;
        q = p / 4;
        m = p % 4;
        if (n == '0') {
          zeroCount++;
        } else {
          if (zeroCount > 0) {
            ChineseStr += cnNums[0];
          }
          zeroCount = 0; //归零
          ChineseStr += cnNums[parseInt(n)] + cnIntRadice[m];
        }
        if (m == 0 && zeroCount < 4) {
          ChineseStr += cnIntUnits[q];
        }
      }
      ChineseStr += cnIntLast;
      //整型部分处理完毕
    }
    if (DecimalNum != '') {
      //小数部分
      decLen = DecimalNum.length;
      for (let i = 0; i < decLen; i++) {
        n = DecimalNum.substr(i, 1);
        if (n != '0') {
          ChineseStr += cnNums[Number(n)] + cnDecUnits[i];
        }
      }
    }
    if (ChineseStr == '') {
      ChineseStr += cnNums[0] + cnIntLast;
    }
    return str + ChineseStr;
  };
  /**
   * 级联下拉框
   * @param value
   * @param mapExt
   * @param refPKVal
   * @param rowData
   * @constructor
   */
  const GetActionDLLData = async (value, mapExt, refPKVal, rowData) => {
    let data: any[] = [];
    //不选择的时候
    if (value === '' || value === 'all') {
      data.push({
        value: '',
        text: '-无-',
      });
    } else {
      try{
        if(!mapExt.Doc){
          const mypk = 'Frm.'+mapExt.FK_MapData+'_'+mapExt.AttrOfOper+'.'+mapExt.Tag1+'.FullDataDDL';
          data = await GloGenerDBSrc.GenerData_ByMyPK_WithJson(mypk,{Key:value,...rowData});
        }else{
          data = await GetDataTableByDB(mapExt, 'Doc', value, refPKVal, rowData);
        }
        
        data = data.map((item) => {
          return {
            value: String(item?.No ?? item?.NO ?? item?.no ?? ''),
              text: item.Name || item.NAME || item.name,
          };
        });
      }catch(e){
        if(e.toString().includes('err@没有启用.'))
          return null;
        showFailToast(e as string);
        data = [];
      }
    }
    return data;
  };
  const GetFullData = async (value, mapExt, refPKVal, rowData, mainData: Record<string, any> | any = null) => {
    //不选择的时候
    if (value === '' || value === 'all') return null;
    const en = new BSEntity('BP.Sys.MapExt', mapExt.MyPK);
    await en.Init();
    //增加表单上的
    let paras = '';
    for (const item in rowData) {
      paras += '@' + item + '=' + rowData[item];
    }
    if (mainData != null)
      for (const item in mainData) {
        paras += '@' + item + '=' + mainData[item];
      }
    paras += '@Key=' + value;
    const mypk = 'Frm.'+mapExt.FK_MapData+'_'+mapExt.AttrOfOper+'.FullDataBody';
    const dbsrc = new GenerDBSrc();
    dbsrc.MyPK = mypk;
    try{
      if(await dbsrc.RetrieveFromDBSources() === 1){
        const data = await GloGenerDBSrc.GenerData_ByMyPK_WithAtPara(mypk,paras);
        return data;
      }
      if (!!mapExt.Tag5 && mapExt.Tag5 != 'None' && mapExt.Tag5 != '0')
        return null;
      const en = new BSEntity('BP.Sys.MapExt', mapExt.MyPK);
      await en.Init();
      if (!en.Tag5) return null;
      if (!en.Tag6) return null;
      
      const data = await en.DoMethodReturnString('GetFullData', encodeURIComponent(paras), encodeURIComponent(refPKVal));
      if (typeof data === 'string' && data.indexOf('err@') != -1) {
        message.error(data);
        return null;
      }
      if (typeof data === 'undefined' || data.length == 0) return null;
      if(Array.isArray(data)){
        if(data.length>0) return data[0];
        return null;
      }
      return data;
    }catch(e){
      if(e.toString().includes('err@没有启用.'))
        return null;
      showFailToast(e);
      return null;
    }  
  };
  const GetFullDataDtl = async (value, mapExt, refPKVal, rowData, mainData) => {
    //不选择的时候
    if (value === '' || value === 'all') return null;
    const en = new BSEntity('BP.Sys.MapExt', mapExt.MyPK);
    await en.Init();
    //增加表单上的
    let paras = '';
    for (const item in rowData) {
      paras += '@' + item + '=' + rowData[item];
    }
    for (const item in mainData) {
      paras += '@' + item + '=' + mainData[item];
    }
    paras += '@Key=' + value;
   try{
      if(!mapExt.Doc){
        const mypk = 'Frm.'+mapExt.AttrOfOper+'.'+mapExt.Tag1+'.FullDataDtl';
        const data = await GloGenerDBSrc.GenerData_ByMyPK_WithJson(mypk,{Key:!!value?.target?.value?value?.target?.value:value,...rowData});
        return data;
      }
      const data = await en.DoMethodReturnString('GetFullDataDtl', encodeURIComponent(paras), encodeURIComponent(refPKVal));
      if (typeof data === 'string' && data.indexOf('err@') != -1) {
        showFailToast(data);
        return null;
      }
      return '';
    }catch(e){
      if(e.toString().includes('err@没有启用.'))
        return null;
      showFailToast(e);
      return null;
    }
  };
  const GetFullDataAth = async (value, mapExt, refPKVal, rowData, mainData) => {
    //不选择的时候
    if (value === '' || value === 'all') return null;
    const en = new BSEntity('BP.Sys.MapExt', mapExt.MyPK);
    await en.Init();
    //增加表单上的
    let paras = '';
    for (const item in rowData) {
      paras += '@' + item + '=' + (rowData[item] || '').toString().replace(/@/g, '[`]');
    }
    for (const item in mainData) {
      paras += '@' + item + '=' + (mainData[item] || '').toString().replace(/@/g, '[`]');
    }
    paras += '@Key=' + (value || '').toString().replace(/@/g, '[`]');
    try{
      if(!mapExt.Doc){
        const mypk = 'Frm.'+mapExt.FK_MapData+'_'+mapExt.AttrOfOper+'.'+mapExt.Tag1+'.FullDataAth';
        const data = await GloGenerDBSrc.GenerData_ByMyPK_WithJson(mypk,{Key:!!value?.target?.value?value?.target?.value:value,...rowData});
        return data;
      }
      const data = await en.DoMethodReturnString('GetFullDataAth', encodeURIComponent(paras), encodeURIComponent(refPKVal));
      if (typeof data === 'string' && data.indexOf('err@') != -1) {
        showFailToast(data);
        return null;
      }
      return '';
    }catch(e){
      if(e.toString().includes('err@没有启用.'))
        return null;
      showFailToast(e);
      return null;
    }
  };
  const objectToKeyValueString = (obj) => {
    const keyValueArray: string[] = [];
    if (!!obj) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key) && !!obj[key]) {
          keyValueArray.push(`@${key}=${obj[key]}`);
        }
      }
    }
    return keyValueArray.join('');
  };
  return {
    GetDataTableByDB,
    GetDataTableOfTBChoice,
    CovertMoneyToCN,
    GetActionDLLData,
    GetFullData,
    GetFullDataDtl,
    GetFullDataAth,
    objectToKeyValueString,
  };
}
