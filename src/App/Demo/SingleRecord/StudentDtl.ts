import { EntityNoName, EntitiesNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { DataType } from '/@/bp/en/DataType';
import WebUser from '/@/bp/web/WebUser';
import { Members } from '../Member';
import { DtlRelationConfig, SubTablePosition } from '/@/bp/en/Config';
import { Resumes } from '../Resume';
import { KaoHeDtls } from '../Kaohe/KaoHeDtl';
import { KeMus } from '../KeMu';
import { StudentKeMus } from '/@/App/Demo/StudentKeMu';
import { StudentCitys } from '/@/App/Demo/StudentCity';
import { ShengFens } from '/@/App/Demo/ShengFen';
import { Citys } from '/@/App/Demo/City';
import { StudentDepts } from '/@/App/Demo/StudentDept';
import { Depts } from '/@/bp/port/Dept';
import { StudentFZRs } from '/@/App/Demo/StudentFZR';
import { Emps } from '/@/bp/port/Emp';
import { KaoHeFixDtls } from '../Kaohe/KaoHeFixDtl';

/** 学生* */
export class StudentDtl extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.StudentDtl');
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
    map.AddTBString('Addr', null, '地址', true, false, 1, 200, 190, true);
    map.AddTBInt('Age', 18, '年龄', true, false);
    map.AddRadioBtn('XB', 0, '性别', true, true, 'XB', '@0=女@1=男@2=未知', '单选按钮', false);
    map.AddDDLSysEnum('ZZMM', 0, '政治面貌', true, true, 'ZZMM', '@0=少先队员@1=团员@2=党员@3=无党派人士@4=群众@5=未知');
    map.AddTBString('Tel', null, '电话', true, false, 0, 200, 150);
    map.AddTBString('Email', null, '邮件', true, false, 0, 200, 150);
    map.AddBoolean('IsDuShengZi', false, '独生子？', true, true);

    map.AddGroupMethod('基础从表', 'icon-drop');
    map.AddRM_DtlSearch('教育经历(Search)', new Resumes(), 'StudentNo', '', '', '', 'icon-people', true, '', SubTablePosition.Left);
    map.AddRM_DtlBatch('教育经历(Batch)', new Resumes(), 'StudentNo', '', '', 'icon-people', '', SubTablePosition.Left);
    // map.AddRM_DtlSearch(
    //   '成员查看',
    //   new Members(),
    //   'StudentNo',
    //   '',
    //   '',
    //   '',
    //   'icon-people',
    //   false,
    //   {
    //     TableRowSelection: 'none',
    //     DisableSearch: true, // 禁用搜索
    //   },
    //   SubTablePosition.Tab,
    //   400,
    // );

    // 从表配置项
    const dtlConf: DtlRelationConfig = {
      TableRowSelection: 'none', // 从表选择
      DisableSearch: true, // 禁用搜索
      HideDefaultTitle: true, // 隐藏默认标题
      IgnoreErrorSave: true, // 忽略错误保存
      SortColumns: undefined, // 排序字段
      EnableSorter: '0', // 是否启用前端排序，0-否，1-是
    };
    map.AddRM_DtlBatch('成员编辑', new Members(), 'StudentNo', '', '', 'icon-people', dtlConf, SubTablePosition.Tab, 0, 400);
    // map.AddRM_DtlSearch(
    //   '荣誉',
    //   new Honors(),
    //   'StudentNo',
    //   '',
    //   '',
    //   '',
    //   'icon-people',
    //   true,
    //   {
    //     TableRowSelection: 'none',
    //   },
    //   SubTablePosition.Tab,
    // );

    map.AddGroupMethod('固定行从表', 'icon-drop');
    map.AddRM_Dtl2DFixRow('考核2D固定', new KaoHeFixDtls(), 'StudentNo', 'Sort1', 'Sort2', 'Sort1', 'icon-people', '', SubTablePosition.Left);

    map.AddGroupMethod('交叉表');
    map.AddRM_Dtl3DSort1Sort2('考核3D', new KaoHeDtls(), 'StudentNo', 'Sort1', 'Sort2', 'Sort1', 'YF', 'Cent', 'icon-people', '', SubTablePosition.Left);
    // map.AddRM_Dtl3DSort1Sort2('考核3D', new KaoHeDtls(), 'StudentNo', 'Sort1', 'Sort2', 'Sort1', 'YF', 'icon-people', '', SubTablePostion.Left);

    map.AddGroupMethod('多对多关系');
    map.AddRM_One2Many_List('列表', new StudentKeMus(), new KeMus(), 'StudentNo', 'KeMuNo', 'icon-drop');
    map.AddRM_One2Many_GroupList('分组列表', new StudentCitys(), new Citys(), 'StudentNo', 'CityNo', new ShengFens(), 'ShengFen');
    map.AddRM_One2Many_Tree('树结构', new StudentDepts(), new Depts(), 'StudentNo', 'DeptNo', '0', true, 'icon-drop');
    map.AddRM_One2Many_TreeEns('左树右表', new StudentFZRs(), new Depts(), 'StudentNo', 'FZR', '0', true, new Emps(), 'FK_Dept', 'No=编号,Name=名称,Tel=电话');
    // map.AddRM_OnAttr2Many_GroupList('旅游城市', '', 'xx', new KeMus(), '', 'icon-drop');
    // map.AddRM_One2Many_GroupList('旅游城市', '', 'xx', new KeMus(), '', 'icon-drop');
    // map.AddGroupMethod('从表显示左侧');
    // map.AddRM_UrlTabOpen('简历Search', GloComm.UrlDtlSearch('', 'TS.Demo.Resume', 'StudentNo', '', '', '', '', false, '');
    // map.AddTabComponent('简历Batch', GloComm.UrlDtlBatch('TS.Demo.Resume', '&RefPK=StudentNo'), 400);
    // map.AddRM_UrlTabOpen('简历Search', new Resumes(), 'StudentNo', 'icon-drop', '', '', '', true, '', SubTablePostion.Bottom);
    map.AddTBAtParas(3000); // @EnName=TS.XXX.AA@Key=xxxx

    //查询条件.
    map.AddSearchAttr('ZZMM'); //string类型的枚举值.

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
    console.log('页面参数:', this.GetAllPageParam());
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
export class StudentDtls extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new StudentDtl();
  }
  constructor() {
    super();
  }
}
