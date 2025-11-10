import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExt, MapExtAttr } from '../../MapExt';
/// <summary>
/// 落值填充
/// </summary>
export class FullBodySFTable extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.FullBodySFTable');
    if (!!pkval) this.MyPK = pkval;
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapExt', '填充主表');

    map.AddGroupAttr('填充主表');
    map.AddMyPK();

    //const sql = `SELECT No,Name FROM Sys_SFSearch WHERE IsPara=1 `;
    // map.AddDDLSQL('Tag6', null, '查询(1个参数)', sql, true, null, true);
    //  map.SetHelperAlert('Tag6', '查询的数据返回一行多列,列名要与主表字段名称保持一致,就会填充.');
    MapExt.AddAttrSFSearch(map, 'Tag6', '查询', 1);
    map.AddTBString(MapExtAttr.FK_MapData, null, '主表', false, false, 0, 100, 20);

    this._enMap = map;
    return this._enMap;
  }

  public readonly DescSrc = `
  #### 定义
  - 用户对控件进行操作的时候，比如: pop弹窗选择一个值, 是一个单据编号，人员编号，根据这个值获取数据填充其它数据控件的行为，我们称为落值填充.
  - 数据来源: Pop弹窗返回值、文本框自动完成、下拉框联动.
  #### 应用场景
  - 我们做一个档案系统, 在文本框输入一个人员编号,这里可以使用文本框自动完成.
  - 输入完成后，根据文本框的人员编号，获取该人员的地址，电话，邮件(主表信息), 他拥有的角色(主表下拉框信息) 以及教育经历(从表数据)
  - 填充到表单中去，完成用户的操作.
  #### 可填充的数据
  - 主表数据,比如:电话，邮件，地址.
  - 从表数据,比如:教育经历.
  - 下拉框内容,比如:人员拥有的角色集合(用下拉框展现)
  #### 配置说明
   - 填一个数据源返回的数据是一行多列，列的名字与主表字段对应，就会实现数据的自动填充.
   - 数据源必须有 @Key 参数，该值是传递来的数据.
   - 比如：SELECT Tel as DianHua, Email, Addr FROM Port_Emp WHERE No='@Key'
   - 如果配置的是url, 配置内容为: http://118.11.1.1/XXX/XX.do    
   - 系统解析为:http://118.11.1.1/XXX/XX.do?Key=zhangsan
   - 如果是函数: 请输入函数名称, 比如: GetEmpInfo()
  `;
  override async beforeInsert(): Promise<boolean> {
    // this.ExtModel = 'RegularExpression';
    // this.MyPK = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}

/**
 * 落值填充s
 */
export class FullDatas extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FullData();
  }
  constructor() {
    super();
  }
}
