import { EntityNoName, EntitiesNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { DataType } from '/@/bp/en/DataType';
import WebUser from '/@/bp/web/WebUser';
import { GloWF } from '/@/WF/Admin/GloWF';
/** 学生* */
export class StudentPop extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.StudentPop');
    if (!!pkval) this.setPKVal(pkval);
  }

  public override get HisUAC() {
    const uac = new UAC();
    uac.OpenForAdmin();
    if (WebUser.No == 'admin') {
      uac.IsDelete = true;
      uac.IsUpdate = true;
      uac.IsInsert = true;
    } else {
      uac.IsDelete = true;
      uac.IsUpdate = true;
      uac.IsInsert = true;
    }
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Demo_Student', '学生-Pop弹窗');
    map.CodeStruct = '3';
    map.GroupBarShowModel = 1;

    map.AddGroupAttr('字段-基本字段');
    map.AddTBStringPK('No', null, '编号', true, true, 4, 4, 10); //如果设置自动编号字段必须是只读的.
    map.AddTBString('Name', null, '名称', true, false, 0, 200, 100);
    map.AddTBString('Addr', null, '地址', true, false, 1, 200, 190, true);
    map.AddTBInt('Age', 18, '年龄', true, false);
    map.AddTBFloat('SG', 102, '身高cm', true, false);
    map.AddTBString('Tel', null, '电话', true, false, 8, 50, 150);
    map.AddTBString('Email', null, '邮件', true, false, 5, 50, 150);

    map.AddGroupAttr('Pop弹窗');
    map.AddTBString('Dept', null, '部门PopTree', true, false, 0, 200, 150);
    map.SetPopTree('Dept', GloWF.srcDeptLazily, '0', true, '600px', '800px', '选择部门', 'icon-people', false, true);

    map.AddTBString('FZR', null, '负责人(TreeEns)', true, false, 0, 200, 100);
    map.SetPopTreeEns('FZR', GloWF.srcDeptLazily, '@WebUser.DeptNo', GloWF.srcEmpLazily, GloWF.srcEmpSearchKey, true, '800px', '600px', '负责人', 'icon-people', '1', true, true);

    //选择班级.
    map.AddBoolean('EnableBJs', true, '启用班级选择', true, true);
    map.AddTBString('BJs', null, '选班级表格弹窗(Table)', true, false, 0, 200, 200);
    // map.SetPopTable('BJs', 'Ens://TS.Demo.BanJi/No,Name,Tel,BZR/', false, '800px', '500px', '选择班级', 'icon-people', '1', '电话,班主任');
    map.SetPopTable(
      'BJs',
      (row: Recordable) => {
        if (row.FZR == '') return null;
        return `Ens://TS.Demo.BanJi/No,Name,Tel,BZR/`;
      }, // 这里传入方法实现动态加载sql
      false,
      '800px',
      '500px',
      '选择班级',
      'icon-people',
      '1',
      '电话,班主任',
    );
    // map.SetPopEns
    // 当启用班级选择时，BJs可编辑
    map.enMapExts.SetCascadeControl('EnableBJs', 'BJs', (val): boolean => {
      return val == '1';
    });
    map.enMapExts.AddFieldChangeListener('EnableBJs', (val, row, _attrs) => {
      const attr = _attrs.find((a) => a.Key === 'BJs');
      if (!attr) return;
      if (val == '0') {
        row.BJs = '';
        row.BJsT = '';
        attr.Tag = [];
      }
    });

    //选修科目.
    map.AddTBString('KeMuNos', null, '选修科目PopList', true, false, 0, 200, 100);
    // map.SetPopList('KeMuNos', 'Ens://TS.Demo.KeMu/No,Name/', true, '400px', '500px', '选择科目', 'icon-people');
    map.AddMapLoader(() => {
      map.SetPopDtlBatch('KeMuNos', 'TS.Demo.KeMu', '1200px', '700px', '选择选修科目', 'icon-people', '', '');
    });
    //Ens://TS.Demo.KeMus/No,Name/

    map.AddGroupAttr('Pop弹窗 - 填充');
    map.AddTBString('PopBanJi', null, '选择班级', true, false, 0, 200, 100);
    map.SetPopList('PopBanJi', 'Ens://TS.Demo.BanJi/No,Name/', false, '500', '600', '请选择班级'); //pop返回值.
    //Ens://TS.Demo.KeMus/No,Name/

    map.AddTBString('PopBZR', null, '班主任名称', true, true, 0, 200, 100);
    map.AddTBString('PopTel', null, '班主任电话', true, true, 0, 200, 100);
    map.enMapExts.SetAutoFillCtrls('PopBanJi', 'DemoStudent_Student_PopBanJiFull'); //填充.
    // En://TS.Demo.BanJi/BZR as PopBZR,Tel as PopTel/

    map.AddGroupAttr('文本框自动完成 - 填充');
    //数据填充. 返回一行多列, 必须有@Key关键字. 如果需要填充，需要as作为字段名
    map.AddTBString('TBBanJi', null, '输入班级', true, false, 0, 200, 100);
    map.SetHelperAlert('TBBanJi', '请输入年级名称，比如:1年级');
    map.enMapExts.SetTextBoxFull('TBBanJi', 'DemoStudent_Student_BanJiFind');
    // Ens://TS.Demo.BanJis/No,Name/

    map.AddTBString('TBBZR', null, '班主任名称', true, true, 0, 200, 100);
    map.AddTBString('TBTel', null, '班主任电话', true, true, 0, 200, 100);
    map.enMapExts.SetAutoFillCtrls('TBBanJi', `DemoStudent_Student_FullTBBanJi`);

    map.AddTBAtParas(3000);

    this._enMap = map;
    return this._enMap;
  }

  override async beforeDelete(): Promise<boolean> {
    // const attach_dbs = new FrmAttachmentDBs();
    // await attach_dbs.Delete('RefPKVal', this.No);
    return Promise.resolve(true);
  }

  override async beforeInsert(): Promise<boolean> {
    this.BirthDT = DataType.CurrentDateTime;
    //记录信息.
    this.RDT = DataType.CurrentDateTime;
    this.RecNo = WebUser.No;
    this.RecName = WebUser.Name;
    this.RecDeptNo = WebUser.DeptNo;
    this.RecDeptName = WebUser.DeptName;
    return Promise.resolve(true);
  }

  protected override afterUpdate(): Promise<boolean> {
    return Promise.resolve(true);
  }

  override async afterInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

/**
 * 学生s
 */
export class StudentPops extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new StudentPop();
  }
  constructor() {
    super();
  }
}
