import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';

/** 学生 **/
export class StudentFlowComponent extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.StudentFlowComponent');
    if (!!pkval) this.setPKVal(pkval);
  }

  public override get HisUAC() {
    const uac = new UAC();
    uac.OpenForAdmin();
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Demo_Student', '学生-流程与组件');
    map.CodeStruct = '4';
    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', true, true, 4, 4, 60); //如果设置自动编号字段必须是只读的.
    map.AddTBString('Name', null, '名称', true, false, 0, 200, 100);
    map.AddTBString('Addr', null, '地址', true, false, 1, 200, 190, true);
    map.AddRadioBtn('XB', 0, '性别', true, true, 'XB', '@0=女@1=男@2=未知', '单选按钮', false);
    map.AddTBInt('Age', 18, '年龄', true, false);
    map.AddTBFloat('SG', 102, '身高cm', true, false);
    map.AddTBString('Tel', null, '电话', true, false, 0, 200, 150);
    map.AddTBString('Email', null, '邮件', true, false, 0, 200, 150);
    map.AddDDLSysEnum('ZZMM', 0, '政治面貌', true, true, 'ZZMM', '@0=少先队员@1=团员@2=党员@3=无党派人士@4=群众@5=其他');

    map.AddGroupAttr('其他信息');
    map.AddBoolean('IsDuShengZi', false, '是否是独生子？', true, true, true);
    map.AddBoolean('IsTeKunSheng', false, '是否是特困生？', true, true);
    map.AddBoolean('IsPianYuanShanQu', false, '是否偏远山区？', true, false);

    map.AddTBInt('WorkIDOf058', 18, '058宿主流程', false, false);

    //组件.
    map.AddGroupMethod('常用组件');
    map.AddRM_Commpent_BBS('评论组件', 'icon-people');
    map.AddRM_Commpent_Track('日志组件', 'icon-people');
    //   map.AddRM_PrintRTF('rtf格式模板打印', 'DataUser\\xx', 'pdf', 'icon-printer');
    //   map.AddRM_Commpent_QRTrack('日志组件', 'icon-people'); //QR组件 @lyc

    map.AddGroupMethod('流程操作', 'icon-people');
    // 重要! 保存表单字段和当前实体字段的关联
    const fieldMap = new globalThis.Map<string, string>([
      ['StuNo', 'No'],
      ['StuName', 'Name'],
      ['Tel', 'Tel'],
      ['Addr', 'Addr'],
    ]);
    map.AddRM_SearchFlow('请假流程(综合查询)', '058', '', fieldMap, 'icon-home'); //打开的 SearchFlow.vue
    map.AddRM_StartFlow('启动请假流程', '058', '', fieldMap, 'icon-paper-plane'); //打开的MyView.vue
    // map.AddRM_StartHostFlow('入学申请(宿主流程)', '058', '', fieldMap, 'icon-paper-plane'); //打开的MyView.vue
    this._enMap = map;
    return this._enMap;
  }
}
/**
 * 学生列表
 */
export class StudentFlowComponents extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new StudentFlowComponent();
  }
  constructor() {
    super();
  }
}
