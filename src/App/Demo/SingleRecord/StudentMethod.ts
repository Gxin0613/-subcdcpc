import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { GloWF } from '/@/WF/Admin/GloWF';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { message } from 'ant-design-vue';

/** 学生 **/
export class StudentMethod extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.StudentMethod');
    if (!!pkval) this.setPKVal(pkval);
  }

  public override get HisUAC() {
    const uac = new UAC();
    uac.OpenForAdmin();
    uac.IsUpdate = false;
    uac.IsDelete = false;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Demo_Student', '学生-方法执行');
    map.CodeStruct = '4';
    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', true, true, 4, 4, 60); //如果设置自动编号字段必须是只读的.
    map.AddTBString('Name', null, '名称', true, false, 0, 200, 100);
    map.AddDDLSysEnum('StuSta', 0, '状态', true, false, 'StuSta', '@0=正常@1=非正常@2=离校');
    map.AddTBInt('Age', 18, '年龄', true, false);
    map.AddTBFloat('SG', 102, '身高cm', true, false);
    map.AddTBString('Tel', null, '电话', true, false, 0, 200, 150);
    map.AddTBString('Email', null, '邮件', true, false, 0, 200, 150);

    map.AddGroupMethod('无参数方法');
    const rm = new RefMethod();
    rm.Title = '注销学籍';
    rm.ClassMethod = 'ZhuXiaoXueJi';
    rm.RefMethodType = RefMethodType.FuncToolbar;
    rm.Warning = '您确定要执行吗？';
    rm.IsCanBatch = false; //是否允许批处理，在Search.vue组件里.
    rm.IsForEns = false;
    map.AddRefMethod(rm);

    const rm00 = new RefMethod();
    rm00.Title = '执行方法打开Url';
    rm00.ClassMethod = 'DoOpenUrl';
    rm00.RefMethodType = RefMethodType.Func;
    rm00.Warning = '您确定要执行吗？';
    rm00.IsCanBatch = false; //是否允许批处理，在Search.vue组件里.
    rm00.IsForEns = false;
    map.AddRefMethod(rm00);

    map.AddGroupMethod('有参数方法');
    const rm2 = new RefMethod();
    rm2.Title = '缴纳班费';
    rm2.ClassMethod = 'JNBanFei';
    rm2.HisMap.AddTBString('note', null, '缴纳备注', true, false, 0, 100, 1000, true);
    rm2.HisMap.AddTBDecimal('jine', 0, '金额', true, false, true);
    rm2.IsCanBatch = true;
    map.AddRefMethod(rm2);

    const rm3 = new RefMethod();
    rm3.Title = '转(调)班';
    rm3.ClassMethod = 'Turn2BanJi';
    rm3.HisMap.AddTBString('BanJINo', null, '选择班级(输入)', true, false, 0, 100, 1000, true);
    //参数需要弹窗显示的解析
    rm3.HisMap.AddTBString('Addr', null, '地址(只读)', true, true, 0, 100, 1000, true);
    rm3.HisMap.AddTBString('Tel', null, '电话(不可见)', false, false, 0, 100, 1000, true);
    rm3.HisMap.AddTBString('BanJiPop', null, '选择班级(弹窗)', true, false, 0, 100, 1000, true);
    rm3.HisMap.AddTBString('EmpNo', null, '选人', true, true, 0, 100, 1000, true);
    rm3.HisMap.SetPopTreeEns(
      'EmpNo',
      GloWF.srcDeptLazily,
      GloWF.srcDeptRoot,
      `SELECT No,Name FROM Port_Emp where FK_Dept='@Key' `,
      'No',
      false,
      '800px',
      '600px',
      '选择人员',
      'icon-people',
      '0',
      true,
      true,
    );
    rm3.IsCanBatch = true;
    map.AddRefMethod(rm3);

    map.AddGroupMethod('帮助', 'icon-link');
    map.AddRM_HelpDocs(
      '帮助',
      'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=5816565&doc_id=31094',
      'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=5816565&doc_id=31094',
      'icon-link',
    );

    this._enMap = map;
    return this._enMap;
  }

  public async DoOpenUrl() {
    alert('方法已经被执行.');
    return new GPNReturnObj(GPNReturnType.GoToUrl, 'https://ccflow.org/');
  }
  public async ZhuXiaoXueJi(): Promise<string> {
    // const url = '';
    // return new GPNReturnObj(GPNReturnType.GoToUrl, url);
    // return '执行成功';
    // alert('ssdsds');
    const handler = new HttpHandler('BP.App.Demo.Handler_Demo');
    handler.AddPara('No', this.No);
    handler.AddPara('Name', this.Name);
    // handler.AddFile
    return await handler.DoMethodReturnString('Student_ZhuXiaoXueJi');
    //return new GPNReturnObj(GPNReturnType.Close, '执行成功.');
  }

  public async Turn2BanJi(idByInput: string, readonlyAddr: string, hiddenAddt: string, idBySelect: string): Promise<string> {
    return `当前记录:[${this.No} - ${this.Name}] , 方法参数: [输入: ${idByInput}, 选择: ${idBySelect}, 只读: ${readonlyAddr}, 隐藏: ${hiddenAddt}]`;
  }

  public async DoEntityFunc(row) {
    // console.log({ row });
    message.info('实体方法:' + row);
  }

  public async JNBanFei(jine: number, note: string): Promise<string> {
    const handler = new HttpHandler('BP.App.Demo.Handler_Demo');
    handler.AddPara('No', this.No);
    handler.AddPara('Name', this.Name);
    handler.AddPara('Note', note);
    handler.AddPara('JE', jine);
    const msg = await handler.DoMethodReturnString('Student_JiaoNaXueFei');
    return msg;
  }
}

export class StudentMethods extends EntitiesNoName {
  get GetNewEntity(): StudentMethod {
    return new StudentMethod();
  }
  constructor() {
    super();
  }
}
