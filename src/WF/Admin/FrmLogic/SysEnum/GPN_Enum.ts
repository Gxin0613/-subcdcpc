import { message } from 'ant-design-vue';
import { SysEnumMain } from './SysEnumMain';
import { DataType } from '/@/bp/en/DataType';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { splitAtString } from '/@/bp/tools/ParamUtils';
import WebUser from '/@/bp/web/WebUser';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { GloComm } from '/@/WF/Comm/GloComm';
import { isConvertibleToNumber } from '/@/utils/stringUtils';

export class GPN_Enum extends PageBaseGroupNew {
  constructor() {
    super('GPN_Enum');
    this.PageTitle = '新建枚举';
    this.ForEntityClassID = 'TS.FrmUI.SysEnumMain';
  }
  public Init() {
    //增加子页面.

    this.AddGroup('B', '新建枚举'); //增加分组.
    this.TextBox3_NameNoNote('NewEnum', '新建枚举', GPN_Enum.NewIntEnum, '', '枚举ID', '枚举名称', '请输入内容(比如:男,女)', '');
    // this.TextBox3_NameNoNote('NewEnum', '新建int类型枚举', GPN_Enum.NewEnum, '', '枚举ID', '枚举名称', '请输入内容(比如:男,女)', '');
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, tb1: string, tb2: string, tb3: string) {
    //新增枚举值.
    const name = tb1;
    const enumKey = tb2;
    let cfgVal = tb3.trim();
    //检查枚举值是否存在?
    const enumMain = new SysEnumMain();
    if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) enumMain.No = enumKey;
    else enumMain.No = WebUser.OrgNo + '_' + enumKey;
    enumMain.EnumKey = enumKey;
    if ((await enumMain.IsExits()) === true) {
      message.warning('枚举值已经存在' + enumKey);
      return;
    }
    enumMain.Name = name;

    enumMain.OrgNo = WebUser.OrgNo;

    //替换非法变量.
    cfgVal = cfgVal.replaceAll('，', ',');
    cfgVal = cfgVal.replaceAll('＠', '@');
    cfgVal = cfgVal.replaceAll('＝', '=');

    //新建int枚举值. 要支持两种格式.标准格式: @0=团员@1=党员@2=群众,  一般格式:团员,党员,群众
    if (pageNo === 'NewEnum') {
      if (!cfgVal.includes(',') && !cfgVal.includes('@')) {
        return new GPNReturnObj(GPNReturnType.Error, '多个枚举值使用 , 或 @ 符号分开.');
      }

      // 要先生成20个选项
      for (let index = 0; index < 20; index++) {
        enumMain.SetValByKey('Idx' + index, index);
      }
      let enumType = 0;
      // 普通格式
      if (cfgVal.indexOf('@') == -1) {
        // 转换格式
        const strs = cfgVal.split(',');
        strs.forEach((str, idx) => {
          enumMain.SetValByKey('Idx' + idx, idx);
          enumMain.SetValByKey('Val' + idx, str);
        });
      } else {
        const list = splitAtString(cfgVal);
        list.forEach((item, idx) => {
          const [key, val] = item.split('=');

          if (isConvertibleToNumber(key) == false) enumType = 1;
          enumMain.SetValByKey('Idx' + idx, key);
          enumMain.SetValByKey('Val' + idx, val);
        });
      }
      enumMain.EnumType = enumType;
      enumMain.CfgVal = cfgVal;
      const enName = enumType === 0 ? 'TS.FrmUI.SysEnumMainInt' : 'TS.FrmUI.SysEnumMainString';
      enumMain.SetPara('EnName', enName);

      try {
        await enumMain.Insert();
      } catch {
        await enumMain.Insert();
      }
      await enumMain.SaveDtls(); //更新到 Sys_Enums 里面去。

      const url = GloComm.UrlEn(enName, enumMain.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //新建string枚举值. liyongchao, 2022-12-20
    if (pageNo === 'NewEnum') {
      if (cfgVal.indexOf(',') == -1) {
        return new GPNReturnObj(GPNReturnType.Error, '多个枚举值使用逗号分开.');
      }
      //如果是标准格式.
      if (cfgVal.indexOf('@') == -1) {
        //如果是一般格式,就转化为标准格式.
        const strs = cfgVal.split(',');
        let strStand = '';
        let idx = -1;
        strs.forEach((str) => {
          idx++;
          if (str.indexOf('=') == -1) {
            return new GPNReturnObj(GPNReturnType.Error, '枚举键和枚举值使用等号连接.');
          }
          const strVal = str.split('=');
          if (DataType.IsNullOrEmpty(strVal[0])) {
            return new GPNReturnObj(GPNReturnType.Error, '请填写枚举键.');
          }
          if (DataType.IsNullOrEmpty(strVal[1])) {
            return new GPNReturnObj(GPNReturnType.Error, '请填写枚举值.');
          }
          strStand += '@' + str;
          enumMain.SetValByKey('Idx' + idx, strVal[0]);
          enumMain.SetValByKey('Val' + idx, strVal[1]);
        });

        cfgVal = strStand;
      }
      enumMain.EnumType = 1; // = enumKey; //枚举值.
      enumMain.EnumKey = enumKey; //枚举值.
      enumMain.Name = name;
      enumMain.CfgVal = cfgVal;
      enumMain.SetPara('EnName', 'TS.FrmUI.SysEnumMainString');
      //await enumMain.Insert();
      try {
        await enumMain.Insert();
      } catch {
        await enumMain.Insert();
      }

      await enumMain.SaveDtls(); //更新到 Sys_Enums 里面去。
      const url = GloComm.UrlEn('TS.FrmUI.SysEnumMainString', enumMain.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
  }

  // 新建string枚举
  public static readonly NewEnum = `
  #### 帮助
  - 填写格式: 枚举值=枚举标签;
  - 例如1: @ty=团员@dy=党员@qz=群众
  - 例如2: @shijia=事假@bingjia=病假@hunjia=婚假
  #### 数据存储.
  - string类型的枚举也称为标记枚举,字母存储一个列,标签存储一个列.
  - 在表单里字段是abc,那系统就会自动创建一个影子字段 abcT.
  - abc字段存储的是标记, abcT存储的是标签.
  - 这一点与外部数据源存储一致.
  `;

  // 新建int枚举
  public static readonly NewIntEnum = `
  #### 帮助
  - 填写格式0: 事假,病假,其它
  - 填写格式1: 团员,党员,群众
  - 填写格式2: @0=团员@1=党员@2=群众
  #### 数据存储
  - int类型的枚举值是常用的数据类型，ccfrom是格式化的存储到数据表里.
  - 创建一个int类型的字段，用于存储枚举的数据.
  `;
}
