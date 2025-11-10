import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { SubTablePosition } from '/@/bp/en/Config';
import { Resumes } from '../Resume';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

/** 学生* */
export class StudentPrinter extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.StudentPrinter');
    if (!!pkval) this.setPKVal(pkval);
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Demo_Student', '学生-打印');
    map.CodeStruct = '3';
    map.GroupBarShowModel = 1;
    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', true, true, 1, 100, 60); //如果设置自动编号字段必须是只读的.
    map.AddTBString('Name', null, '名称', true, false, 0, 200, 100);
    map.AddTBString('Addr', null, '地址', true, false, 1, 200, 190, true);
    map.AddTBInt('Age', 18, '年龄', true, false);
    map.AddRadioBtn('XB', 0, '性别', true, true, 'XB', '@0=女@1=男@2=未知', '单选按钮', false);
    map.AddDDLSysEnum('ZZMM', 0, '政治面貌', true, true, 'ZZMM', '@0=少先队员@1=团员@2=党员@3=无党派人士@4=群众@5=未知');
    map.AddTBString('Tel', null, '电话', true, false, 0, 200, 150);
    map.AddTBString('Email', null, '邮件', true, false, 0, 200, 150);

    map.AddGroupMethod('基础从表', 'icon-drop');
    map.AddRM_DtlBatch('教育经历(Batch)', new Resumes(), 'StudentNo', '', '', 'icon-people', '', SubTablePosition.Bottom);
    map.AddRM_HelpDocs('打印帮助', 'https://docs.qq.com/doc/DRHNQeE9tV3ZlVE11', '', 'icon-support');

    const rm = new RefMethod();
    rm.Title = '打印Rtf';
    rm.ClassMethod = 'Print_RTF';
    rm.RefMethodType = RefMethodType.FuncToolbar;
    rm.Warning = '您确定要执行吗？';
    rm.IsCanBatch = false; //是否允许批处理，在Search.vue组件里.
    rm.IsForEns = false;
    map.AddRefMethod(rm);

    // map.AddRM_PrintRTF('打印Rtf', '测试中1', 'doc', 'icon-printer');
    map.AddRM_PrintRTF('打印Excel', '测试中1', 'doc', 'icon-printer');
    map.AddRM_PrintRTF('打印Word', '测试中1', 'doc', 'icon-printer');

    this._enMap = map;
    return this._enMap;
  }

  public async Print_RTF() {
    const handler = new HttpHandler('BP.App.Demo.Handler_Demo');
    handler.AddPara('No', this.No);
    handler.AddPara('Name', this.Name);
    // handler.AddFile
    const data = await handler.DoMethodReturnString('Student_ZhuXiaoXueJi');
    return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, data);
  }
}
