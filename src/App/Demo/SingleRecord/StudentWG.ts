import { EntityNoName, EntitiesNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { DataType } from '/@/bp/en/DataType';
import WebUser from '/@/bp/web/WebUser';
import { GloWF } from '/@/WF/Admin/GloWF';
import { WGEntity_StudentWG } from '../WGEntity_StudentWG';

/** 学生 **/
export class StudentWG extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.StudentWG');
    if (!!pkval) this.setPKVal(pkval);
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
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
    const map = new Map('Demo_Student', '学生-外挂');
    map.CodeStruct = '3';
    map.GroupBarShowModel = 1;
    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', true, true, 1, 100, 60); //如果设置自动编号字段必须是只读的.
    map.AddTBString('Name', null, '名称', true, false, 0, 200, 100);
    map.AddTBString('Addr', null, '地址', true, false, 1, 200, 190, true);
    map.AddTBInt('Age', 18, '年龄', true, false);
    map.AddTBFloat('SG', 102, '身高cm', true, false);
    map.AddTBString('Dept', null, '部门', true, false, 0, 200, 150);
    map.SetPopTree('Dept', GloWF.srcDeptLazily, '0', true, '600px', '800px', '选择部门', 'icon-people', false, true);

    map.enMapExts.AddFieldChangeListener('Dept', (val, row, attrs) => {
      console.log({ val, row, attrs });
    });
    //枚举字段:
    map.AddRadioBtn('XB', 0, '性别', true, true, 'XB', '@0=女@1=男@2=未知', '单选按钮', false);

    map.AddDDLSysEnum('ZZMM', 0, '政治面貌', true, true, 'ZZMM', '@0=少先队员@1=团员@2=党员@3=无党派人士@4=群众@5=WEIZHI');
    map.AddTBString('Tel', null, '电话', true, false, 0, 200, 150);
    map.AddTBString('Email', null, '邮件', true, false, 0, 200, 150);
    map.AddTBFloat('JinDu', 56, '进度', true, false);
    map.AddTBAtParas(3000); //@EnName=TS.XXX.AA@Key=xxxx

    map.AddSearchAttr('XB'); // int类型的枚举.
    map.AddSearchAttr('ZZMM'); //string类型的枚举值.
    // map.AddSearchAttr('ShengFen'); // 省份.
    // map.AddSearchAttr('City'); // 城市.
    this._enMap = map;
    return this._enMap;
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
  override GetRefExt() {
    return new WGEntity_StudentWG(this);
  }
}

/**
 * 学生s
 */
export class StudentWGs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new StudentWG();
  }
  constructor() {
    super();
  }
}
