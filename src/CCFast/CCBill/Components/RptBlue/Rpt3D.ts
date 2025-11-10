import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MenuAttr } from '../../../GPM/CCMenu/Menu';

// 三维报表
export class Rpt3D extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.CCFast.Rpt3D');
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
    const map = new Map('GPM_Menu', '三维报表');

    map.AddTBStringPK(MenuAttr.No, null, '编号', false, false, 1, 90, 50);
    // map.AddTBString(MenuAttr.Icon, null, 'Icon', true, false, 0, 50, 50);
    map.AddTBString(MenuAttr.Name, null, '菜单名称', true, true, 0, 200, 200);

    // map.AddTBString(MenuAttr.Title, null, '报表标题', true, false, 0, 200, 200, true);
    // map.AddTBString(MenuAttr.Tag4, null, '分析项目名称', true, false, 0, 200, 200);
    // map.AddDDLSysEnum(MenuAttr.ListModel, 0, '维度显示格式', true, true, 'RptModel', '@0=左边@1=顶部');
    // map.AddDDLSysEnum(MenuAttr.TagInt1, 0, '合计位置?', true, true, 'Rpt3SumModel', '@0=不显示@1=底部@2=头部');
    // map.AddTBStringDoc(MenuAttr.Tag0, null, '数据源SQL', true, false, true);
    // let msg = '编写说明';
    // msg += '\t\n 1. 该数据源一般是一个分组统计语句, 比如： SELECT D1,D2,D3,SUM(XX) AS Num FROM MyTable WHERE 1=2 GROUP BY D1,D2,D3  ';
    // msg += '\t\n 2. 对应的数据列分别是 如下数据源的列数据，列的顺序不要改变。 ';
    // msg += '\t\n 3. 每个维度都是返回的No,Name两个列的数据。 ';
    // msg += '\t\n 3，DEMO ';
    // msg += '\t\n 数据源：SELECT FK_BanJi,XB,ZZMM, COUNT(*) as Num from Demo_Student GROUP BY FK_BanJi,XB,ZZMM';
    // msg += '\t\n 维度1：SELECT No,Name FROM demo_banji ';
    // msg += "\t\n 维度2：SELECT IntKey as No, Lab as Name FROM sys_enum WHERE EnumKey='XB' ";
    // msg += "\t\n 维度3：SELECT IntKey as No, Lab as Name FROM sys_enum WHERE EnumKey='ZZMM'";
    // map.SetHelperAlert(MenuAttr.Tag0, msg);

    // map.AddTBStringDoc(MenuAttr.Tag1, null, '维度1SQL', true, false, true);
    // map.AddTBStringDoc(MenuAttr.Tag2, null, '维度2SQL', true, false, true);
    // map.AddTBStringDoc(MenuAttr.Tag3, null, '维度3SQL', true, false, true);

    //从表明细.
    // map.AddRM_DtlSearch(new SearchAttrs(), SearchAttrAttr.RefMenuNo, 'icon-drop');

    this._enMap = map;
    return this._enMap;
  }
}
//三维报表s
export class Rpt3Ds extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new Rpt3D();
  }
  constructor() {
    super();
  }
}
