import { message } from 'ant-design-vue';
import { SFSearch } from '../SFSearch/SFSearch';
import { SFTable } from '../SFTable/SFTable';
import { GPN_Enum } from '../SysEnum/GPN_Enum';
import { SysEnumMain } from '../SysEnum/SysEnumMain';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { DataType } from '/@/bp/en/DataType';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import WebUser from '/@/bp/web/WebUser';
import BSEntity from '/@/utils/gener/BSEntity';
import { GloComm } from '/@/WF/Comm/GloComm';
import { splitAtString } from '/@/bp/tools/ParamUtils';
import { SFProc } from '/@/WF/Admin/FrmLogic/SFProc/SFProc';
import { isConvertibleToNumber } from '/@/utils/stringUtils';

export class GPN_Local extends PageBaseGroupNew {
  constructor() {
    super('GPN_Local');
    //  this.ForEntityClassID = 'TS.FrmUI.SFTable';
    this.PageTitle = '新建';
  }
  public async Init() {
    const pageNo = this.RequestVal('PageNo');

    if (pageNo == 'SFTable') {
      this.AddGroup('A', '新建字典', 'icon-list'); //增加分组.
      this.TextBox2_NameNo('EnTable', '实体字典表', this.SFTable, 'En_', '字典ID', '字典名称', '');
      this.AddIcon('icon-notebook', 'EnTable');
      this.SelectItemsByList('EnTable.CodeStruct', '数据结构', this.SFTable, false, this.GetCodeStruct());

      this.TextBox2_NameNo('SFTable', '内置字典表', this.SFTable, 'SF_', '字典ID', '字典名称', '');
      this.AddIcon('icon-energy', 'SFTable');

      this.SelectItemsByList('SFTable.CodeStruct', '数据结构', this.SFTable, false, this.GetCodeStruct());

      this.TextBox2_NameNo('SQL', 'SQL查询字典表', this.SQL, 'SQL_', '字典ID', '字典名称', '');
      this.AddIcon('icon-eyeglass', 'SQL');

      this.TextArea('SQL.Doc', '填写SQL', this.SQL_Doc, '查询SQL', `SELECT No,Name FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo'`, '查询语句');
      this.SelectItemsByList('SQL.Doc.CodeStruct', '数据结构', this.SFTable, false, this.GetCodeStruct());

      if (this.RequestVal('From') == 'FrmD') {
        this.AddBlank('HelpIt', '新增外部数据源字典', '请在数据源里维护.');
      }
    }

    if (pageNo == 'Search') {
      this.AddGroup('B', '新建查询', 'Search'); //增加分组.
      this.TextBox3_NameNoNote('Search', '创建查询', this.HelpSearch, 'Search_', '编号', '名称', '备注', '我的查询');
      this.SelectItemsByList('Search.ResultNum', '查询类型', this.SFTable, false, await this.ResultNum());
      this.AddIcon('icon-layers', 'Search');
    }

    if (pageNo == 'Proc') {
      this.AddGroup('C', '新建过程', 'Proc'); //增加分组.
      this.TextBox2_NameNo('Proc', '创建过程', this.HelpSearch, 'Proc_', '编号', '名称', '我的过程');
      this.AddIcon('icon-options', 'Proc');
    }
    if (pageNo == 'Enums') {
      this.AddGroup('D', '新建枚举', 'icon-list'); //增加分组.
      this.TextBox3_NameNoNote('Enums', '新建枚举', GPN_Enum.NewIntEnum, '', '枚举ID', '枚举名称', '请输入内容(比如:男,女)', '');
      //this.TextBox3_NameNoNote('NewStrEnum', '新建String类型枚举', GPN_Enum.NewStrEnum, '', '枚举ID', '枚举名称', '请输入枚举值', '');
    }

    // this.AddGroup('Z', '字典(将要取消)', 'icon-list'); //增加分组.
    // this.TextBox2_NameNo('Handler', '微服务Handler字典表', this.Handler, 'Handler_', '字典ID', '字典名称', '');
    // this.TextSQL('Handler.Doc', '填写内容', this.SQL_Doc, '查询SQL', `SELECT No,Name FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo'`, '查询语句');

    // this.TextBox2_NameNo('JavaScript', 'JavaScript字典表', this.JavaScript, 'JS_', '字典ID', '字典名称', '');
    // this.TextArea('JavaScript.Doc', '填写方法名', this.SQL_Doc, '方法名', ` MyDict() `, 'Javascript的方法名');
  }
  public async ResultNum() {
    return JSON.stringify([
      { No: '0', Name: '多行记录(集合查询)' },
      { No: '1', Name: '单行记录(实体查询)' },
    ]);
  }
  public GetCodeStruct() {
    const dictJson = [
      { No: '0', Name: '编号名称' },
      { No: '1', Name: '树结构' },
    ];
    const json = JSON.stringify(dictJson);
    return json;
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }
  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    if (pageNo == 'HelpIt') {
      alert('请在数据源里维护,操作手册.https://docs.qq.com/doc/DRG52QmlyeG1kSUJE');
      return;
    }
    if (pageNo == 'Search') {
      const en = new SFSearch();
      en.No = tb2;
      if ((await en.IsExits()) == true) {
        return new GPNReturnObj(GPNReturnType.Error, '编号[' + tb2 + ']已经存在.');
      }
    }
    if (pageNo == 'Search.ResultNum') {
      const en = new SFSearch();
      en.No = this.RequestVal('tb2', 'Search');
      en.Name = this.RequestVal('tb1', 'Search');
      en.Remark = this.RequestVal('tb3', 'Search');

      //数据源.
      en.FK_SFDBSrc = 'local';
      en.ResultNum = tb1; //类型
      en.SetPara('EnName', 'TS.FrmUI.SFSearchSQL');
      await en.Insert();
      const url = GloComm.UrlEn('TS.FrmUI.SFSearchSQL', en.No); // '/@/WF/Comm/En.vue?EnName=' + en.GetParaString('EnName', '') + '&PKVal=' + en.No;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    if (pageNo == 'Proc') {
      const en = new SFProc();
      en.No = tb2;
      if ((await en.IsExits()) == true) {
        return new GPNReturnObj(GPNReturnType.Error, '编号[' + tb2 + ']已经存在.');
      }
      en.Name = tb1;
      //数据源.
      en.FK_SFDBSrc = 'local';
      en.Remark = tb3;
      en.SetPara('EnName', 'TS.FrmUI.SFProcSQL');
      await en.Insert();
      const url = GloComm.UrlEn('TS.FrmUI.SFProcSQL', en.No); // '/@/WF/Comm/En.vue?EnName=' + en.GetParaString('EnName', '') + '&PKVal=' + en.No;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    //新增枚举值.
    if (pageNo == 'Enums' || pageNo == 'NewStrEnum') {
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
      if (pageNo === 'Enums') {
        if (!cfgVal.includes(',') && !cfgVal.includes('@')) {
          return new GPNReturnObj(GPNReturnType.Error, '多个枚举值使用 , 或 @ 符号分开.');
        }

        // 要先生成20个选项
        for (let index = 0; index < 20; index++) {
          enumMain.SetValByKey('Idx' + index, index);
        }
        let enumType = 0; //默认是Int类型的枚举
        // 普通格式
        if (cfgVal.indexOf('@') == -1) {
          // 转换格式
          const strs = cfgVal.split(',');
          //let strStand = '';
          strs.forEach((str, idx) => {
            //strStand += '@' + idx + '=' + str;
            enumMain.SetValByKey('Idx' + idx, idx);
            enumMain.SetValByKey('Val' + idx, str);
          });

          //cfgVal = strStand;
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
        const enName = enumType === 0 ? 'TS.FrmUI.SysEnumMainInt' : 'TS.FrmUI.SysEnumMainString';
        enumMain.CfgVal = cfgVal;
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
      if (pageNo === 'NewStrEnum') {
        // cfgVal.indexOf(',') == -1 &&
        if (!cfgVal.includes('@')) {
          return new GPNReturnObj(GPNReturnType.Error, '多个枚举值使用逗号分开.');
        }
        //如果是标准格式.
        if (cfgVal.indexOf('@') == -1) {
          //如果是一般格式,就转化为标准格式.
          const strs = cfgVal.split(',');
          // let strStand = '';
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
            // strStand += '@' + str;
            enumMain.SetValByKey('Idx' + idx, strVal[0]);
            enumMain.SetValByKey('Val' + idx, strVal[1]);
          });
        } else {
          const strs = splitAtString(cfgVal);
          strs.forEach((item, idx) => {
            const [key, val] = item.split('=');
            enumMain.SetValByKey('Idx' + idx, key);
            enumMain.SetValByKey('Val' + idx, val);
          });
        }

        // cfgVal = strStand;
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
    //创建外键数据字典.
    const sfTable = new SFTable();
    sfTable.Name = tb1;
    sfTable.No = tb2;
    sfTable.TableDesc = tb3; //备注.
    sfTable.RDT = DataType.CurrentDateTime;
    if (pageNo.includes('.') == false) {
      if (await sfTable.IsExits()) {
        throw new Error('编号:' + sfTable.No + '已存在.');
      }
    }

    //自定义字典表.内置字典表
    /*srcType= 0	本地的类 1	创建表 2	表或视图 3	SQL查询表 4	WebServices 5	微服务Handler外部数据源
    6	JavaScript外部数据源 7	系统字典表 8	WebApi接口     */
    if (pageNo === 'SFTable.CodeStruct') {
      sfTable.Name = this.RequestVal('tb1', 'SFTable');
      sfTable.No = this.RequestVal('tb2', 'SFTable');

      sfTable.FK_SFDBSrc = 'local';
      sfTable.DBSrcType = 'SysDict';
      sfTable.DBType = 0;
      sfTable.FK_Val = sfTable.No;
      sfTable.CodeStruct = this.RequestVal('tb1', 'SFTable.CodeStruct'); //字典结构类型.0=编号名称，1=树结构.
      if (sfTable.CodeStruct == 0) sfTable.SetPara('EnName', 'TS.FrmUI.SFTableNoName');
      else sfTable.SetPara('EnName', 'TS.FrmUI.SFTableTree');
      await sfTable.Insert();

      //给i他初始化数据.
      const bpEn = new BSEntity('BP.Sys.SFTable', sfTable.No);
      await bpEn.Retrieve();
      await bpEn.DoMethodReturnString('GenerDataOfJson');

      let url = '';
      url = '/@/WF/Comm/En.vue?EnName=' + sfTable.GetParaString('EnName', '') + '&PKVal=' + sfTable.No;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    if (pageNo === 'EnTable.CodeStruct') {
      sfTable.Name = this.RequestVal('tb1', 'EnTable');
      sfTable.No = this.RequestVal('tb2', 'EnTable');

      sfTable.FK_SFDBSrc = 'local';
      sfTable.DBSrcType = 'EnTable';
      sfTable.DBType = 0;
      sfTable.FK_Val = sfTable.No;
      sfTable.CodeStruct = this.RequestVal('tb1', 'EnTable.CodeStruct'); //字典结构类型.0=编号名称，1=树结构.
      if (sfTable.CodeStruct == 0) sfTable.SetPara('EnName', 'TS.FrmUI.EnTableNoName');
      else sfTable.SetPara('EnName', 'TS.FrmUI.EnTableTree');
      await sfTable.Insert();

      //给i他初始化数据.
      const bpEn = new BSEntity('BP.Sys.SFTable', sfTable.No);
      await bpEn.Retrieve();
      await bpEn.DoMethodReturnString('CheckEnTable');

      await bpEn.DoMethodReturnString('GenerDataOfJson');

      let url = '';
      url = '/@/WF/Comm/En.vue?EnName=' + sfTable.GetParaString('EnName', '') + '&PKVal=' + sfTable.No;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }

    if (pageNo == 'SQL.Doc.CodeStruct') {
      sfTable.Name = this.RequestVal('tb1', 'SQL');
      sfTable.No = this.RequestVal('tb2', 'SQL');
      sfTable.DBSrcType = 'SQL';
      //sfTable.SrcType = 3; //字典数据源类型.

      //根据不同的字典类型,生成.
      sfTable.CodeStruct = this.RequestVal('tb1', 'SQL.Doc.CodeStruct'); //数据结构.
      let enName = 'TS.FrmUI.SFTableSQLNoName';
      if (sfTable.CodeStruct == 1) enName = 'TS.FrmUI.SFTableSQLTree';
      sfTable.SetPara('EnName', enName);

      sfTable.SelectStatement = this.RequestVal('tb1', 'SQL.Doc'); //SQL语句.
      sfTable.FK_SFDBSrc = 'local'; // this.RequestVal('tb1', 'SQL.Doc'); //数据源.
      sfTable.FK_Val = sfTable.No;
      sfTable.SrcType = 3; // SQL类型.
      await sfTable.Insert();

      const url = GloComm.UrlEn(enName, sfTable.No);
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
    if (pageNo == 'Handler.Doc') {
      sfTable.Name = this.RequestVal('tb1', 'Handler');
      sfTable.No = this.RequestVal('tb2', 'Handler');
      sfTable.DBSrcType = 'Handler';
      //sfTable.SrcType = 5;
    }

    if (pageNo == 'JavaScript.Doc') {
      sfTable.Name = this.RequestVal('tb1', 'JavaScript');
      sfTable.No = this.RequestVal('tb2', 'JavaScript');
      sfTable.DBSrcType = 'JavaScript';
      //sfTable.SrcType = 6;
    }

    let enName = '';
    if (pageNo === 'Handler.Doc') enName = 'TS.FrmUI.SFTableHandler';
    if (pageNo === 'JavaScript.Doc') enName = 'TS.FrmUI.SFTableJS';
    sfTable.SelectStatement = tb2;
    sfTable.FK_SFDBSrc = tb1;
    sfTable.FK_Val = sfTable.No;

    if (enName !== '') {
      sfTable.SetPara('EnName', enName);
      sfTable.SelectStatement = tb2;
      sfTable.FK_SFDBSrc = tb1;
      sfTable.FK_Val = sfTable.No;
      await sfTable.Insert();
      const url = '/@/WF/Comm/En.vue?EnName=' + enName + '&PKVal=' + sfTable.No;
      return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    }
  }

  public readonly HelpSearch = `
  #### 帮助
  - 查询与字典表不同，他需要参数据才能执行.
  #### 用到场景
  - 文本框自动完成, 级联下拉框、自动填充.
  `;

  public readonly WebApi_Url = `
  #### 帮助
   - 请输入路径参数.
   - 仅仅输入主机端口号后面的部分.
   - 比如: /xxxx.do
  `;

  public readonly SrcHelp = `
  #### 帮助
   - 请选择数据源，如果没有，请新建数据源.
   - 
  `;

  public readonly SFTable = `
  #### 字典表
  - 字典表也叫元数据表，具有编号,名称数据类型, 比如: 省份，片区、城市、税种，税目.
  - 字典表的内容可以让业务人员维护的表.
  - 有两种类型: 编码结构的字典表No,Name, 树结构的字典表No,Name,ParentNo.
  #### 内置字典表
   - 存储在 Sys_SFTableDtl 表里. 
   - 用户可以通过ccfrom自己定义，自己维护的基础数据.
   - 这种方式，不需要创建新的表.
   - 局限性:只有No,Name类型编码表，或者No,Name,ParentNo的树结构的表.不允许扩展其他的属性.
  #### 实体字典表
   - 创建指定的表的外键表，字典的ID对应的是一个当前数据库存在的表,如果没有就自动创建这个表.
   - 用户可以定义定义其他的属性，比实体简单，是实体的一种.
   - 比如: 班级字典表，可以增加班主任、班级学生数量字段.
  `;

  public readonly Handler = `
  #### 帮助
   - 优点:格式灵活,展现效果随心所欲.
   - 适用于:效果
   #### lisdxcx
  `;

  public readonly SQL = `
  #### 帮助
   - 设置一个SQL语句从数据源中查询出来.
   - 支持ccbpm的表达式. @WebUser.No 当前用户编号， @WebUser.Name 登录名称， @WebUser.DeptNo 登录人所在部门.
   #### DEMO
   - 本部门的人员.
   - SELECT No,Name FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo'
   - 我的下级部门
   - SELECT No,Name FROM Port_Dept WHERE PartentNo='@WebUser.DeptNo'
xxx      
  `;
  public readonly SQL_Doc = `
  #### 帮助
   - 设置一个SQL语句从数据源中查询出来.
   - 支持ccbpm的表达式. @WebUser.No 当前用户编号， @WebUser.Name 登录名称， @WebUser.DeptNo 登录人所在部门.
   #### DEMO
   - 本部门的人员.
   - SELECT No,Name FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo'
   - 我的下级部门
   - SELECT No,Name FROM Port_Dept WHERE PartentNo='@WebUser.DeptNo'
xxx      
  `;

  // 选择系统枚举
  public readonly JavaScript = `
    #### 帮助
     - 暂无
     #### lisdxcx
     function Xxx()
     {
        
     }
xxx      
    `;
  // 选择系统枚举
  public readonly WebApi = `
  #### 帮助
   - 调用服务获得数据.
    
  `;

  // web地址.
  public readonly WebApi_Doc = `
  #### 帮助
  - 调用服务获得数据.
    
  `;

  // 选择自定的枚举
  public readonly Docs1 = `
  #### 帮助 
  - 暂无
  `;

  // 选择系统枚举
  public readonly Docs2 = `
  #### 帮助
  - 暂无
    
  `;

  // 新建string枚举
  public readonly Docs4 = `
  #### 帮助
  - 填写格式: 枚举值,枚举标签; 
  - 例如: ty,团员;dy=党员;qz,群众; 
  - 系统解析为: ty是团员, dy是党员, qz是群众.

  #### 数据存储.
  - string类型的枚举也称为标记枚举,字母存储一个列,标签存储一个列.
  - 在表单里字段是abc,那系统就会自动创建一个影子字段 abcT.
  - abc字段存储的是标记, abcT存储的是标签.
  `;
}
