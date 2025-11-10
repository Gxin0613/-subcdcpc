import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { SFDBSrc } from '/@/WF/Admin/FrmLogic/SFDBSrc/SFDBSrc';

export class Rpt3DLowCodeForDBSrc extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.CCFast.Rpt3DLowCodeForDBSrc');
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
    const map = new Map('Sys_Rpt', '三维交叉表');

    map.AddTBStringPK('No', null, '编号', false, false, 1, 90, 50);
    map.AddTBString('Name', null, '报表名称', true, false, 0, 200, 200);
    map.AddTBString('RptType', null, '报表类型', false, false, 0, 200, 200);
    map.AddDDLSysEnum('ListModel', 0, '维度显示格式', true, true, 'RptModel', '@0=左边@1=顶部');
    map.AddDDLSysEnum('SumPos', 0, '合计位置', true, true, 'Rpt3SumModel', '@0=不显示@1=底部@2=头部');
    map.AddDDLEntities('DBSrc', 'local', '数据源', new SFDBSrc(), true);
    map.AddTBString('RefPKey', null, '一维二维关联字段', true, false, 0, 100, 100);
    map.AddTBString('RowValKey', null, '分析字段', true, false, 0, 100, 100);

    map.AddTBStringDoc('Docs', null, '内容数据源', true, false, true);
    map.AddTBString('Tag1', null, '维度1名称', true, false, 0, 500, 100, true);
    map.AddTBStringDoc('Tag2', null, '维度1数据源', true, false, true);
    map.AddTBString('D1Key', null, '维度1字段名称', true, false, 0, 50, 20, true);

    map.AddTBString('Tag3', null, '维度2名称', true, false, 0, 500, 100, true);
    map.AddTBStringDoc('Tag4', null, '维度2数据源', true, false, true);
    map.AddTBString('D2Key', null, '维度2字段名称', true, false, 0, 50, 20, true);

    map.AddTBString('Tag5', null, '维度3名称', true, false, 0, 500, 100, true);
    map.AddTBStringDoc('Tag6', null, '维度3数据源', true, false, true);
    map.AddTBString('D3Key', null, '维度3字段名称', true, false, 0, 50, 20, true);

    this._enMap = map;
    return this._enMap;
  }
  public Init_Default() {
    this.Name = '3维度分析-学生统计分析-Demo';
    this.Docs = `[
      { BanJiNo: '001',  XB: 1, ZZMM: 1, Num: 32 },
      { BanJiNo: '002',  XB: 0, ZZMM: 2, Num: 2  },
      { BanJiNo: '003',  XB: 1, ZZMM: 1, Num: 23 },
      { BanJiNo: '002',  XB: 0, ZZMM: 2, Num: 5  },
      { BanJiNo: '001',  XB: 1, ZZMM: 3, Num: 3  },
    ]`;

    this.Tag1 = '班级';
    this.Tag2 = "[{ No: '001', Name: '1年级' },{ No: '002', Name: '2年级' },{ No: '003', Name: '3年级' }]";
    this.D1Key = 'BanJiNo';
    this.Tag3 = '性别';
    this.Tag4 = "[{ No: 0, Name: '女' },{ No: 1, Name: '男' }]";
    this.D2Key = 'XB';
    this.Tag5 = '政治面貌';
    this.Tag6 = "[{ No: 0, Name: '团员' },{ No: 1, Name: '党员' },{ No: 3, Name: '群众' },{ No: 4, Name: '无党派人士' }]";
    this.D3Key = 'ZZMM';
    return '初始化完成';
  }
}
