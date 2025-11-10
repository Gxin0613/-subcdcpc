import { EntityNoName, EntitiesNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { DataType } from '/@/bp/en/DataType';
import WebUser from '/@/bp/web/WebUser';
import { DTSearchWay } from '/@/bp/en/Map/SearchNormal';
import { SubTablePosition } from '/@/bp/en/Config';
import { StudentScores } from '../StudentScore';

/** 学生主从表联动控制* */
export class StudentDtlExt extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.StudentDtlExt');
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
    const map = new Map('Demo_Student', '学生-从表');
    map.CodeStruct = '3';
    map.GroupBarShowModel = 1;
    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', true, true, 1, 100, 60); //如果设置自动编号字段必须是只读的.
    map.AddTBString('Name', null, '名称', true, false, 0, 200, 100);
    map.AddTBString('Class1Name', null, '学科1', true, false, 0, 200, 150, false);
    map.AddTBString('Class2Name', null, '学科2', true, false, 0, 200, 150);
    map.AddTBString('Class3Name', null, '学科3', true, false, 0, 200, 150);
    map.AddTBString('Class4Name', null, '学科4', true, false, 0, 200, 150);
    map.AddTBInt('Count', 18, '总分', true, false);
    map.AddTBString('Conclusion', null, '结论', true, true, 0, 200, 150);
    map.enMapExts.AddFieldChangeListener('Count', (val, row, _attrs) => {
      if (row.Count > 400) {
        row.Conclusion = '优秀'; // 成绩超过300分
      } else if (row.Count > 300) {
        row.Conclusion = '良好'; // 成绩超过200分
      } else if (row.Count > 240) {
        row.Conclusion = '及格'; // 成绩200分以下
      } else {
        row.Conclusion = '不及格'; // 成绩200分以下
      }
    });

    map.AddRM_DtlBatch(
      '成绩表',
      new StudentScores(),
      'StudentNo',
      '',
      '',
      'icon-people',
      {
        TableRowSelection: 'checkbox', // 配置选择行属性
        HideDefaultTitle: true,
        IgnoreErrorSave: true, // 忽略错误保存
      },
      SubTablePosition.Tab,
      0,
      400,
    );
    // 触发从表列名更新
    map.enMapExts.UpdateDtlColPrefix('Class1Name', '成绩表', 'Score1');
    map.enMapExts.UpdateDtlColPrefix('Class2Name', '成绩表', 'Score2');
    map.enMapExts.UpdateDtlColPrefix('Class3Name', '成绩表', 'Score3');
    map.enMapExts.UpdateDtlColPrefix('Class4Name', '成绩表', 'Score4');
    // end

    map.DTSearchLabel = '日期';
    map.DTSearchWay = DTSearchWay.ByDateRange;

    this._enMap = map;
    return this._enMap;
  }

  override async beforeDelete(): Promise<boolean> {
    //删除从表数据.
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

  override async beforeUpdateInsertAction(): Promise<boolean> {
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
export class StudentDtlExts extends EntitiesNoName {
  get GetNewEntity(): StudentDtlExt {
    return new StudentDtlExt();
  }
  constructor() {
    super();
  }
}
