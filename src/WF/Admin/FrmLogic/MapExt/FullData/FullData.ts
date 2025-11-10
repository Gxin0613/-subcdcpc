import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { FullDataDDLs } from './FullDataDDL';
import { GPE_FullDataBody } from './GPE_FullDataBody';
import { FullDtls } from './FullDtl';
import { FullAths } from './FullAth';
import { GPE_GenerDBSrcSearch } from '/@/CCFast/GenerDBSrc/GPE_GenerDBSrcSearch';
/// 落值填充
export class FullData extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.MapExt.FullData');
    if (!!pkval) this.MyPK = pkval;
  }

  //实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapExt', '数据填充');

    map.AddGroupAttr('填充主表');
    map.AddMyPK();
    //如下字段可以隐藏.
    map.AddTBString(MapExtAttr.FK_MapData, null, '表单ID', true, true, 0, 10, 50, false);
    map.AddTBString(MapExtAttr.ExtModel, null, 'ExtModel', true, true, 0, 10, 50, false);
    map.AddTBString(MapExtAttr.ExtType, null, 'ExtType', true, true, 0, 10, 50, false);
    map.AddTBString(MapExtAttr.AttrOfOper, null, 'AttrOfOper', true, true, 0, 10, 50, false);
    map.AddTBString(MapExtAttr.AttrOfOper, null, 'AttrOfOper', true, true, 0, 10, 50, false);
    map.AddBoolean('IsLoadFull', true, '加载页面时是否自动填充', true, true);
    // map.AddDDLSysEnum(MapExtAttr.DBType, 0, '数据源类型', true, true, 'DBType', '@0=执行SQL@1=执行url返回JSON@2=执行CCFromRef.js返回JSON', null, false);
    // map.AddDDLEntities(MapExtAttr.FK_DBSrc, 'local', '数据源', new SFDBSrc(), true, null, false);
    // map.AddTBStringDoc(MapExtAttr.Tag6, null, '填充表达式', true, false, true, this.DescSrc);
    //map.AddGroupAttr('填充其他控件');
    // map.AddRM_GPE(new GPE_FullDataBody(), 'icon-drop'); //填充主表的模式.
    map.AddRM_GPE(new GPE_GenerDBSrcSearch(), 'icon-drop', '', '填充主表', '&MarkID=FullDataBody');

    map.AddRM_DtlSearch('填充从表', new FullDtls(), MapExtAttr.RefPKVal, '', '', '', 'icon-drop', false, '&ExtType=FullDataDtl');
    map.AddRM_DtlSearch('填充下拉框', new FullDataDDLs(), MapExtAttr.RefPKVal, '', '', '', 'icon-drop', false, '&ExtType=FullDataDDL');
    map.AddRM_DtlSearch('填充附件', new FullAths(), MapExtAttr.RefPKVal, '', '', '', 'icon-drop', false, '&ExtType=FullDataAth');
    map.AddTBAtParas(4000);
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
