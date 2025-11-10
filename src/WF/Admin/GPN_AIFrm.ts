import HttpHandler from './FoolFormDesigner/dto/HttpHandler';
import { MapData } from './FrmLogic/MapData';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import Events from '/@/utils/Events';
import { MapAttrs } from './FrmLogic/MapAttrs/MapAttr';
import { GroupFields } from './FrmLogic/GroupField';
import { DataType } from '/@/bp/en/DataType';
import { SysEnumMain } from './FrmLogic/SysEnum/SysEnumMain';
import { SFTable } from './FrmLogic/SFTable/SFTable';
import { UIContralType } from '/@/bp/en/EnumLab';

export class GPN_AIFrm extends PageBaseGroupNew {
  constructor() {
    super('GPN_AIFrm');
    this.PageTitle = 'AI表单';
  }

  public async Init() {
    const from = this.RequestVal('From');
    const md = new MapData();
    md.No = this.RequestVal('FrmID');
    await md.RetrieveFromDBSources();

    if (from == 'Frm') {
      //增加子页面.
      this.AddGroup('A', 'AI表单(主表)'); //增加分组.

      const aiFrmAlert = `我要创建一个 ${md.Name} 表单，
    要求如下：
    1. 应用场景:无
    2. 要求字段:无
   `;
      this.TextArea('AIFrm', '输入提示词', this.WordAlert, '提示词', aiFrmAlert, '请点击帮助参考如何输入提示词?');
      this.Table('AIFrm.SelectedAttrs', '选择字段', this.SelectAttrs, true, this.GenerAttrs);

      this.TextArea('BatchAddAttrs', '批量增加字段', this.WordAlert, '提示词', '电话、邮件、地址', '请输入字段比如：电话、邮件、地址?');
      this.Table('BatchAddAttrs.SelectedAttrs', '选择字段', this.SelectAttrs, true, this.GenerBatchAttrs);

      this.AddBlank('AIAttrs', '字段分析', this.DescAIAttrs);
      this.Table('AIAttrs.FX', '选择可修复的项目', this.SelectAttrs, true, this.GenerFX);

      this.AddBlank('Icon', '增加图标', '给每个控件设置icon图标.');
      this.Table('Icon.Save', '选择可设置的字段图标', this.SelectAttrs, true, this.GenerIcon);

      this.AddBlank('Test', '测试数据', '为了方便测试，通过AI自动生成测试数据.');
      this.Table('Test.Save', '存储', this.SelectAttrs, true, this.GenerTest);

      this.AddGroup('Z', 'AI表单(从表)'); //增加分组.
      // const dtlWord = `请列出 ${md.Name} 的从表. `;

      this.AddBlank('Dtl', '输入提示词', '为了方便测试，通过AI自动生成测试数据.');
      // this.TextArea('Dtl', '输入提示词', this.WordAlert, '提示词', dtlWord, '请点击帮助参考如何输入提示词?');
      this.Table('Dtl.SelectedDtls', '选择从表', this.SelectAttrs, false, this.GenerDtls);
      this.Table('Dtl.SelectedDtls.Attrs', '选择字段', this.SelectAttrs, true, this.GenerDtlAttrs);

      this.AddGroup('B', '提示词参考'); //增加分组.
      this.TextArea('Demo1', '车辆表单', this.WordAlert, '提示词', this.AlertCar, '请点击帮助参考如何输入提示词?');
      this.Table('Demo1.SelectedAttrs', '选择字段', this.SelectAttrs, true, this.GenerAttrs);

      this.TextArea('Demo2', '员工信息表', this.WordAlert, '提示词', this.AlertEmp, '请点击帮助参考如何输入提示词?');
      this.Table('Demo2.SelectedAttrs', '选择字段', this.SelectAttrs, true, this.GenerAttrs);

      this.TextArea('Demo3', '请假单', this.WordAlert, '提示词', this.AlertQingJia, '请点击帮助参考如何输入提示词?');
      this.Table('Demo3.SelectedAttrs', '选择字段', this.SelectAttrs, true, this.GenerAttrs);
    }

    if (from == 'Code') {
      this.AddGroup('F', '实体生成代码'); //增加分组.
      // this.AddBlank('CodeTS', '生成TS代码', '把当前表单生成TSEntity代码.');
      this.AddBlank('CodeTSHand', '生成TS高代码', '把当前表单生成TS实体代码.', 'icon-drop');
      this.TextArea('CodeTSHand.Code', '预览', '把当前表单生成TS实体代码.', '代码模板', this.GenerCodeTS2024);

      // this.TextArea('CodeTS', '生成TS代码', '把当前表单生成TS实体代码.', '代码模板', tsCode);
      // this.TextArea('CodeTS.review', '代码预览', '把当前表单生成TSEntity代码.', '代码模板', this.GenerCodeTS);

      // this.AddBlank('CodeCSharp', '生成C#代码', '把当前表单生成C#实体代码.');

      this.TextArea('CodeCSharp', '生成C#代码', '把当前表单生成C#实体代码.', '代码模板', this.csCode);
      this.TextArea('CodeCSharp.review', '代码预览', '把当前表单生成TSEntity代码.', '代码模板', this.GenerCodeCS);

      // this.AddBlank('CodeJava', '生成Java代码', '把当前表单生成Java实体代码.');
      this.TextArea('CodeJava', '生成Java代码', '把当前表单生成Java实体代码.', '代码模板', this.javaCode);
      this.TextArea('CodeJava.review', '代码预览', '把当前表单生成TSEntity代码.', '代码模板', this.GenerCodeJava);
    }
  }

  public async GenerTest() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
    handler.AddPara('FrmID', this.RequestVal('FrmID'));
    const data: any = await handler.DoMethodReturnJson('AiFrm_TestDBGener');
    return JSON.stringify(data);
  }

  public async GenerBatchAttrs() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
    handler.AddPara('FrmID', this.RequestVal('FrmID'));
    const val = this.RequestVal('tb1', 'BatchAddAttrs');
    handler.AddPara('Words', val);
    const data: any = await handler.DoMethodReturnJson('AiFrm_GenerBatchAttrs');
    return JSON.stringify(data);
  }

  public async GenerAttrs() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
    handler.AddPara('FrmID', this.RequestVal('FrmID'));

    let val = this.RequestVal('tb1', 'AIFrm');
    if (val == null || val == undefined || val == '') val = this.RequestVal('tb1', 'Demo1');
    if (val == null || val == undefined || val == '') val = this.RequestVal('tb1', 'Demo2');
    if (val == null || val == undefined || val == '') val = this.RequestVal('tb1', 'Demo3');

    handler.AddPara('Words', val);
    const data: any = await handler.DoMethodReturnJson('AiFrm_GenerAttrs');
    return JSON.stringify(data);
  }
  public async GenerFX() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
    handler.AddPara('FrmID', this.RequestVal('FrmID'));
    handler.AddPara('Words', this.RequestVal('tb1', 'AIAttrs')); //检查要求.
    const data: any = await handler.DoMethodReturnJson('CheckFrm_GenerFX');
    return JSON.stringify(data);
  }

  //生成从表.
  public async GenerDtls() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
    handler.AddPara('FrmID', this.RequestVal('FrmID'));
    handler.AddPara('Words', this.RequestVal('tb1', 'Dtl'));
    const data: any = await handler.DoMethodReturnJson('AiFrm_DtlsGener');
    return JSON.stringify(data);
  }

  //生成从表的字段.
  public async GenerDtlAttrs() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
    handler.AddPara('FrmID', this.RequestVal('FrmID'));
    handler.AddPara('DtlID', this.RequestVal('tb1', 'Dtl.SelectedDtls'));
    const data: any = await handler.DoMethodReturnJson('AiFrm_DtlAttrs');
    return JSON.stringify(data);
  }

  public async GenerIcon() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
    handler.AddPara('FrmID', this.RequestVal('FrmID'));
    handler.AddPara('Words', this.RequestVal('tb1', 'Icon'));

    const data: any = await handler.DoMethodReturnJson('AiFrm_IconGener');
    return JSON.stringify(data);
  }

  public async GenerCodeTS2024() {
    const md = new MapData();
    md.No = this.RequestVal('FrmID');
    await md.Retrieve();

    const mapAttrs = new MapAttrs();
    await mapAttrs.Retrieve('FK_MapData', md.No, 'Idx');
    const gfs = new GroupFields();
    await gfs.Retrieve('FrmID', md.No, 'Idx');
    let attrs = '';
    for (let index = 0; index < gfs.length; index++) {
      const gf = gfs[index];
      attrs += " \t\n map.AddGroupAttr('" + gf.Lab + "'); ";
      for (let idx = 0; idx < mapAttrs.length; idx++) {
        const mapAttr = mapAttrs[idx];
        if (mapAttr.GroupID != gf.OID) continue;

        let isEnable = 'false';
        if (mapAttr.UIIsEnable == 1) isEnable = 'true';
        let UIVisible = 'false';
        if (mapAttr.UIIsEnable == 1) UIVisible = 'true';
        let UIIsLine = 'false';
        if (mapAttr.UIIsLine == 1) UIIsLine = 'true';

        if (mapAttr.KeyOfEn == 'OID') {
          attrs += '\t\n map.AddTBIntPKOID(); ';
          continue;
        }
        if (mapAttr.KeyOfEn == 'No') {
          attrs += `\t\n map.AddTBStringPK('${mapAttr.KeyOfEn}', null, '${mapAttr.Name}', ${isEnable}, ${UIVisible}, ${mapAttr.MinLen}, ${mapAttr.MaxLen},${mapAttr.UIWidth},${UIIsLine} );`;
          continue;
        }

        // boolen类型
        if (mapAttr.MyDataType == DataType.AppBoolean) {
          attrs += `\t\n map.AddBoolean('${mapAttr.KeyOfEn}',false, '${mapAttr.Name}',  ${isEnable}, ${UIVisible}, ${UIIsLine});`;
          continue;
        }

        if (mapAttr.UIContralType == UIContralType.AthShow) {
          attrs += `\t\n map.AddAthSingle('${mapAttr.KeyOfEn}', '${mapAttr.Name}', true,false,'*.*'}); `;
          continue;
        }

        // 外键,外部数据源.
        if (mapAttr.UIContralType == 1 && mapAttr.MyDataType == DataType.AppString) {
          const sftable = new SFTable();
          sftable.No = mapAttr.UIBindKey;
          await sftable.Retrieve();
          attrs += `\t\n  map.AddDDLSQL('${mapAttr.KeyOfEn}', null, '${mapAttr.Name}', '${sftable.SelectStatement}', ${isEnable}); `;
          continue;
        }

        // 输出普通string字段
        if (mapAttr.UIContralType == 0 && mapAttr.MyDataType == DataType.AppString && !mapAttr.UIBindKey) {
          attrs += `\t\n map.AddTBString('${mapAttr.KeyOfEn}', null, '${mapAttr.Name}', ${isEnable}, ${UIVisible}, ${mapAttr.MinLen}, ${mapAttr.MaxLen},${mapAttr.UIWidth},${UIIsLine});`;
          continue;
        }
        // 输出普通int字段
        if (mapAttr.UIContralType == 0 && mapAttr.MyDataType == DataType.AppInt) {
          attrs += `\t\n map.AddTBInt('${mapAttr.KeyOfEn}', 0, '${mapAttr.Name}',  ${isEnable}, ${UIVisible});`;
          continue;
        }
        // 输出普通float字段
        if (mapAttr.UIContralType == 0 && mapAttr.MyDataType == DataType.AppFloat) {
          attrs += `\t\n map.AddTBFloat('${mapAttr.KeyOfEn}', 0, '${mapAttr.Name}',  ${isEnable}, ${UIVisible});`;
          continue;
        }

        // 输出普通Money字段
        if (mapAttr.UIContralType == 0 && mapAttr.MyDataType == DataType.AppMoney) {
          attrs += `\t\n map.AddTBMoney('${mapAttr.KeyOfEn}', 0, '${mapAttr.Name}',  ${isEnable}, ${UIVisible});`;
          continue;
        }
        // 输出日期字段
        if (mapAttr.MyDataType == DataType.AppDate) {
          attrs += `\t\n map.AddTBDate('${mapAttr.KeyOfEn}', null, '${mapAttr.Name}',  ${isEnable}, ${UIVisible});`;
          continue;
        }

        if (mapAttr.MyDataType == DataType.AppDateTime) {
          attrs += `\t\n map.AddTBDateTime('${mapAttr.KeyOfEn}', null, '${mapAttr.Name}',  ${isEnable}, ${UIVisible});`;
          continue;
        }

        // 输出枚举字段.
        if (mapAttr.LGType == 1) {
          const en = new SysEnumMain(mapAttr.UIBindKey);
          const num = await en.RetrieveFromDBSources();
          if (num == 1) attrs += `\t\n  map.AddDDLSysEnum('${mapAttr.KeyOfEn}', 0, '${mapAttr.Name}',  ${isEnable}, ${UIVisible}, '${mapAttr.UIBindKey}', '${en.CfgVal}');`;
          else attrs += `\t\n map.AddDDLSysEnum('${mapAttr.KeyOfEn}', 0, '${mapAttr.Name}',  ${isEnable}, ${UIVisible}, '${mapAttr.UIBindKey}', '');`;
          continue;
        }

        //没有判断的都是string.
        attrs += `\t\n map.AddTBString('${mapAttr.KeyOfEn}', null, '${mapAttr.Name}', ${isEnable}, ${UIVisible}, ${mapAttr.MinLen}, ${mapAttr.MaxLen},${mapAttr.UIWidth},${UIIsLine});`;
        //attrs += "map.AddGroupAttr('" + gf.Lab + "'); ";
        //attrs += '';
      }
    }

    const strs = `
    import { EntitiesOID, EntityOID } from '/@/bp/en/EntityOID';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
     /** ${md.Name} **/
export class ${md.No} extends EntityOID {
  constructor(pkval?: string) {
   super('TS.Demo.${md.No}');
   if (!!pkval) this.setPKVal(pkval);
 }
//实体的权限控制
public override get HisUAC() {
  const uac = new UAC();
  uac.OpenForAdmin();
 // if (1==2) {
  //  uac.IsDelete = true;
   // uac.IsUpdate = true;
   // uac.IsInsert = true;
 // } 
  return uac;
}
  public override get EnMap() {
    const map = new Map('${md.PTable}', '${md.Name}');
     map.CodeStruct = '3';
     map.GroupBarShowModel = 1;
       ${attrs}
     this._enMap = map;
    return this._enMap;
    }
  }
     /** ${md.Name} **/
  export class ${md.No}s extends EntitiesOID {
    get GetNewEntity(): EntityOID {
      return new ${md.No}();
    }
    constructor() {
      super();
    }
  }`;

    return strs;
  }

  public async GenerCodeTS() {
    const codeformat = 'javascript';
    const words = this.RequestVal('tb1', 'CodeTS');
    console.log('codeformat: ', codeformat);

    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
    handler.AddPara('FrmID', this.RequestVal('FrmID'));

    handler.AddPara('Words', words);
    handler.AddPara('code', codeformat);
    const data: any = await handler.DoMethodReturnString('CodeGener_Save');
    return data;
  }

  public async GenerCodeCS() {
    const codeformat = 'csharp';
    const words = this.RequestVal('tb1', 'CodeCS');
    console.log('codeformat: ', codeformat);

    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
    handler.AddPara('FrmID', this.RequestVal('FrmID'));

    handler.AddPara('Words', words);
    handler.AddPara('code', codeformat);
    const data: any = await handler.DoMethodReturnString('CodeGener_Save');
    return data;
    // return JSON.stringify(data);
  }

  public async GenerCodeJava() {
    const codeformat = 'java';
    const words = this.RequestVal('tb1', 'CodeJava');
    console.log('codeformat: ', codeformat);

    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
    handler.AddPara('FrmID', this.RequestVal('FrmID'));

    handler.AddPara('Words', words);
    handler.AddPara('code', codeformat);
    const data: any = await handler.DoMethodReturnString('CodeGener_Save');
    return data;
  }

  public async GenerCode() {
    console.log('CurrPageNo: ', this.PageTitle, this.SubPages);

    let codeformat = 'javascript';
    let val = this.RequestVal('tb1', 'CodeTS');

    let words = val;
    if (val != null && val != undefined && val != '') {
      codeformat = 'csharp';
      words = val;
    }

    val = this.RequestVal('tb1', 'CodeCSharp');
    if (val != null && val != undefined && val != '') {
      codeformat = 'csharp';
      words = val;
    }
    val = this.RequestVal('tb1', 'CodeJava');
    if (val != null && val != undefined && val != '') {
      codeformat = 'java';
      words = val;
    }
    console.log('codeformat: ', codeformat);

    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
    handler.AddPara('FrmID', this.RequestVal('FrmID'));

    console.log('codetemplate: ', words);

    handler.AddPara('Words', words);
    handler.AddPara('code', codeformat);
    const data: any = await handler.DoMethodReturnString('CodeGener_Save');
    return JSON.stringify(data);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  // 假设你有一个 HTML 按钮元素
  // <button id="copyToClipboard">复制到剪贴板</button>

  public override async Save_TextBox_X(_pageNo: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
   // debugger;
    if (_pageNo.includes('CodeTSHand') == true) {
      return new GPNReturnObj(GPNReturnType.Message, '已经生成成功了，请把copy到您代码里.');
    }

    if (_pageNo.includes('SelectedAttrs')) {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
      handler.AddPara('FrmID', this.RequestVal('FrmID'));
      handler.AddPara('SelectedAttrs', _tb1);

      //是否是从批处理取值?
      const isBatch = this.RequestVal('tb1', 'BatchAddAttrs');
      if (isBatch != null && isBatch.length > 0) handler.AddPara('AttrsFromType', 'FrmAttrBatch');

      const data: any = await handler.DoMethodReturnString('AiFrm_SaveAttrs');

      Events.emit('reloadForm');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, data);
    }

    // if (_pageNo.includes('CodeTS')) {
    //   console.log("In CodeTS")

    //   const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
    //   handler.AddPara('FrmID', this.RequestVal('FrmID'));

    //   const w = this.RequestVal('tb1', 'CodeTS')
    //   console.log("codetemplate: ", w)

    //   handler.AddPara('Words', w);
    //   handler.AddPara('code', 'javascript');
    //   const data: any = await handler.DoMethodReturnString('CodeGener_Save');
    //   return new GPNReturnObj(GPNReturnType.CloseAndReload, data);
    // }
    //选择从表字段
    if (_pageNo.includes('Dtl.SelectedDtls.Attrs')) {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
      handler.AddPara('FrmID', this.RequestVal('FrmID'));
      handler.AddPara('DtlID', this.RequestVal('tb1', 'Dtl.SelectedDtls'));
      handler.AddPara('SelectedAttrs', _tb1);

      const data: any = await handler.DoMethodReturnString('AiFrm_DtlSaveAttrs');
      Events.emit('reloadForm');
      return new GPNReturnObj(GPNReturnType.CloseAndReload, data);
    }

    //字段优化.
    if (_pageNo.includes('AIAttrs.FX')) {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
      handler.AddPara('FrmID', this.RequestVal('FrmID'));
      handler.AddPara('Vals', _tb1);
      const data: any = await handler.DoMethodReturnString('CheckFrm_GenerSave');
      Events.emit('reloadForm');

      return new GPNReturnObj(GPNReturnType.CloseAndReload, data);
    }

    //保存测试数据.
    if (_pageNo.includes('Test.Save')) {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
      handler.AddPara('FrmID', this.RequestVal('FrmID'));
      handler.AddPara('Vals', _tb1);
      const data: any = await handler.DoMethodReturnString('AiFrm_TestDBSave');
      Events.emit('reloadForm');

      return new GPNReturnObj(GPNReturnType.CloseAndReload, data);
    }

    //图标保存.
    if (_pageNo.includes('Icon.Save')) {
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_AI');
      handler.AddPara('FrmID', this.RequestVal('FrmID'));
      handler.AddPara('Vals', _tb1);
      const data: any = await handler.DoMethodReturnString('AiFrm_IconSave');
      Events.emit('reloadForm');

      return new GPNReturnObj(GPNReturnType.CloseAndReload, data);
    }

    //上传文件解析表单.
    if (_pageNo == 'File') {
      alert('开发中.');
      const handler = new HttpHandler('BP.WF.HttpHandler.Admin_AI');
      handler.AddFile(this.UploadFile);
      handler.AddPara('FlowNo', this.RequestVal('FrmID'));
      let data = await handler.DoMethodReturnString('AiFrm_File');
      if (typeof data === 'string') {
        if (data.includes('@')) {
          data = data.split('@').join('\n');
        }
      }
      Events.emit('reloadForm');
      return new GPNReturnObj(GPNReturnType.Message, data);
    }
  }
  public readonly Test = `
  #### 说明
  - 为了方便测试，通过AI自动生成测试数据.
  - 用于调试，饼图、柱状图、折线图等操作.
    `;

  public readonly AlertCar = `
    我要做一个车辆管理表单。
    基础信息包含车辆编号，名称，车牌号、车辆类型(轿车、工程车、清洁车)等基础字段，请提供.
    从表有如下几个，请给出每个从表的字段。
    车辆配件：
    维修记录：
    出车记录：
    `;

  public readonly AlertEmp = `
    我要做一个员工管理表单。
    基础信息包含，姓名，地址，电话，民族(汉族,回族,其他)，性别(女,男)，籍贯(山东，河北...), 备注，附件，概要说明。等基础字段，
    请提供其他的字段.
    从表有如下几个，请给出每个从表的字段。
    教育经历：
    工作经历：
    项目经历：
    `;
  public readonly AlertQingJia = `
    我要做一个员工请假单，请提供基础字段.
    `;

  // 新建string枚举
  public readonly WordAlert = `
  #### 帮助
  - 系统会根据您的提示词调用AI大模型，返回一个字段列表供您选择。
`;
  public readonly DescAIAttrs = `
  #### 帮助
  - 我们把字段交给AI，他能够帮助您分析出来该表单的字段关系，并列表让您确认，辅助您快速准确的完成表单设计。
  - 您可以输入其他的检查要求.
  #### 内置检查内容如下.
    1. 在数值类型的字段里寻找：一个字段值是通过其他字段值通过表达式计算得来. 比如: 合计=单价*数量
    2. 在日期字段里寻找：日期字段不能输入历史日期. 
    3. 在日期字段里寻找：一个日字段大于等于另外一个日期字段.
    4. 可以在字段上增加的正则表达式. 比如：手机号，邮件，地址.
    5. 根据枚举库：把文本类型配备枚举，采用模糊匹配的模式.
    6. 根据字典库：把文本类型配备外键或者外部数据源，采用模糊匹配的模式.
    7. 在日期类型与数值类型的字段中寻找，数值=日期1-日期2 的规则. 
    8. 根据表单名称：在枚举库与字典库里寻找那些字段没有被补充上给与提示.
    `;

  public readonly HelpFile = `
    #### 帮助
    - 请上传excel，word,表单图片文件，AI将会根据内容，自动生成内容.
  `;

  // 新建int枚举
  public readonly SelectAttrs = `
  #### 帮助
  - 系统根据提示词，生成如下字段.
  #### 数据存储
  - int类型的枚举值是常用的数据类型，ccfrom是格式化的存储到数据表里.
  - 创建一个int类型的字段，用于存储枚举的数据.
    `;

  public readonly MyIcons = `

    Simple Line Icons
    Font Awesome Icons
    Glyphicons
    
  icon-user
  icon-people
  icon-user-female
  icon-user-follow
  icon-user-following
  icon-user-unfollow
  icon-login
  icon-logout
  icon-emotsmile
  icon-phone
  icon-call-end
  icon-call-in
  icon-call-out
  icon-map
  icon-location-pin
  icon-direction
  icon-directions
  icon-compass
  icon-layers
  icon-menu
  icon-list
  icon-options-vertical
  icon-options
  icon-arrow-down
  icon-arrow-left
  icon-arrow-right
  icon-arrow-up
  icon-arrow-up-circle
  icon-arrow-left-circle
  icon-arrow-right-circle
  icon-arrow-down-circle
  icon-check
  icon-clock
  icon-plus
  icon-minus
  icon-close
  icon-event
  icon-exclamation
  icon-organization
  icon-trophy
  icon-screen-smartphone
  icon-screen-desktop
  icon-plane
  icon-notebook
  icon-mustache
  icon-mouse
  icon-magnet
  icon-energy
  icon-disc
  icon-cursor
  icon-cursor-move
  icon-crop
  icon-chemistry
  icon-speedometer
  icon-shield
  icon-screen-tablet
  icon-magic-wand
  icon-hourglass
  icon-graduation
  icon-ghost
  icon-game-controller
  icon-fire
  icon-eyeglass
  icon-envelope-open
  icon-envelope-letter
  icon-bell
  icon-badge
  icon-anchor
  icon-wallet
  icon-vector
  icon-speech
  icon-puzzle
  icon-printer
  icon-present
  icon-playlist
  icon-pin
  icon-picture
  icon-handbag
  icon-globe-alt
  icon-globe
  icon-folder-alt
  icon-folder
  icon-film
  icon-feed
  icon-drop
  icon-drawer
  icon-docs
  icon-doc
  icon-diamond
  icon-cup
  icon-calculator
  icon-bubbles
  icon-briefcase
  icon-book-open
  icon-basket-loaded
  icon-basket
  icon-bag
  icon-action-undo
  icon-action-redo
  icon-wrench
  icon-umbrella
  icon-trash
  icon-tag
  icon-support
  icon-frame
  icon-size-fullscreen
  icon-size-actual
  icon-shuffle
  icon-share-alt
  icon-share
  icon-rocket
  icon-question
  icon-pie-chart
  icon-pencil
  icon-note
  icon-loop
  icon-home
  icon-grid
  icon-graph
  icon-microphone
  icon-music-tone-alt
  icon-music-tone
  icon-earphones-alt
  icon-earphones
  icon-equalizer
  icon-like
  icon-dislike
  icon-control-start
  icon-control-rewind
  icon-control-play
  icon-control-pause
  icon-control-forward
  icon-control-end
  icon-volume-1
  icon-volume-2
  icon-volume-off
  icon-calendar
  icon-bulb
  icon-chart
  icon-ban
  icon-bubble
  icon-camrecorder
  icon-camera
  icon-cloud-download
  icon-cloud-upload
  icon-envelope
  icon-eye
  icon-flag
  icon-heart
  icon-info
  icon-key
  icon-link
  icon-lock
  icon-lock-open
  icon-magnifier
  icon-magnifier-add
  icon-magnifier-remove
  icon-paper-clip
  icon-paper-plane
  icon-power
  icon-refresh
  icon-reload
  icon-settings
  icon-star
  icon-symbol-female
  icon-symbol-male
  icon-target
  icon-credit-card
  icon-paypal
  icon-social-tumblr
  icon-social-twitter
  icon-social-facebook
  icon-social-instagram
  icon-social-linkedin
  icon-social-pinterest
  icon-social-github
  icon-social-google
  icon-social-reddit
  icon-social-skype
  icon-social-dribbble
  icon-social-behance
  icon-social-foursqare
  icon-social-soundcloud
  icon-social-spotify
  icon-social-stumbleupon
  icon-social-youtube
  icon-social-dropbox
  icon-social-vkontakte
  icon-social-steam 
    `;

  public readonly tsCode = `
    /// <summary>
    /// 节点权限组 属性
    /// </summary>
    import { UAC } from '/@/bp/en/Map/UAC';
    import { Map } from '/@/bp/en/Map/Map';
    import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
    
    //节点权限组属性.
    export class NodeTeamAttr {
      public static readonly FK_Node = 'FK_Node';
      public static readonly FK_Team = 'FK_Team';
    }
    
    /// <summary>
    /// 节点权限组
    /// </summary>
    export class NodeTeam extends EntityMyPK {
      constructor(mypk?: string) {
        super('TS.WF.Template.NodeTeam');
        if (!!mypk) {
          this.MyPK = mypk;
        }
      }
    
      //实体的权限控制
      public override get HisUAC() {
        const uac = new UAC();
        uac.IsDelete = true;
        uac.IsUpdate = true;
        uac.IsInsert = true;
        return uac;
      }
    
      public override get EnMap() {
        // if (this._enMap != null)
        //   return this._enMap;
        const map = new Map('WF_NodeTeam', '节点权限组');
        map.AddMyPK();
    
        map.AddTBInt(NodeTeamAttr.FK_Node, 0, '节点ID', true, false);
        map.AddTBString(NodeTeamAttr.FK_Team, null, '权限组', true, false, 0, 50, 200);
    
        this._enMap = map;
        return this._enMap;
      }
    }
    
    //节点权限组s
    export class NodeTeams extends EntitiesMyPK {
      get GetNewEntity(): EntityMyPK {
        return new NodeTeam();
      }
    
      constructor() {
        super();
      }
    }
    `;
  public readonly csCode = `
            public override Map EnMap
            {
                get
                {
                    if (this._enMap != null)
                        return this._enMap;
    
                    Map map = new Map("Port_DeptEmp", "部门人员信息");
                    map.IndexField = DeptEmpAttr.FK_Dept;
    
                    map.AddMyPK();
                    map.AddTBString(DeptEmpAttr.FK_Dept, null, "部门", false, false, 1, 50, 1);
                    map.AddDDLEntities(DeptEmpAttr.FK_Emp, null, "操作员", new BP.Port.Emps(), false);
                    map.AddTBString(DeptEmpAttr.OrgNo, null, "组织编码", false, false, 0, 50, 50);
    
                    this._enMap = map;
                    return this._enMap;
                }
            }`;
  public readonly javaCode = `package bp.port;
    
    import bp.da.*;
    import bp.en.*; import bp.en.Map;
    import bp.en.Map;
    
    /** 
     部门人员信息 的摘要说明。
    */
    public class DeptEmp extends EntityMyPK
    {
    
        ///#region 基本属性
      /** 
       UI界面上的访问控制
      */
      @Override
      public UAC getHisUAC()
      {
        UAC uac = new UAC();
        uac.OpenForSysAdmin();
        return uac;
      }
      /** 
       人员
      */
      public final String getEmpNo()  {
        return this.GetValStringByKey(DeptEmpAttr.FK_Emp);
      }
      public final void setEmpNo(String value) throws Exception
      {
        SetValByKey(DeptEmpAttr.FK_Emp, value);
        this.setMyPK(this.getDeptNo() + "_" + this.getEmpNo());
      }
      /** 
       部门
      */
      public final String getDeptNo()  {
        return this.GetValStringByKey(DeptEmpAttr.FK_Dept);
      }
      public final void setDeptNo(String value) throws Exception
      {
        SetValByKey(DeptEmpAttr.FK_Dept, value);
        this.setMyPK(this.getDeptNo() + "_" + this.getEmpNo());
      }
      public final String getOrgNo()  {
        return this.GetValStringByKey(DeptEmpAttr.OrgNo);
      }
      public final void setOrgNo(String value) throws Exception
      {
        SetValByKey(DeptEmpAttr.OrgNo, value);
      }
      public final String getStationNo()  {
        return this.GetValStringByKey(DeptEmpAttr.StationNo);
      }
      public final void setStationNo(String value) throws Exception
      {
        SetValByKey(DeptEmpAttr.StationNo, value);
      }
      public final String getStationNoT()  {
        return this.GetValStringByKey(DeptEmpAttr.StationNoT);
      }
      public final void setStationNoT(String value) throws Exception
      {
        SetValByKey(DeptEmpAttr.StationNoT, value);
      }
      public final String getDeptName()  {
        return this.GetValStringByKey(DeptEmpAttr.DeptName);
      }
      public final void setDeptName(String value) throws Exception
      {
        SetValByKey(DeptEmpAttr.DeptName, value);
      }
        ///#endregion
    
        ///#region 构造函数
      /** 
       工作部门人员信息
      */
      public DeptEmp()
      {
      }
      /**
       * 重写基类方法
       */
      @Override
      public Map getEnMap()
      {
        if (this.get_enMap() != null)
          return this.get_enMap();
    
        Map map = new Map("Port_DeptEmp", "部门人员信息");
        map.IndexField = DeptEmpAttr.FK_Dept;
    
        map.AddMyPK();
        map.AddTBString(DeptEmpAttr.FK_Dept, null, "部门", false, false, 1, 50, 1);
        map.AddDDLEntities(DeptEmpAttr.FK_Emp, null, "操作员", new bp.port.Emps(), false);
        map.AddTBString(DeptEmpAttr.OrgNo, null, "组织编码", false, false, 0, 50, 50);
    
        //For Vue3版本.
        map.AddTBString(DeptEmpAttr.DeptName, null, "部门名称(Vue3)", false, false, 0, 500, 36);
        map.AddTBString(DeptEmpAttr.StationNo, null, "岗位编号(Vue3)", false, false, 0, 500, 36);
        map.AddTBString(DeptEmpAttr.StationNoT, null, "岗位名称(Vue3)", false, false, 0, 500, 36);
    
        this.set_enMap(map);
        return this.get_enMap();
      }
    
        ///#endregion
    
      @Override
      protected boolean beforeDelete() throws Exception
      {
        bp.sys.base.Glo.WriteUserLog("删除:" + this.ToJson(), "组织数据操作");
        return super.beforeDelete();
      }
      @Override
      protected boolean beforeInsert() throws Exception
      {
        bp.sys.base.Glo.WriteUserLog("新建:" + this.ToJson(), "组织数据操作");
        return super.beforeInsert();
      }
    
      @Override
      protected void afterDelete() throws Exception
      {
        DeptEmpStations des = new DeptEmpStations();
        des.Delete("FK_Dept", this.GetValByKey("FK_Dept"), "FK_Emp", this.GetValByKey("FK_Emp"));
        super.afterDelete();
      }
    
      /** 
       更新前做的事情
       
       @return 
      */
      @Override
      protected boolean beforeUpdateInsertAction() throws Exception
      {
        if (bp.difference.SystemConfig.getCCBPMRunModel() != bp.sys.CCBPMRunModel.Single && DataType.IsNullOrEmpty(this.getOrgNo()))
        {
          this.setOrgNo(bp.web.WebUser.getOrgNo());
        }
        if (DataType.IsNullOrEmpty(this.getMyPK()) == true)
        {
          if (bp.difference.SystemConfig.getCCBPMRunModel() == bp.sys.CCBPMRunModel.SAAS)
          {
            this.setMyPK(this.getDeptNo() + "_" + this.getEmpNo().replace(this.getOrgNo() + "_",""));
          }
          else
          {
            this.setMyPK(this.getDeptNo() + "_" + this.getEmpNo());
          }
        }
        return super.beforeUpdateInsertAction();
      }
    }
    `;
}
