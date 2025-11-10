import { EntityNoName, EntitiesNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { DataType } from '/@/bp/en/DataType';
import WebUser from '/@/bp/web/WebUser';
import { DTSearchWay } from '/@/bp/en/Map/SearchNormal';
import { ShengFen } from '../ShengFen';
import { City } from '../City';
import { BanJi } from '../BanJi';
import { KeMu } from '../KeMu';
import dayjs from 'dayjs';
import { StyleValue } from 'vue';

/** 学生* */
export class StudentExt extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.StudentExt');
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
    const map = new Map('Demo_Student', '学生-业务逻辑');
    map.CodeStruct = '3';
    map.GroupBarShowModel = 1;

    map.AddGroupAttr('字段-基本字段');
    map.AddTBStringPK('No', null, '编号', true, true, 4, 4, 10); //如果设置自动编号字段必须是只读的.
    map.AddTBString('Name', null, '名称', true, false, 0, 200, 100);
    map.AddTBString('Addr', null, '地址', true, false, 1, 200, 190, true);

    // 远程搜索 demo
    // map.enMapExts.SetTextBoxFull('Addr', async (keyword: string, rowData: Recordable) => {
    //   await Promise.resolve(setTimeout(() => {}, 500));
    //   const res: Recordable[] = [];
    //   for (let i = 1; i <= 5; i++) {
    //     res.push({ ...rowData, No: i, Name: `Addr: ${keyword}(${i})` });
    //   }
    //   return res;
    // });
    // 方式 1， 使用 AutoFill + 表达式, select 的字段会自动填充
    // map.enMapExts.SetAutoFillCtrls('Addr', `SELECT  XXX as Key1, YYY as Key2 FROM Demo_Student WHERE No='@Key' `);
    // 方式 2， 使用 FieldChange 监听，可以直接修改 row 的值
    // map.enMapExts.AddFieldChangeListener('Addr', (val, row) => {
    //   console.log('远程搜索 demo:', val, row);
    //   row.Name = `Test Addr: ${val}`;
    //   return val;
    // });
    map.AddTBInt('Age', 18, '年龄', true, false);
    map.AddTBFloat('SG', 102, '身高cm', true, false);
    map.AddTBString('Tel', null, '电话', true, false, 8, 50, 150);
    map.AddTBString('Email', null, '邮件', true, false, 5, 50, 150);

    map.AddGroupAttr('字段-枚举');
    //枚举字段:
    map.AddRadioBtn('XB', 0, '性别', true, true, 'XB', '@0=女@1=男@2=未知', '单选按钮', false);
    map.AddGroupAttr('字段-外部数据源,存储编号,编号T两个字段');
    map.AddDDLSQL('BJSQL1', null, '班级(SQL标记)', 'DemoStudent_Student_BanJi', true); //外部数据源.
    map.AddDDLSQL('BJSQL2', null, '班级(Ens表达式)', 'Ens://TS.Demo.BanJi/No,Name/', true); //外部数据源.

    map.AddGroupAttr('字段-外键-仅存储编号');
    //外键字段，仅仅存储编号.
    map.AddDDLEntities('FKBanJi', null, '班级外键', new BanJi(), true, null, false, 150, 'No', 'Name'); //外键.
    map.AddDDLEntities('FKKeMu', null, '主修科目', new KeMu(), true, null, false, 150); //外键.

    map.AddGroupAttr('附件');
    map.AddAthSingle('RDSQS', '入党入团申请书', true, false, '*.*'); //单附件.
    map.AddAthMulti('Documents', '档案材料', true, false, '*.*', 200, '0'); //多附件

    map.AddGroupAttr('逻辑-字段计算');
    map.AddTBMoney('DanJia', 0, '单价', true, false);
    map.AddTBInt('ShuiLiang', 0, '数量', true, false);
    map.AddTBInt('ZheKou', 1, '折扣', true, false);
    map.AddTBMoney('HJ', 0, '小计', true, true);
    map.enMapExts.SetAutoEval('HJ', `@DanJia*@ShuiLiang*@ZheKou`); //自动计算模式.

    map.AddGroupAttr('逻辑-级联关系');
    map.AddDDLEntities('ShengFen', null, '省份', new ShengFen(), true, null, false);
    map.AddDDLEntities('City', null, '城市', new City(), true, null, false);
    map.enMapExts.SetJiLian('ShengFen', 'City', 'Ens://TS.Demo.City/No,Name/ShengFen=@Key'); //级联模式

    map.AddGroupAttr('输入控制-文本框'); // 当第一个字段被填写后，第二个字段才可填写. @Wanglu, 描述好场景.
    map.AddTBString('Control1', null, '先填写字段', true, false, 0, 100, 100);
    map.AddTBString('Control2', null, '后填写字段', true, false, 0, 100, 100);
    map.enMapExts.SetCascadeControl('Control1', 'Control2');

    map.AddGroupAttr('输入控制-单选按钮'); //当政治面貌选择为党员时，才可以选择入党日期 //@wanglu 如可控制附件，从表？
    map.AddDDLSysEnum('ZZMM', 0, '政治面貌', true, true, 'ZZMM', '@0=少先队员@1=团员@2=党员@3=无党派人士@4=群众');
    map.AddTBDate('JoinCCPDate', null, '入党日期', true, false, false, '', { type: 'date', format: 'YYYY-MM-DD' });
    map.AddTBDate('JoinTYDate', null, '入团日期', true, false, false, '', { type: 'date', format: 'YYYY-MM-DD' });
    // 演示选择政治面貌控制入党日期是否可填（函数）
    map.enMapExts.SetCascadeControl('ZZMM', 'JoinCCPDate', (val): boolean => {
      return val == 2; // 当政治面貌选择为党员时，才可以选择入党日期
    });
    map.enMapExts.SetCascadeControl('ZZMM', 'JoinTYDate', (val): boolean => {
      return val == 1;
    });

    map.AddGroupAttr('进度条'); //当政治面貌选择为党员时，才可以选择入党日期 //@wanglu 如可控制附件，从表？
    map.AddTBFloat('JinDu', 56, '进度', true, false);
    map.enMapExts.SetProgressField('JinDu'); //设置进度.

    // --- 日期范围 ---
    map.AddGroupAttr('日期范围-输入合法性-计算时间'); // 当第一个字段被填写后，第二个字段才可填写. @Wanglu, 描述好场景.
    map.AddTBDate('EnrollmentDate', null, '入学日期', true, false, false, '', { type: 'date', format: 'YYYY-MM-DD HH:mm' });
    map.AddTBDate('GraduationDate', null, '毕业日期', true, false, false, '', { type: 'date', format: 'YYYY-MM-DD HH:mm' });
    map.AddTBInt('SchoolTime', null, '在校时间', true, true);
    map.enMapExts.SetAutoEval('SchoolTime', (row) => {
      if (!row['EnrollmentDate'] || !row['GraduationDate']) {
        return 0;
      }
      return dayjs(row['GraduationDate']).diff(dayjs(row['EnrollmentDate']), 'days');
    }); //自动计算模式.
    // 设置日期范围，当开始日期选中后，结束日期才可以选择
    // 并且结束日期不会先于开始日期,比如请假日期从，到
    map.enMapExts.SetDateRange('EnrollmentDate', 'GraduationDate');

    map.AddGroupAttr('风格-字段风格-控制文本框显示的样式'); //当政治面貌选择为党员时，才可以选择入党日期 //@wanglu 如可控制附件，从表？
    map.AddTBString('PCAddr', null, '邮寄地址', true, false, 0, 100, 100);
    map.enMapExts.SetFieldStyle('PCAddr', {
      border: '1px solid red',
      backgroundColor: '#f2f5f7 !important',
    } as StyleValue);

    map.AddTBAtParas(3000);

    //查询条件.
    map.AddSearchAttr('ZZMM'); //string类型的枚举值.
    map.DTSearchLabel = '日期';
    map.DTSearchWay = DTSearchWay.ByDateRange;

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
export class StudentExts extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new StudentExt();
  }
  constructor() {
    super();
  }
}
