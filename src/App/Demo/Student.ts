import { EntityNoName, EntitiesNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { BanJi } from './BanJi';
import { DataType } from '/@/bp/en/DataType';
import WebUser from '/@/bp/web/WebUser';
import { FrmAttachmentDBs } from '/@/WF/Admin/FrmLogic/FrmAttachment/FrmAttachmentDB';
import { KeMu } from './KeMu';
/** 学生* */
export class Student extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.Student');
    if (!!pkval) this.setPKVal(pkval);
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Demo_Student', '学生');
    map.CodeStruct = '3';
    map.GroupBarShowModel = 1;

    map.AddGroupAttr('基本字段');
    map.AddTBStringPK('No', null, '编号', true, true, 4, 4, 80); //如果设置自动编号字段必须是只读的.
    map.AddTBString('Name', null, '名称', true, false, 0, 200, 80);
    map.AddTBString('Addr', null, '地址', true, false, 1, 200, 100, true);
    map.AddTBInt('Age', 18, '年龄', true, false);
    map.AddTBFloat('SG', 102, '身高cm', true, false);

    map.AddTBDateTime('JoinCCPDate', null, '入党日期', true, false, false, '', { type: 'datetime', format: 'YYYY-MM-DD', showTime: true });
    map.AddTBString('Tel', null, '电话', true, false, 8, 50, 100);
    map.AddTBString('Email', null, '邮件', true, false, 5, 50, 100);
    // map.AddTBDateTime('LastModified', null, '最后修改日期', true, false, false, '', { type: 'datetime', format: 'YYYY-MM-DD HH:mm:ss', showTime: true });

    map.AddGroupAttr('枚举');
    //枚举字段:
    map.AddDDLSysEnum('ZZMM', 0, '政治面貌', true, true, 'ZZMM', '@0=少先队员@1=团员@2=党员@3=无党派人士@4=群众', '', false, 120);
    map.AddRadioBtn('XB', 0, '性别', true, true, 'XB', '@0=女@1=男@2=未知', '单选按钮', false);
    // 多选框
    map.AddCheckbox('Interest', '', '爱好', true, true, '', '@0=音乐@1=编程@2=喝酒@3=打牌@4=读书', '');

    map.AddGroupAttr('字段-外部数据源-存储编号,编号T两个字段');
    map.AddDDLSQL('BJSQL1', null, '班级(SQL标记)', 'DemoStudent_Student_BanJi', true); //外部数据源.
    map.SetHelperAlert('BJSQL1', `#### 说明： 通过一个字符串标记，对应后台的SQL查询语句,请搜索'DemoStudent_Student_BanJi' 出现的代码地方，按照这个格式填写Sql`);

    map.SetHelperAlert('BJSQL1', '格式: Handler:/页面实体类/方法/参数(可为空), 通过反射实体类页,指定的方法与参数，获得下拉框的数据内容.');

    map.AddDDLSQL('BJSQL2', null, '班级(Ens表达式)', 'Ens://TS.Demo.BanJi/No,Name/', true); //外部数据源.
    map.AddDDLSQL('KM', null, '科目(Ens表达式)', 'Ens://TS.Demo.KeMu/No,Name/', true); //外部数据源.

    map.SetHelperAlert(
      'BJSQL2',
      `#### 说明
      1. Ens:/实体/No属性,Name属性/参数(可为空), 
      1. 例1:Ens://TS.Demo.BanJi/No,Name/
      1. 通过指定的实体集合，指定的实体属性获得下拉框的内容. `,
    );

    map.AddDDLSQL('BJSQL3', null, '班级(Handler表达式)', 'Handler://BP.App.Demo.Handler_Demo/Student_GenerBanJis/', true); //外部数据源.
    map.SetHelperAlert(
      'BJSQL3',
      `#### 说明
      1. 格式: Handler:/页面实体类/方法/参数(可为空), 
      1. 例1:Handler://BP.App.Hander_Demo/Student_GenerBanJis/
      1. 例2:Handler://BP.LI.LIPage/GPN_SelectCYFrm/FK_DTCaiYangFrm=@FK_DTCaiYangFrm // @FK_DTCaiYangFrm 是本实体的字段参数.
      1. 通过反射实体类页,指定的方法与参数，获得下拉框的数据内容. `,
    );

    //map.AddDDLSQL('Dev', null, '采样设备', 'Handler://BP.LI.LIPage/GPN_SelectCYFrm/FK_DTCaiYangFrm=@FK_DTCaiYangFrm', true, null, true, 300); //外部数据源

    map.AddGroupAttr('字段-外键-仅存储编号');
    //外键字段，仅仅存储编号.
    map.AddDDLEntities('BanJiNo', null, '班级外键', new BanJi(), true, null, false, 150, 'No', 'Name'); //外键.
    map.AddDDLEntities('KeMuNo', null, '主修科目', new KeMu(), true, null, false, 150, 'No', 'Name'); //外键.

    map.AddGroupAttr('附件');
    map.AddAthSingle('RDSQS', '入党入团申请书', true, false, '*.*'); //单附件.
    map.AddAthMulti('Documents', '档案材料', true, false, '*.*', 200, '0'); //多附件

    map.AddGroupAttr('家庭信息');
    map.AddTBString('PostAddr', null, '邮寄地址', true, false, 1, 200, 190, true);
    map.AddBoolean('IsDuShengZi', false, '独生子？', true, true);
    map.AddBoolean('IsTeKunSheng', false, '特困生？', true, true);
    map.AddTBStringDoc('BeiZhu', null, '备注', true, false, true); //大块文本.

    map.AddGroupAttr('日期');
    map.AddTBDate('BirthDT', null, '日期YYYY-MM-DD', true, false, false, '', { type: 'date', format: 'YYYY-MM-DD' });
    map.AddTBDate('BirthWeek', null, '日期(显示周)', true, true, false, '', { type: 'week', format: 'YYYY-MM-DD' });
    map.AddTBDate('BirthMonth', null, '月份YYYY-MM', true, false, false, '', { type: 'month', format: 'YYYY-MM' });
    map.AddTBDate('BirthQuarter', null, '出生季度', true, false, false, '', { type: 'quarter', format: 'YYYY-MM-DD' });
    map.AddTBDate('BirthYear', null, '年份YYYY', true, false, false, '', { type: 'year', format: 'YYYY' });
    map.AddTBDateTime('RegDate', null, '注册时间', true, false, false, '', { type: 'datetime', format: 'YYYY-MM-DD HH:mm', showTime: true });

    map.AddGroupAttr('记录信息-默认值'); //初始化的时候，表达式 @WebUser.*
    map.AddTBDateTime('RDT', null, '记录日期', true, true, false, '', { type: 'datetime', format: 'YYYY-MM-DD', showTime: false });
    map.AddTBString('RecNo', '@WebUser.No', '记录人编号', true, true, 0, 200, 100);
    map.AddTBString('RecName', '@WebUser.Name', '记录人名称', true, true, 0, 200, 100);
    map.AddTBString('RecDeptNo', '@WebUser.DeptNo', '部门编号', true, true, 0, 200, 100);
    map.AddTBString('RecDeptName', '@WebUser.DeptName', '部门名称', true, true, 0, 200, 100);
    map.AddTBString('OrgNo', '@WebUser.OrgNo', '组织编号', true, true, 0, 200, 100);

    //入学方式.
    map.AddTBInt('IncomeWay', 0, '入学方式', false, false);
    map.AddTBString('IncomeExt', '', '入学方式说明', false, true, 0, 200, 100);
    map.AddHidden('OrgNo', '=', '@WebUser.OrgNo');

    //如果要与实体表单同步，可以批量增加这些字段，就可以使用到权限可以配置化的控制.
    map.AddFrmEntityEndAttrs();

    map.AddGroupMethod('帮助', 'icon-link');
    map.AddRM_HelpDocs(
      '帮助',
      'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=5816565&doc_id=31094',
      'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=5816565&doc_id=31094',
      'icon-link',
    );

    //隐藏字段.
    map.AddTBAtParas(3000); // @EnName=TS.XXX.AA@Key=xxxx
    map.AddSearchAttr('XB', 150); // int类型的枚举.

    // map.AddRM_GPE(new GPE_IncomeWay(), 'icon-drop');

    this._enMap = map;
    return this._enMap;
  }

  override async beforeDelete(): Promise<boolean> {
    const attach_dbs = new FrmAttachmentDBs();
    await attach_dbs.Delete('RefPKVal', this.No, 'FK_MapData', 'TS.Demo.Student');
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
    // if (!this.GetValStringByKey('Email')) {
    //   throw new Error('邮件不能为空...');
    // }
    console.log('页面参数:', this.GetAllPageParam());

    //设置行的显示颜色.
    this.SetPara('BGColor', '');
    if (this.Age <= 5) this.SetPara('BGColor', 'red');
    if (this.Age > 5 && this.Age <= 10) this.SetPara('BGColor', 'yellow');

    // //根据简历的薪水，求该人员平均薪水.
    // const dtls = new Resumes();
    // await dtls.Retrieve('StudentNo', this.No); //获得所有的简历,并求和.
    // let sumXinShui = 0;
    // for (let index = 0; index < dtls.length; index++) {
    //   const dtl = dtls[index];
    //   sumXinShui += dtl.XinShui;
    // }
    // if (sumXinShui != 0) this.XinShui = sumXinShui / dtls.length;
    // else this.XinShui = 0;
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
export class Students extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Student();
  }
  constructor() {
    super();
  }
}
