import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { Entity } from '/@/bp/en/Entity';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapAttr } from './MapAttrs/MapAttr';
import { GloWF } from '../GloWF';
import { PopList } from './MapExt/Pop/PopList';
//属性列表
export class MapExtAttr {
  // 标签
  public static readonly Lab = 'Lab';
  /// <summary>
  /// 表单ID
  /// </summary>
  public static readonly FK_MapData = 'FK_MapData';
  public static readonly RefPKVal = 'RefPKVal';
  /// <summary>
  /// ExtType
  /// </summary>
  public static readonly ExtType = 'ExtType';
  /// <summary>
  /// 插入表单的位置
  /// </summary>
  public static readonly RowIdx = 'RowIdx';
  /// <summary>
  /// GroupID
  /// </summary>
  public static readonly GroupID = 'GroupID';
  /// <summary>
  /// 高度
  /// </summary>
  public static readonly H = 'H';
  /// <summary>
  /// 宽度
  /// </summary>
  public static readonly W = 'W';
  /// <summary>
  /// 是否可以自适应大小
  /// </summary>
  public static readonly IsAutoSize = 'IsAutoSize';
  /// <summary>
  /// 设置的属性
  /// </summary>
  public static readonly AttrOfOper = 'AttrOfOper';
  //模式
  public static readonly ExtModel = 'ExtModel';
  /// <summary>
  /// 激活的属性
  /// </summary>
  public static readonly AttrsOfActive = 'AttrsOfActive';
  /// <summary>
  /// 执行方式
  /// </summary>
  public static readonly DoWay = 'DoWay';
  /// <summary>
  /// Tag
  /// </summary>
  public static readonly Tag = 'Tag';
  /// <summary>
  /// Tag1
  /// </summary>
  public static readonly Tag1 = 'Tag1';
  /// <summary>
  /// Tag2
  /// </summary>
  public static readonly Tag2 = 'Tag2';
  /// <summary>
  /// Tag3
  /// </summary>
  public static readonly Tag3 = 'Tag3';
  /// <summary>
  /// tag4
  /// </summary>
  public static readonly Tag4 = 'Tag4';
  /// <summary>
  /// tag5
  /// </summary>
  public static readonly Tag5 = 'Tag5';
  public static readonly Tag6 = 'Tag6';
  /// <summary>
  /// 数据源
  /// </summary>
  public static readonly DBType = 'DBType';
  /// <summary>
  /// Doc
  /// </summary>
  public static readonly Doc = 'Doc';
  /// <summary>
  /// 参数
  /// </summary>
  public static readonly AtPara = 'AtPara';
  /// <summary>
  /// 计算的优先级
  /// </summary>
  public static readonly PRI = 'PRI';
  /// <summary>
  /// 数据源
  /// </summary>
  public static readonly FK_DBSrc = 'FK_DBSrc';
  /// <summary>
  /// 排序
  /// </summary>
  public static readonly Idx = 'Idx';
  public static readonly HtmlText = 'HtmlText';
}

// 业务逻辑
export class MapExt extends EntityMyPK {
  // FK_MapData
  get FK_MapData() {
    return this.GetValStringByKey(MapExtAttr.FK_MapData);
  }
  set FK_MapData(value: any) {
    this.SetValByKey(MapExtAttr.FK_MapData, value);
  }

  public static AddAttrSFTable(map: Map, attrKey: string, attrName: string, isPara: number, codeStruct = 0) {
    const help0 = `
    #### 帮助.
    - 请选择一个字典表.
    - 字典表在字典库里维护，如果列表里没有您要的数据，请您在设置里增加字典.
    - 设置字典：需要设置（无）参数的字典.
    `;
    const help1 = `
    #### 帮助.
    - 请选择一个字典表.
    - 字典表在字典库里维护，如果列表里没有您要的数据，请您在设置里增加字典.
    - 设置字典：需要设置有参数的字典.
    `;
    let Help = help1;
    if (isPara == 0) Help = help0;

    if (codeStruct == 1) Help += '- 字典为树结构.';

    map.AddTBString(attrKey, null, attrName, true, false, 0, 100, 100, true, Help);
    //const sql = ` SELECT No,Name FROM Sys_SFTable WHERE IsPara=${isPara}  AND No!='Blank' AND CodeStruct=${codeStruct} `;
    map.SetPopList(attrKey, GloWF.SQLOfMapExtSelectSFTable(isPara, codeStruct), false, '300px', '500px', '请选择字典', 'icon-people');
  }

  public static AddAttrSFSearch(map: Map, attrKey: string, attrName: string, isPara: number) {
    const help0 = `
    #### 帮助.
    - 请选择一个字典表.
    - 字典表在字典库里维护，如果列表里没有您要的数据，请您在设置里增加字典.
    - 设置字典：需要设置（无）参数的字典.
    `;
    const help1 = `
    #### 帮助.
    - 请选择一个字典表.
    - 字典表在字典库里维护，如果列表里没有您要的数据，请您在设置里增加字典.
    - 设置字典：需要设置有参数的字典.
    `;
    let Help = help1;
    if (isPara == 0) Help = help0;

    map.AddTBString(attrKey, null, attrName, true, false, 0, 100, 100, true, Help);
    //const sql = ` SELECT No,Name FROM Sys_SFSearch `;
    map.SetPopList(attrKey, GloWF.SQLOfSFSearch, false, '600px', '500px', '请选择一个查询', 'icon-people');
  }

  constructor(mypk?: string) {
    super('TS.Sys.MapExt', 'BP.Sys.MapExt');
    if (!!mypk) this.MyPK = mypk;
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
    const map = new Map('Sys_MapExt', '业务逻辑');

    map.AddMyPK(); // FK_MapData+'_'+AttrOfOper+'_'+ExtModel;
    map.AddTBString(MapExtAttr.RefPKVal, null, 'RefPKVal', true, false, 0, 100, 20);
    map.AddTBString(MapExtAttr.FK_MapData, null, '主表', true, false, 0, 100, 20);
    map.AddTBString(MapExtAttr.AttrOfOper, null, '操作的Attr', true, false, 0, 30, 20);
    map.AddTBString(MapExtAttr.ExtModel, null, '模式1级分类', true, false, 0, 30, 20);

    map.AddTBString(MapExtAttr.ExtType, null, '类型2级分类', true, false, 0, 30, 20);
    map.AddTBString(MapExtAttr.DoWay, null, '执行方式(状态)', true, false, 0, 50, 20);
    map.AddTBString(MapExtAttr.AttrsOfActive, null, '激活(关联)的字段', true, false, 0, 900, 20);
    map.AddTBString(MapExtAttr.Doc, null, '配置内容', true, false, 0, 2000, 20);

    map.AddTBString(MapExtAttr.Tag, null, 'Tag', true, false, 0, 2000, 20);
    map.AddTBString(MapExtAttr.Tag1, null, 'Tag1', true, false, 0, 2000, 20);
    map.AddTBString(MapExtAttr.Tag2, null, 'Tag2', true, false, 0, 2000, 20);
    map.AddTBString(MapExtAttr.Tag3, null, 'Tag3', true, false, 0, 2000, 20);
    map.AddTBString(MapExtAttr.Tag4, null, 'Tag4', true, false, 0, 2000, 20);
    map.AddTBString(MapExtAttr.Tag5, null, 'Tag5', true, false, 0, 2000, 20);

    //为落值填充增加，如果mapext用到了，落值填充，这个属性要保留.
    map.AddTBString(MapExtAttr.Tag6, null, 'Tag6', true, false, 0, 2000, 20);

    map.AddTBInt(MapExtAttr.H, 500, '高度', false, false);
    map.AddTBInt(MapExtAttr.W, 400, '宽度', false, false);
    // 数据类型 @0=SQL@1=URLJSON@2=FunctionJSON.
    map.AddTBString(MapExtAttr.FK_DBSrc, 'local', '数据源', true, false, 0, 100, 20);

    map.AddTBInt('PRI', 0, 'PRI', false, false);
    map.AddTBInt('Idx', 0, '序号', false, false);

    map.AddTBString(MapExtAttr.AtPara, null, '参数', true, false, 0, 3999, 20);

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    if (!this.MyPK) this.MyPK = this.FK_MapData + '_' + this.AttrOfOper + '_' + this.ExtModel;
    //this.SetValByKey(StudentAttr.BirthDT, '2021-09-01');
    return Promise.resolve(true);
  }
  // 表单扩展属性:初始化数据
  public async InitDataForMapData(buessKey: string, frmID: string, doWay = 'None') {
    const myPKVal = frmID + '_' + buessKey; //组织mapExt的主键.
    this.setPKVal(myPKVal);
    const num = await this.RetrieveFromDBSources();
    this.ExtType = buessKey;
    this.ExtModel = buessKey;
    this.FK_MapData = frmID;
    if (num == 0) {
      this.DoWay = doWay;
      await this.DirectInsert(); //保存里面.
    }
    return this;
  }

  //字段扩展属性:初始化数据.
  public async InitDataForMapAttr(buessKey: string, mapAttrPKVal: string, doWay = '0') {
    //获得字段No , FrmID+'_'+KeyOfEn, 给他初始化一笔数据.
    //装载填充
    if (buessKey === 'PageLoadFullMainTable') {
      const myPKVal = mapAttrPKVal + '_' + buessKey; //组织mapExt的主键.
      this.setPKVal(myPKVal);
      const num = await this.RetrieveFromDBSources();
      this.ExtType = buessKey;
      this.ExtModel = buessKey;
      this.FK_MapData = mapAttrPKVal; //设置frmid.
      this.AttrOfOper = ''; //设置字段.
      this.Tag5 = 'Self';
      if (num == 0) {
        this.DoWay = doWay;
        await this.DirectInsert(); //保存里面.
      } else {
        await this.DirectUpdate(); //保存里面.
      }
      return this;
    }

    //装载填充.
    if (buessKey === 'PageLoadFullDDL') {
      const myPKVal = mapAttrPKVal + '_' + buessKey; //组织mapExt的主键.
      this.setPKVal(myPKVal);
      const num = await this.RetrieveFromDBSources();
      this.ExtType = buessKey;
      this.ExtModel = buessKey;
      this.FK_MapData = mapAttrPKVal; //设置frmid.
      this.AttrOfOper = ''; //设置字段.
      this.Tag5 = 'Self';
      if (num == 0) {
        this.DoWay = doWay;
        await this.DirectInsert(); //保存里面.
      } else {
        await this.DirectUpdate(); //保存里面.
      }
      return this;
    }

    if (buessKey === 'TextAreaFullBlank') {
      const myPKVal = mapAttrPKVal + '_' + buessKey; //组织mapExt的主键.
      this.setPKVal(myPKVal);
      const num = await this.RetrieveFromDBSources();
      this.ExtType = buessKey;
      this.ExtModel = buessKey;
      this.FK_MapData = mapAttrPKVal; //设置frmid.
      this.AttrOfOper = ''; //设置字段.
      this.Doc = ' 请输入您的文本内容';
      if (num == 0) {
        this.DoWay = doWay;
        await this.DirectInsert(); //保存里面.
      } else {
        await this.DirectUpdate(); //保存里面.
      }
      return this;
    }

    if (buessKey === 'PageLoadFullDtl') {
      const myPKVal = mapAttrPKVal + '_' + buessKey; //组织mapExt的主键.
      this.setPKVal(myPKVal);
      const num = await this.RetrieveFromDBSources();
      this.ExtType = buessKey;
      this.ExtModel = buessKey;
      this.FK_MapData = mapAttrPKVal; //设置frmid.
      this.AttrOfOper = ''; //设置字段.
      this.Tag5 = 'Self';
      if (num == 0) {
        this.DoWay = doWay;
        await this.DirectInsert(); //保存里面.
      } else {
        await this.DirectUpdate(); //保存里面.
      }
      return this;
    }

    if (mapAttrPKVal != '') {
      const mapAttr = new MapAttr(mapAttrPKVal);
      await mapAttr.Retrieve(); //查询字段.
      const myPKVal = mapAttrPKVal + '_' + buessKey; //组织mapExt的主键.
      this.setPKVal(myPKVal);
      const num = await this.RetrieveFromDBSources();
      this.ExtType = buessKey;
      this.ExtModel = buessKey;
      this.FK_MapData = mapAttr.FK_MapData; //设置frmid.
      this.AttrOfOper = mapAttr.KeyOfEn; //设置字段.
      // this.Tag=;
      if (num == 0) {
        this.DoWay = doWay;
        if (buessKey == 'ActiveDDL' || buessKey == 'FullCtrl') this.Doc = '@Key';
        await this.DirectInsert(); //保存里面.
      } else {
        await this.DirectUpdate(); //保存里面.
      }
    }
    return this;
  }
}
const boolean2int = (b: boolean) => (b ? 1 : 0);
//业务逻辑s
export class MapExts extends EntitiesMyPK {
  /**
   * 列表Pop弹窗
   * @param attrKey 要绑定的字段
   * @param srcOfEns 数据源里诶包
   * @param ensOfCols 显示的列数.=3
   * @param IsMultipleChoice 单选？ true=单选
   * @param h 高度
   * @param w 宽度
   */
  public AddPopList(attrKey: string, srcOfEns: string, ensOfCols = 3, IsMultipleChoice = false, h = 400, w = 500) {
    const en = new PopList();
    en.ExtModel = 'Pop';
    en.ExtType = 'PopList';
    en.Tag2 = srcOfEns;
    en.AttrOfOper = attrKey;
    en.SetPara('ShowCol', ensOfCols);
    en.SetPara('IsMultipleChoice', boolean2int(IsMultipleChoice));
    en.H = h;
    en.W = w;
    this.push(en);
  }
  /**
   * 分组列表Pop弹窗
   * @param attrKey 绑定的字段
   * @param srcOfGroupEns 分组数据源
   * @param srcOfEns 列表数据源
   * @param ensOfCols 显示的列数
   * @param IsMultipleChoice 是否单项选择
   * @param h 高度
   * @param w 宽度
   */
  public AddPopGroupList(attrKey: string, srcOfGroupEns: string, srcOfEns: string, ensOfCols = 3, IsMultipleChoice = false, h = 400, w = 500) {
    const en = new PopList();
    en.ExtModel = 'Pop';
    en.ExtType = 'PopGroupList';
    en.Tag1 = srcOfGroupEns;
    en.Tag2 = srcOfEns;
    en.AttrOfOper = attrKey;
    en.SetPara('ShowCol', ensOfCols);
    en.SetPara('IsMultipleChoice', boolean2int(IsMultipleChoice));
    en.H = h;
    en.W = w;
    this.push(en);
  }

  /**
   * 树结构Pop弹窗
   * @param attrKey 绑定的字段
   * @param srcOfGroupEns 搜索数据源
   * @param srcOfEns 树干列表数据源
   * @param rootNo 树干更目录编号
   * @param IsMultipleChoice 是否单项选择
   * @param h 高度
   * @param w 宽度
   */
  public AddPopTree(attrKey: string, srcOfSearch: string, srcOfTree: string, rootNo: string, IsMultipleChoice = false, h = 400, w = 500) {
    const en = new PopList();
    en.ExtModel = 'Pop';
    en.ExtType = 'PopBranches';
    en.Tag1 = srcOfSearch; //搜索数据源
    en.Tag2 = srcOfTree; //树干列表数据源
    en.Doc = rootNo; //树干根目录编号.
    en.AttrOfOper = attrKey;
    en.SetPara('IsMultipleChoice', boolean2int(IsMultipleChoice));
    en.H = h;
    en.W = w;
    this.push(en);
  }

  get GetNewEntity(): Entity {
    return new MapExt();
  }
  constructor() {
    super();
  }
}
