import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName, EntityNoName } from '/@/bp/en/EntityNoName';
import { MapDtlAttr } from '../MapDtl';
import { GPE_ListShowModel } from './ListShowModel/GPE_ListShowModel';
import { GPE_EditModel } from './EditModel/GPE_EditModel';
import { GPE_PCShowCols } from './PCShowCols/GPE_PCShowCols';
import { GPE_MobileShowCols } from './MobileShowCols/GPE_MobileShowCols';
import { GPE_PageLoadFullDtl } from '../MapData/PageLoadFull/GPE_PageLoadFullDtl';
import { GPE_DtlImp } from '../DtlSetting/GPE_DtlImp';
import { GPN_ImpDtlAttrs } from './GPN_ImpDtlAttrs';
import { MapAttr } from '../MapAttrs/MapAttr';
import { GPE_DtlSearchKey } from '/@/WF/Admin/FrmLogic/MapDtl/SearchCond/GPE_DtlSearchKey';
import { SearchFKEnumAttr, SearchFKEnums } from '/@/CCFast/CCBill/Admin/SearchCond/SearchFKEnum';
import { GPE_DtlDTSearchWay } from '/@/WF/Admin/FrmLogic/MapDtl/SearchCond/GPE_DtlDTSearchWay';
import { GPE_IsBatchUpdate } from './GPE_IsBatchUpdate';
import { GPE_DtlOpenType } from './GPE_DtlOpenType';
import { GloWF } from '../../GloWF';
import { GPE_DtlVSTOEditModel } from '../GPE_DtlVSTOEditModel';
import { message } from 'ant-design-vue';
import { SysEventAttr, SysEvents } from '/@/WF/Admin/FrmLogic/MapData/FrmEvent/SysEvent';
import { GPE_GenerDBSrcSearch } from '/@/CCFast/GenerDBSrc/GPE_GenerDBSrcSearch';

// 从表属性
export class MapDtlExt extends EntityNoName {
  constructor(no?: string) {
    super('TS.Frm.MapDtlExt', 'BP.WF.Template.Frm.MapDtlExt');
    this.setPKVal(no);
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
    const map = new Map('Sys_MapDtl', '从表属性');
    map.AddGroupAttr('基础信息');
    // #region 基础信息.
    map.AddTBStringPK(MapDtlAttr.No, null, '编号', true, false, 1, 100, 20);
    map.AddTBString(MapDtlAttr.Name, null, '名称', true, false, 1, 200, 20);
    map.AddTBString(MapDtlAttr.Alias, null, '别名', true, false, 0, 100, 20, false, '用于Excel表单有效');

    map.AddTBString(MapDtlAttr.FK_MapData, null, '表单ID', true, true, 0, 100, 20);
    map.AddDDLSQL(MapDtlAttr.DBSrc, null, '数据源', 'DBSrc_DBSrc', true);
    map.AddTBString(MapDtlAttr.PTable, null, '存储表', true, false, 0, 200, 20, false, '默认与编号为同一个存储表');
    const helpPageSize = `
  #### 帮助
   - 默认为0不分页。
   - 输入数值，对应值为从表一页条数的界限进行分页，例子：输入的5，如下图从表就按5条为界限进行分页。
  #### 效果图
   ![输入图片说明](./resource/WF/Admin/FrmLogic/MapDtl/PageSize/pageSize.png "屏幕截图.png") `;

    map.AddTBInt('PageSize', 0, '分页', true, false, false, helpPageSize);

    map.AddBoolean(MapDtlAttr.IsReadonly, false, '是否只读？', true, true);
    map.AddBoolean(MapDtlAttr.IsShowTitle, true, '是否显示标题？', true, true);

    map.AddBoolean(MapDtlAttr.IsView, true, '是否可见？', true, true);

    map.AddBoolean(MapDtlAttr.IsInsert, true, '是否可以插入行？', true, true);
    map.AddBoolean(MapDtlAttr.IsDelete, true, '是否可以删除行？', true, true);
    map.AddBoolean(MapDtlAttr.IsUpdate, true, '是否可以更新？', true, true);

    map.AddBoolean(MapDtlAttr.IsCopyThisData, false, '是否可以复制行数据？', true, true);
    //map.AddBoolean(MapDtlAttr.IsImp, false, '是否可以导出？', true, true);
    let cfg = '@0=不导出';
    cfg += '@1=通用导出';
    cfg += '@2=按照约定的Rtf模版导出(DataUserTempleteOfExpEnName.rtf)';
    cfg += '@3=按照约定的excel模版导出(DataUserTempleteOfExpEnName.xlsx)';

    map.AddDDLSysEnum('IsImp', 0, 'Excel导出规则', true, true, 'EnsExpModel', cfg);

    map.AddBoolean(MapDtlAttr.IsCopyFirstData, false, '是否复制第一行数据？', true, true);
    map.AddBoolean(MapDtlAttr.IsFullShow, false, '是否可以全屏显示', true, true);
    const help1 = ` #### 帮助 
    - 制作 excel模板, 放入到: \DataUser\TempleteOfImp\从表ID.xls
   - 在excel模板中填写数据.
   - 执行导入
   #### 说明
   - 系统首先检查数据是否正确，如果有非法的数据，系统就会 0 导入.
   #### 检查内容：
    1. 数值类型的字段是否为空合法.
    1. 日期字段格式是否合理. 
    1. 枚举字段是否完整,比如：性别字段，枚举是男,女. 
    1. 外键字段(外部数据源)是否符合要求. `;
    map.AddBoolean(MapDtlAttr.IsExcelExp, false, '是否启用Excel导入？', true, true, false, help1);

    const help2 = ` #### 帮助 
   - 发票扫描是通过OCR技术上传的发票扫描到从表数据里.
   - 若启用该组件，您需要点击从表自定义控件，插入发票组件.
   - 在执行加入后，系统自动启用该选项，在不需要扫描的节点，或者只读的情况下，不允许导入。
     `;
    map.AddBoolean('IsInvoice', false, '是否启用发票扫描？', true, true, false, help2);

    const help = `#### 行初始化字段
- 定义：初始化从表数据时，支持以枚举或外键字段为维度进行行数据的自动生成。
- 适用场景：当从表存在如性别、科目等枚举或外键字段时，可根据该字段的所有可选值，自动为每个值生成一行初始化数据。
- 示例1：若从表有“性别”字段，配置后将自动生成一行“男生”数据和一行“女生”数据。
- 示例2：若从表有“科目”字段，配置后将自动生成一行“语文”、一行“数学”、一行“英语”等数据。
- 使用此功能可提升数据初始化效率，确保每个枚举/外键值均有对应的行数据。`;
    map.AddTBString(MapDtlAttr.InitDBAttrs, null, '行初始化字段', true, false, 0, 40, 20, false, help);
    map.SetPopList(MapDtlAttr.InitDBAttrs, GloWF.SQLOfFrmMapDtlFKEnumColumn('@No'), false, '500', '600', '选择字段'); //pop返回值.
    map.AddTBInt(MapDtlAttr.RowsOfList, 0, '初始化行数', true, false, false, '装载时默认显示的行数,方便填写数据,不能与初始化字段同时使用.');
    map.AddDDLSysEnum(MapDtlAttr.WhenOverSize, 0, '超出行数', true, true, MapDtlAttr.WhenOverSize, '@0=不处理@1=向下顺增行@2=次页显示');

    const helpMobileShowModel = `
  #### 新页面展示模式
   ![输入图片说明](./resource/WF/Admin/FrmLogic/MapDtl/MobileShowModel/XinYeMian.png "屏幕截图.png")
  #### 列表模式
   ![输入图片说明](./resource/WF/Admin/FrmLogic/MapDtl/MobileShowModel/LieBiao.png "屏幕截图.png") `;

    //移动端数据显示方式
    //map.AddDDLSysEnum(MapDtlAttr.MobileShowModel, 0, '移动端数据显示方式', true, true, MapDtlAttr.MobileShowModel, '@0=新页面显示模式@1=列表模式', helpMobileShowModel);
    //map.AddTBString(MapDtlAttr.MobileShowField, null, '移动端列表显示字段', true, false, 0, 100, 20, false);

    //要显示的列.
    const help4 = '默认为空,全部显示,如果配置了就按照配置的计算,格式为:field1,field2';
    map.AddTBString(MapDtlAttr.ShowCols, null, '显示的列', true, false, 0, 500, 20, true, help4);

    const fixedColHelpDocs = '配置后将在从表左侧显示固定列(不随滚动条滚动)，格式为:field1,field2,field3';
    map.AddTBString(MapDtlAttr.FixedCols, null, '固定列（左侧）', true, false, 0, 500, 20, true, fixedColHelpDocs);
    map.AddTBString(MapDtlAttr.GUID, null, 'GUID', false, false, 0, 128, 20);

    // 为浙商银行设置从表打开.翻译.
    map.AddDDLSysEnum(MapDtlAttr.ListShowModel, 0, '列表数据显示格式', false, true, MapDtlAttr.ListShowModel, '@0=表格@1=卡片@2=自定义Url');
    map.AddDDLSysEnum(MapDtlAttr.EditModel, 0, '编辑数据方式', true, true, MapDtlAttr.EditModel, '@0=表格模式@1=经典表单');
    map.SetHelperAlert(MapDtlAttr.EditModel, '根据选择的编辑数据方式，表格模式下新建行直接在表格内编辑，经典表单模式下新建时弹出卡片进行编辑。');
    map.AddTBString(MapDtlAttr.UrlDtl, null, '自定义Url', true, false, 0, 200, 20, true);
    // #endregion 基础信息.

    // 2014-07-17 for xinchang bank.
    // map.AddGroupAttr('导入填充');
    map.AddDDLSysEnum(MapDtlAttr.ImpModel, 0, '导入方式', false, false, MapDtlAttr.ImpModel, '@0=不导入@1=按配置模式导入@2=按照xls文件模版导入');
    map.AddTBStringDoc(MapDtlAttr.ImpSQLInit, null, '初始化SQL(初始化表格的时候的SQL数据,可以为空)', false, false, true);
    map.AddTBStringDoc(MapDtlAttr.ImpSQLSearch, null, '查询SQL(SQL里必须包含@Key关键字.)', false, false, true);
    map.AddTBStringDoc(MapDtlAttr.ImpSQLFullOneRow, null, '数据填充一行数据的SQL(必须包含@Key关键字,为选择的主键)', false, false, true);
    map.AddTBString(MapDtlAttr.ImpSQLNames, null, '列的中文名称', false, false, 0, 900, 20, true);
    map.AddBoolean(MapDtlAttr.IsExp, true, '是否可以导入？', false, true);

    map.AddGroupAttr('超链接');
    map.AddBoolean(MapDtlAttr.IsEnableLink, false, '相关功能1', true, true);
    map.AddTBString(MapDtlAttr.LinkLabel, '', '超连接/功能标签', true, false, 0, 50, 100);
    map.AddDDLSysEnum(MapDtlAttr.ExcType, 0, '执行类型', true, true, 'ExcType', '@0=超链接@1=函数');
    map.AddTBString(MapDtlAttr.LinkTarget, null, 'LinkTarget', true, false, 0, 10, 100);
    map.AddTBString(MapDtlAttr.LinkUrl, null, '连接/函数', true, false, 0, 200, 200, true);
    map.SetHelperAlert(
      MapDtlAttr.LinkUrl,
      `LinkTarget=_blank时，连接的地址需要配置路由地址，LinkTarget=空时，连接地址的配置方式①包含.vue的路径,需要/src/开头②配置路由地址，Model方式打开，例如：/src/WF/CCForm/FrmWork.vue?FrmID=XXX&WorkID=XX`,
    );

    map.AddBoolean(MapDtlAttr.IsEnableLink2, false, '相关功能2', true, true);
    map.AddTBString(MapDtlAttr.LinkLabel2, '', '超连接/功能标签', true, false, 0, 50, 100);
    map.AddDDLSysEnum(MapDtlAttr.ExcType2, 0, '执行类型', true, true, 'ExcType', '@0=超链接@1=函数');
    map.AddTBString(MapDtlAttr.LinkTarget2, null, 'LinkTarget', true, false, 0, 10, 100);
    map.AddTBString(MapDtlAttr.LinkUrl2, null, '连接/函数', true, false, 0, 200, 200, true);

    map.AddGroupAttr('外观');
    const help3 = '用于控制输入的行数据最小值，比如：从表不能为空，就是用这个模式。 ';
    map.AddTBInt(MapDtlAttr.NumOfDtl, 0, '最小行数', true, false, false, help3);
    //用于控制经典表单.
    map.AddTBFloat(MapDtlAttr.H, 350, '高度', true, false, false, '对经典表单有效');
    //const help2 = `用于计算指定列字段求和/求平均例如：@ShuLiang=Sum@DanJia=Sum@XiaoJi=Sum`;
    //map.AddTBString(MapDtlAttr.ColAutoExp, null, '列字段计算', true, false, 0, 200, 20, true, help2);
    map.AddDDLSysEnum(MapDtlAttr.Model, 0, '工作模式', true, true, MapDtlAttr.Model, '@0=普通@1=固定行');
    map.AddBoolean(MapDtlAttr.IsEnableGroupField, false, '是否启用分组字段', true, true);
    //map.AddBoolean(MapDtlAttr.IsShowSum, true, '是否显示合计？', true, true);
    map.AddBoolean(MapDtlAttr.IsShowIdx, true, '是否显示序号？', true, true);

    const help5 = '使用场景：当从表只读时，需要根据字段里的内容进行排序；配置：多个排序字段英文逗号(,)分割';
    map.AddTBString('OrderField', null, '只读排序', true, false, 0, 30, 30, false, help5);

    map.AddGroupAttr('编程');
    map.AddTBString(MapDtlAttr.FEBD, null, '事件类实体类', true, true, 0, 100, 20, false);
    //对显示的结果要做一定的限制.
    const url1 = 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=4711478&doc_id=31094';
    map.AddTBString(MapDtlAttr.FilterSQLExp, null, '过滤数据SQL表达式', true, false, 0, 200, 20, true, url1);
    //对显示的结果要做一定的限制.
    const url2 = '格式1: MyFile1,MyField2 ,格式2: MyFile1 DESC  就是SQL语句的 Ordery By 后面的字符串，默认按照 OID (输入的顺序)排序.';
    map.AddTBString(MapDtlAttr.OrderBySQLExp, null, '排序字段', true, false, 0, 200, 20, true, url2);

    const url3 = 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=8232229&doc_id=31094';
    map.AddTBString('Btns', null, '头部按钮', true, false, 0, 200, 20, true, url3);

    map.AddGroupAttr('工作流相关');
    map.AddBoolean(MapDtlAttr.IsCopyNDData, true, '是否允许copy节点数据', true, true);
    map.AddTBInt(MapDtlAttr.FK_Node, 0, '节点(用户独立表单权限控制)', false, false);
    map.AddBoolean(MapDtlAttr.IsHLDtl, false, '是否是合流汇总', true, true);
    // const sql = `SELECT KeyOfEn as No, Name FROM Sys_MapAttr  WHERE FK_MapData='@No' AND  ( (MyDataType =1 and UIVisible=1 ) or (UIContralType=1))`;
    map.AddDDLSQL(MapDtlAttr.SubThreadWorker, null, '子线程处理人字段', GloWF.SQLOfSubThreadWorker(), true);
    map.AddBoolean(MapDtlAttr.IsEnablePass, false, '是否启用通过审核功能?', true, true);
    map.AddTBString(MapDtlAttr.GroupField, null, '分组字段', true, true, 0, 300, 20);

    //存储到参数字段里面.
    map.ParaFields = ',IsFullShow,IsExcelExp,IsInvoice,OrderField,PageSize,DBSrc,';
    map.AddTBAtParas(3000);

    //装在填充.
    map.AddGroupMethod('PC设置');
    map.AddRM_GPE(new GPE_ListShowModel(), 'icon-screen-desktop'); //显示模式.
    map.AddRM_GPE(new GPE_EditModel(), 'icon-note'); //编辑模式.
    map.AddRM_GPE(new GPE_PCShowCols(), 'icon-social-spotify'); //PC端显示的字段.
    map.AddRM_UrlTabOpen('多表头', '/@/WF/views/Comm/MultiTitle.vue?DoType=Dtl');
    // 进入经典表单设计器.
    map.AddRM_UrlLinkeWinOpen('设计经典表单', '/#/WF/Designer/Form?FrmID=@No&FrmName=@Name&IsDtl=1');

    //装载填充.
    map.AddRM_GPE(new GPE_GenerDBSrcSearch(), 'icon-login', '', '装载填充从表', '&MarkID=PageLoadFullDtl');
    map.AddRM_DtlSearch('从表事件', new SysEvents(), SysEventAttr.RefPKVal, '', '', SysEventAttr.ShowAttrs, 'icon-grid');

    // 从表导入
    map.AddRM_GPE(new GPE_DtlImp(), 'icon-map', '_DtlImp');

    //批量编辑规则
    map.AddRM_GPE(new GPE_IsBatchUpdate(), 'icon-note');

    // 数据开放规则
    map.AddRM_GPE(new GPE_DtlOpenType(), 'icon-note'); //编辑模式.

    map.AddRM_GPE(new GPE_DtlVSTOEditModel(), 'icon-note'); //编辑模式.

    //导入字段.
    map.AddRM_GPN(new GPN_ImpDtlAttrs(), 'icon-drop');
    map.AddRM_EnOnly('分组设置', 'TS.FrmUI.GroupField', '@GroupField', 'icon-credit-card');

    //请输入要导入的从表ID.
    map.AddGroupMethod('移动配置');
    map.AddRM_GPE(new GPE_MobileShowCols(), 'icon-drop'); //PC端显示的字段.

    map.AddGroupMethod('查询条件');
    //关键字查询模式.
    map.AddRM_GPE(new GPE_DtlSearchKey(), 'icon-drop');
    //外键枚举查询条件
    map.AddRM_DtlSearch('外键枚举查询条件', new SearchFKEnums(), SearchFKEnumAttr.FrmID, '', '', '', 'icon-drop', true);
    //日期查询方式
    map.AddRM_GPE(new GPE_DtlDTSearchWay(), 'icon-drop');

    this._enMap = map;
    return this._enMap;
  }

  override async beforeUpdateInsertAction(): Promise<boolean> {
    if (this.InitDBAttrs) {
      const initColumns = this.InitDBAttrs;
      if (initColumns.indexOf(',') !== -1) {
        message.warning('行初始化字段不能包含逗号,请您修改后重新保存.');
        return Promise.resolve(false);
      }
      const mapAttr = new MapAttr();
      mapAttr.MyPK = this.No + '_' + this.InitDBAttrs;
      const val = await mapAttr.RetrieveFromDBSources();
      if (val == 0) {
        message.warning('您的’行初始化字段‘配置有误，在MapAttr没有找到[' + this.InitDBAttrs + ']字段，请您修改后重新保存.');
        return Promise.resolve(false);
      }

      if (mapAttr.UIIsEnable == 1) {
        //如果启用.
        mapAttr.UIIsEnable = 0; //设置不启用.
        mapAttr.UIVisible = 1;
        await mapAttr.Update();
      }
      this.IsInsert = false;
      this.IsDelete = false;
    }

    if (this.InitDBAttrs && parseInt(this.RowsOfList) != 0) {
      message.warning('配置项‘行初始化字段’与‘初始化行数’不同同时设置，请您修改后重新保存.');
      this.RowsOfList = 0;
      return Promise.resolve(false);
    }

    return Promise.resolve(true);
  }
}
/**
 * 从表属性s
 */
export class MapDtlExts extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new MapDtlExt();
  }
  constructor() {
    super();
  }
}
