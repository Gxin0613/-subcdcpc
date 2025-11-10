import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';

/** 学生 **/
export class StudentLink extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.StudentLink');
    if (!!pkval) this.setPKVal(pkval);
  }

  public override get HisUAC() {
    const uac = new UAC();
    uac.OpenForAdmin();
    uac.IsUpdate = true;
    uac.IsDelete = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Demo_Student', '学生-连接');
    map.CodeStruct = '4';
    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', true, true, 4, 4, 60); //如果设置自动编号字段必须是只读的.
    map.AddTBString('Name', null, '名称', true, false, 0, 200, 100);

    map.AddTBString('Addr', null, '地址(打开地图)', true, true, 1, 200, 190, true);
    map.SetFieldLink('Addr', `https://ccflow.org?No=@No&Name=@Name`);

    map.AddTBInt('IncomeWay', 0, '入学方式', true, false);
    const url1 = GloComm.UrlGPEExt('GPE_IncomeWay', '@No', '');
    map.SetFieldLink('IncomeWay', url1);

    map.AddTBFloat('SG', 102, '身高cm', true, false);
    map.AddTBString('Tel', null, '电话(启动电话)', true, true, 0, 200, 150);
    map.SetFieldLink('Tel', 'Tel:@Tel');

    map.AddTBString('Email', null, '邮件(发邮件)', true, true, 0, 200, 150);
    map.SetFieldLink('Email', 'mailto:@Email');

    map.AddLink('MyLink', '我的连接控件', 'http://ccflow.org', true, GPNReturnType.OpenIframeByDrawer50);

    map.AddGroupAttr('家庭信息');
    map.AddBoolean('IsDuShengZi', false, '是否是独生子？', true, true, true);
    map.AddBoolean('IsTeKunSheng', false, '是否是特困生？', true, true);
    map.AddBoolean('IsPianYuanShanQu', false, '是否偏远山区？', true, false);

    //组件.
    map.AddGroupMethod('连接', 'icon-link');
    map.AddRM_OpenIframeByTab('打开帮助(窗口内)', 'https://docs.qq.com/doc/DRGZzblhkdWlOZXFG', 'icon-link');
    map.AddRM_UrlLinkeWinOpen('打开帮助(新窗口)', 'https://docs.qq.com/doc/DRGZzblhkdWlOZXFG?1=1', 'icon-link');
    map.AddRM_UrlTabOpen('打开内部vue组件', '/@/App/Demo/Views/MyVueComp.vue', 'icon-link'); // 遵循标准import路径
    map.AddTBAtParas(3000);
    map.AddMapLoader(() => {
      if (this.GetValByKey('No') != '') {
        const openMapMethod = new RefMethod();
        const params = {
          Title: '打开地图',
          ClassMethod: 'openMap',
          RefMethodType: RefMethodType.FuncToolbar,
          IsCanBatch: false,
          IsForEns: true,
        };
        Object.assign(openMapMethod, params);
        map.AddRefMethod(openMapMethod);
      }
    });
    this._enMap = map;
    return this._enMap;
  }

  public openMap() {
    window.open(`https://amap.com`, '_blank');
    return 'open success';
  }
}

export class StudentLinks extends EntitiesNoName {
  get GetNewEntity(): StudentLink {
    return new StudentLink();
  }
  constructor() {
    super();
  }
}
