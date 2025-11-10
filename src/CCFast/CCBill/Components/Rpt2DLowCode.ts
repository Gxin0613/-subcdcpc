import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { SFDBSrc } from '/@/WF/Admin/FrmLogic/SFDBSrc/SFDBSrc';

// 二维报表
export class Rpt2DLowCode extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.CCFast.Rpt2DLowCode');
    if (!!pkval) this.No = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_Rpt', '二维报表');

    map.AddTBStringPK('No', null, '编号', false, false, 1, 90, 50);
    map.AddTBString('Name', null, '报表名称', true, false, 0, 200, 200);
    map.AddTBString('RptType', null, '报表类型', false, false, 0, 200, 200);
    map.AddDDLSysEnum('ListModel', 0, '维度显示格式', true, true, 'RptModel', '@0=左边@1=顶部@2=顶左');
    map.AddDDLSysEnum('SumPos', 0, '合计位置', true, true, 'Rpt3SumModel', '@0=不显示@1=底部@2=头部');
    map.AddTBString('RefPKey', null, '一维二维关联字段', false, false, 0, 100, 100);
    map.AddTBString('RowValKey', null, '分析字段', false, false, 0, 100, 100);

    map.AddGroupAttr('数据源-2025-09不在支持');
    map.AddDDLEntities('DBSrc', 'local', '数据源', new SFDBSrc(), true);
    map.AddTBStringDoc('Docs', null, '内容数据源', true, false, true);
    let msg = '编写说明';
    msg += `	
 1. 该数据源一般是一个分组统计语句, 比如： SELECT D1,D2,D3,SUM(XX) AS Num FROM MyTable WHERE 1=2 GROUP BY D1,D2,D3  `;
    msg += `	
 2. 对应的数据列分别是 如下数据源的列数据，列的顺序不要改变。 `;
    msg += `	
 3. 每个维度都是返回的No,Name两个列的数据.`;
    msg += '\t\n 3，DEMO ';
    msg += `	
 数据源：SELECT BanJiNo,XB,ZZMM, COUNT(*) as Num from Demo_Student GROUP BY BanJiNo,XB,ZZMM`;
    msg += `	
 维度1：SELECT No,Name FROM Demo_BanJi `;
    msg += `	
 维度2：SELECT IntKey as No, Lab as Name FROM sys_enum WHERE EnumKey='XB' `;
    msg += `	
 维度3：SELECT IntKey as No, Lab as Name FROM sys_enum WHERE EnumKey='ZZMM'`;
    map.SetHelperAlert('Docs', msg);

    map.AddTBString('Tag1', null, '维度1名称', true, false, 0, 500, 100, true);
    map.AddTBStringDoc('Tag2', null, '维度1数据源', true, false, true);
    map.AddTBString('D1Key', null, '维度1字段名称', true, false, 0, 50, 20, true);

    map.AddTBString('Tag3', null, '维度2名称', true, false, 0, 500, 100, true);
    map.AddTBStringDoc('Tag4', null, '维度2数据源', true, false, true);
    map.AddTBString('D2Key', null, '维度2字段名称', true, false, 0, 50, 20, true);

    this._enMap = map;
    return this._enMap;
  }
  public Init_Default() {
    this.Name = '2维度分析-学生统计分析-Demo';
    this.Docs = `[
      { BanJiNo: '001',  ZZMM: 1, Num: 32 },
      { BanJiNo: '002',  ZZMM: 2, Num: 2  },
      { BanJiNo: '003',  ZZMM: 1, Num: 23 },
      { BanJiNo: '002',  ZZMM: 2, Num: 5  },
      { BanJiNo: '001',  ZZMM: 3, Num: 3  },
    ]`;

    this.Tag1 = '班级';
    this.Tag2 = "[{ No: '001', Name: '1年级' },{ No: '002', Name: '2年级' },{ No: '003', Name: '3年级' }]";
    this.D1Key = 'BanJiNo';
    this.Tag3 = '政治面貌';
    this.Tag4 = "[{ No: 0, Name: '团员' },{ No: 1, Name: '党员' },{ No: 3, Name: '群众' },{ No: 4, Name: '无党派人士' }]";
    this.D2Key = 'ZZMM';
    return '初始化完成';
  }
}
//二维报表s
export class Rpt2DLowCodes extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Rpt2DLowCode();
  }
  constructor() {
    super();
  }
}
