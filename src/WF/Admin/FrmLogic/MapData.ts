import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNoName, EntityNoNameAttr } from '/@/bp/en/EntityNoName';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { FrmType } from '../EnumLab';
import { getAppEnvConfig } from '/@/utils/env';

//属性列表
export class MapDataAttr extends EntityNoNameAttr {
  /// <summary>
  /// 表单事件实体类
  /// </summary>
  public static readonly FormEventEntity = 'FormEventEntity';
  /// <summary>
  /// 存储表
  /// </summary>
  public static readonly PTable = 'PTable';
  /// <summary>
  /// 表存储格式0=自定义表,1=指定表,可以修改字段2=执行表不可以修改字段.
  /// </summary>
  public static readonly PTableModel = 'PTableModel';
  /// <summary>
  /// 从表数量
  /// </summary>
  public static readonly Dtls = 'Dtls';
  /// <summary>
  /// 实体主键
  /// </summary>
  public static readonly EnPK = 'EnPK';
  /// <summary>
  /// 宽度
  /// </summary>
  public static readonly FrmW = 'FrmW';
  /// <summary>
  /// 表格列(对经典表单有效)
  /// </summary>
  public static readonly TableCol = 'TableCol';
  /// <summary>
  /// 来源
  /// </summary>
  public static readonly FrmFrom = 'FrmFrom';
  /// <summary>
  /// 设计者
  /// </summary>
  public static readonly Designer = 'Designer';
  /// <summary>
  /// 设计者单位
  /// </summary>
  public static readonly DesignerUnit = 'DesignerUnit';
  /// <summary>
  /// 设计者联系方式
  /// </summary>
  public static readonly DesignerContact = 'DesignerContact';
  /// <summary>
  /// 设计器
  /// </summary>
  public static readonly DesignerTool11 = 'DesignerTool';
  /// <summary>
  /// 表单树类别
  /// </summary>
  public static readonly FK_FormTree = 'FK_FormTree';
  /// <summary>
  /// 表单类型
  /// </summary>
  public static readonly FrmType = 'FrmType';
  /// <summary>
  /// 业务类型
  /// </summary>
  public static readonly EntityType = 'EntityType';
  /// <summary>
  /// 表单展示方式
  /// </summary>
  public static readonly FrmShowType = 'FrmShowType';
  public static readonly MobileFrmShowType = 'MobileFrmShowType';
  
  /// <summary>
  /// 单据模板
  /// </summary>
  public static readonly FrmModel = 'FrmModel';
  /// <summary>
  /// Url(对于嵌入式表单有效)
  /// </summary>
  public static readonly UrlExt = 'UrlExt';
  /// <summary>
  /// Tag
  /// </summary>
  public static readonly Tag = 'Tag';
  /// <summary>
  /// 备注
  /// </summary>
  public static readonly Note = 'Note';
  /// <summary>
  /// Idx
  /// </summary>
  public static readonly Idx = 'Idx';
  /// <summary>
  /// GUID
  /// </summary>
  public static readonly GUID = 'GUID';
  /// <summary>
  /// 版本号
  /// </summary>
  public static readonly Ver = 'Ver';
  /// <summary>
  /// 应用类型
  /// </summary>
  public static readonly AppType = 'AppType';
  /// <summary>
  /// 表单body属性.
  /// </summary>
  public static readonly BodyAttr = 'BodyAttr';
  /// <summary>
  /// 流程控件
  /// </summary>
  public static readonly FlowCtrls = 'FlowCtrls';
  /// <summary>
  ///组织结构.
  /// </summary>
  public static readonly OrgNo = 'OrgNo';
  /// <summary>
  /// Icon.
  /// </summary>
  public static readonly Icon = 'Icon';

  /// <summary>
  /// 数据源
  /// </summary>
  public static readonly DBSrc = 'DBSrc';
  /// <summary>
  /// 数据源类型
  /// </summary>
  public static readonly DBType = 'DBType';
  /// <summary>
  /// 单行
  /// </summary>
  public static readonly ExpEn = 'ExpEn';
  /// <summary>
  /// 列表
  /// </summary>
  public static readonly ExpList = 'ExpList';
  /// <summary>
  /// 表达式
  /// </summary>
  public static readonly ExpCount = 'ExpCount';
  /// <summary>
  /// 分页的模式
  /// </summary>
  public static readonly ExpListPageModel = 'ExpListPageModel';
  /// <summary>
  /// 是否关键字查询
  /// </summary>
  public static readonly IsSearchKey = 'IsSearchKey';
  /// <summary>
  /// 时间段查询方式
  /// </summary>
  public static readonly DTSearchWay = 'DTSearchWay';
  /// <summary>
  /// 时间字段
  /// </summary>
  public static readonly DTSearchKey = 'DTSearchKey';
  /// <summary>
  /// 查询外键枚举字段
  /// </summary>
  public static readonly RptSearchKeys = 'RptSearchKeys';
  /// <summary>
  /// 最左边的值
  /// </summary>
  public static readonly MaxLeft = 'MaxLeft';
  /// <summary>
  /// 最右边的值
  /// </summary>
  public static readonly MaxRight = 'MaxRight';
  /// <summary>
  /// 最头部的值
  /// </summary>
  public static readonly MaxTop = 'MaxTop';
  /// <summary>
  /// 最底部的值
  /// </summary>
  public static readonly MaxEnd = 'MaxEnd';
  public static readonly EnsName = 'EnsName';
  /// <summary>
  /// 是否是加密
  /// </summary>
  public static readonly IsJM = 'IsJM';
}

// 表单注册
export class MapData extends EntityNoName {
  // 日期查询
  get DTSearchKey() {
    return this.GetValStringByKey(MapDataAttr.DTSearchKey);
  }
  set DTSearchKey(value: any) {
    this.SetValByKey(MapDataAttr.DTSearchKey, value);
  }

  constructor(no?: string) {
    super('TS.User.MapData', 'BP.Sys.MapData');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapData', '表单注册');

    map.AddTBStringPK(MapDataAttr.No, null, '编号', true, false, 1, 100, 100);
    map.AddTBString(MapDataAttr.Name, null, '描述', true, false, 0, 300, 20);
    map.AddTBString(MapDataAttr.FormEventEntity, null, '事件实体', true, true, 0, 100, 20, true);

    map.AddTBString(MapDataAttr.EnPK, null, '实体主键', true, false, 0, 50, 20);
    map.AddTBString(MapDataAttr.PTable, null, '存储表', true, false, 0, 150, 20);

    //@周朋 表存储格式0=自定义表,1=指定表,可以修改字段2=执行表不可以修改字段.
    map.AddTBInt(MapDataAttr.PTableModel, 0, '表存储模式', true, true);

    map.AddTBString(MapDataAttr.UrlExt, null, '连接(对嵌入式表单有效)', true, false, 0, 300, 20);
    map.AddTBString(MapDataAttr.Dtls, null, '从表', true, false, 0, 150, 20);

    map.AddTBInt(MapDataAttr.FrmW, 900, 'FrmW', true, true);
    // @0=4列, @1=6 列.
    map.AddTBInt(MapDataAttr.TableCol, 0, '经典表单显示的列', true, true);

    //Tag
    map.AddTBString(MapDataAttr.Tag, null, 'Tag', true, false, 0, 500, 20);

    // 可以为空这个字段。
    //map.AddTBString(MapDataAttr.FK_FrmSort, null, "表单类别", true, false, 0, 500, 20);
    map.AddTBString(MapDataAttr.FK_FormTree, null, '表单树类别', true, false, 0, 40, 20);

    // enumFrmType  @自由表单，@经典表单，@嵌入式表单.
    map.AddTBInt(MapDataAttr.FrmType, 0, '表单类型', true, true);
    map.AddTBInt(MapDataAttr.FrmShowType, 0, '表单展示方式', true, true);
    map.AddTBInt(MapDataAttr.MobileFrmShowType, 0, '移动端表单展示方式', true, true);

    //该实体的类型,@0=独立表单@1=单据@2=实体@.
    map.AddTBInt(MapDataAttr.EntityType, 0, '业务类型', true, true);

    map.AddBoolean('IsEnableJs', false, '是否启用自定义js函数？', true, true, true);

    // 应用类型.  0独立表单.1节点表单
    map.AddTBInt(MapDataAttr.AppType, 0, '应用类型', true, false);
    map.AddTBString(MapDataAttr.DBSrc, 'local', '数据源', true, false, 0, 50, 20);
    map.AddTBString(MapDataAttr.BodyAttr, null, '表单Body属性', true, false, 0, 100, 20);
    // 补充公用属性
    map.AddDDLSysEnum('OverflowMode', 0, '文本内容溢出处理', true, true, 'OverflowMode', '@0=不换行(tooltip)@1=换行');
    map.AddDDLSysEnum('ListDtlShowWay', 0, '从表展现', true, true, 'ListDtlShowWay', '@0=不展现@1=平铺模式展现行中间@2=Tab模式展现行中间');
    map.SetHelperUrl('ListDtlShowWay', 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=14221366&doc_id=31094');
    map.AddTBInt('ListShowWay', 0, '列表展现', false, false);
    map.AddTBString('ListShowKey', null, '字段', false, false, 0, 50, 20);
    // map.AddTBString(MapDataAttr.Note, null, '备注', true, false, 0, 100, 20);
    // map.AddTBString(MapDataAttr.Designer, null, '设计者', true, false, 0, 50, 20);
    // map.AddTBString(MapDataAttr.DesignerUnit, null, '单位', true, false, 0, 50, 20);
    // map.AddTBString(MapDataAttr.DesignerContact, null, '联系方式', true, false, 0, 50, 20);
    map.AddTBInt(MapDataAttr.Idx, 100, '序号', true, true);
    map.AddTBString(MapDataAttr.GUID, null, 'GUID', true, false, 0, 128, 20);
    map.AddTBString(MapDataAttr.Ver, null, '版本号', true, false, 0, 30, 20);
    map.AddTBString(MapDataAttr.Icon, null, 'Icon', true, false, 0, 30, 20, true);
    //流程控件.
    map.AddTBString(MapDataAttr.FlowCtrls, null, '流程控件', true, true, 0, 100, 20);
    map.AddTBInt('ShowColModel', 0, 'ShowColModel', false, false);
    map.AddTBString('ShowCols', null, 'ShowCols', false, false, 0, 500, 20);
    map.AddTBInt('NoGenerModel', 0, '序号', false, false);
    map.AddTBString('BillNoFormat', null, '实体编号规则', false, false, 0, 10, 20, true);

    //增加参数字段.
    map.AddTBAtParas(4000);
    map.AddTBString(MapDataAttr.OrgNo, null, 'OrgNo', true, false, 0, 50, 20);
    this._enMap = map;
    return this._enMap;
  }
  //设计器url.
  public UrlDesigner() {
    const { VITE_PUBLIC_PATH } = getAppEnvConfig();
    const path = VITE_PUBLIC_PATH;
    if (this.FrmType == FrmType.Develop) return `${path}#/WF/Designer/Form?FrmID=${this.No}`;
    if (this.FrmType == FrmType.FoolForm) return `${path}#/WF/Designer/Form?FrmID=${this.No}`;
    if (this.FrmType == FrmType.ChapterFrm) return `${path}#/WF/ChapterFrmDesigner/Form?FrmID=${this.No}`;
    if (this.FrmType == FrmType.VSTOForExcel) return `${path}#/WF/Designer/Form?FrmID=${this.No}`;
    // if (this.FrmType == FrmType.VSTOForExcel) return GloComm.IframeGenerList('GL_VSTOFrm', '&FrmID=' + this.No);
    return `${path}#/WF/Designer/Form?FrmID=${this.No}`;
  }
}

//表单注册s
export class MapDatas extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new MapData();
  }
  constructor() {
    super();
  }
}
