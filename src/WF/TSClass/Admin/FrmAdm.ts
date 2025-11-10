import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { MapDataAttr } from '../../Admin/FrmLogic/MapData';
import BSEntity from '/@/utils/gener/BSEntity';

/// 表单 属性
export class FrmAttr extends MapDataAttr {
  //#region 基本属性
  /// <summary>
  /// 工作模式
  /// </summary>
  public static readonly FrmDictWorkModel = 'FrmDictWorkModel';
  /// <summary>
  /// 展示模式
  /// </summary>
  public static readonly EntityShowModel = 'EntityShowModel';
  /// <summary>
  /// 单据编号生成规则
  /// </summary>
  public static readonly BillNoFormat = 'BillNoFormat';
  /// <summary>
  /// 单据编号生成规则
  /// </summary>
  public static readonly TitleRole = 'TitleRole';
  /// <summary>
  /// 排序字段
  /// </summary>
  public static readonly SortColumns = 'SortColumns';
  /// <summary>
  /// 字段颜色设置
  /// </summary>
  public static readonly ColorSet = 'ColorSet';
  /// <summary>
  /// 按照指定字段的颜色显示表格行的颜色
  /// </summary>
  public static readonly RowColorSet = 'RowColorSet';
  /// <summary>
  /// 字段求和求平均设置
  /// </summary>
  public static readonly FieldSet = 'FieldSet';
  /// <summary>
  /// 关联单据
  /// </summary>
  public static readonly RefBill = 'RefBill';
  //#endregion

  //#region 隐藏属性.
  /// <summary>
  /// 要显示的列
  /// </summary>
  public static readonly ShowCols = 'ShowCols';
  public static readonly ShowColModel = 'ShowColModel';

  public static readonly ShowColMobileModel = 'ShowColMobileModel';
  public static readonly ShowMobileCols = 'ShowMobileCols';

  // #endregion 隐藏属性

  // #region 按钮信息.
  /// <summary>
  /// 按钮New标签
  /// </summary>
  public static readonly BtnNewLable = 'BtnNewLable';
  /// <summary>
  /// 按钮New启用规则
  /// </summary>
  public static readonly BtnNewModel = 'BtnNewModel';
  /// <summary>
  /// 按钮Save标签
  /// </summary>
  public static readonly BtnSaveLable = 'BtnSaveLable';
  /// <summary>
  /// 按钮save启用规则
  /// </summary>
  public static readonly BtnSaveEnable = 'BtnSaveEnable';

  public static readonly BtnSubmitLable = 'BtnSubmitLable';
  public static readonly BtnSubmitEnable = 'BtnSubmitEnable';

  /// <summary>
  /// 保存andclose
  /// </summary>
  public static readonly BtnSaveAndCloseLable = 'BtnSaveAndCloseLable';
  /// <summary>
  /// 保存并关闭.
  /// </summary>
  public static readonly BtnSaveAndCloseEnable = 'BtnSaveAndCloseEnable';

  /// <summary>
  /// 按钮del标签
  /// </summary>
  public static readonly BtnDelLable = 'BtnDelLable';
  /// <summary>
  /// 数据版本
  /// </summary>
  public static readonly BtnDataVer = 'BtnDataVer';
  /// <summary>
  /// 按钮del启用规则
  /// </summary>
  public static readonly BtnDelEnable = 'BtnDelEnable';
  /// <summary>
  /// 按钮del标签
  /// </summary>
  public static readonly BtnStartFlowLable = 'BtnStartFlowLable';
  /// <summary>
  /// 按钮del启用规则
  /// </summary>
  public static readonly BtnStartFlowEnable = 'BtnStartFlowEnable';
  /// <summary>
  /// 查询
  /// </summary>
  public static readonly BtnSearchLabel = 'BtnSearchLabel';
  /// <summary>
  /// 查询
  /// </summary>
  public static readonly BtnSearchEnable = 'BtnSearchEnable';
  /// <summary>
  /// 分析
  /// </summary>
  public static readonly BtnGroupLabel = 'BtnGroupLabel';
  /// <summary>
  /// 分析
  /// </summary>
  public static readonly BtnGroupEnable = 'BtnGroupEnable';
  //#endregion

  //#region 打印
  public static readonly BtnPrintHtml = 'BtnPrintHtml';
  public static readonly BtnPrintHtmlEnable = 'BtnPrintHtmlEnable';

  public static readonly BtnPrintPDF = 'BtnPrintPDF';
  public static readonly BtnPrintPDFEnable = 'BtnPrintPDFEnable';

  public static readonly BtnPrintRTF = 'BtnPrintRTF';
  public static readonly BtnPrintRTFEnable = 'BtnPrintRTFEnable';

  public static readonly BtnPrintCCWord = 'BtnPrintCCWord';
  public static readonly BtnPrintCCWordEnable = 'BtnPrintCCWordEnable';
  // #endregion

  //#region 按钮.
  /// <summary>
  /// 导出zip文件
  /// </summary>
  public static readonly BtnExpZip = 'BtnExpZip';
  /// <summary>
  /// 是否可以启用?
  /// </summary>
  public static readonly BtnExpZipEnable = 'BtnExpZipEnable';
  /// <summary>
  /// 关联单据
  /// </summary>
  public static readonly BtnRefBill = 'BtnRefBill';
  /// <summary>
  /// 关联单据是否可用
  /// </summary>
  public static readonly RefBillRole = 'RefBillRole';
  // #endregion 按钮.

  // #region 集合的操作.
  /// <summary>
  /// 导入Excel
  /// </summary>
  public static readonly BtnImpExcel = 'BtnImpExcel';
  /// <summary>
  /// 是否启用导入
  /// </summary>
  public static readonly BtnImpExcelEnable = 'BtnImpExcelEnable';
  /// <summary>
  /// 导出Excel
  /// </summary>
  public static readonly BtnExpExcel = 'BtnExpExcel';
  /// <summary>
  /// 导出excel
  /// </summary>
  public static readonly BtnExpExcelEnable = 'BtnExpExcelEnable';
  //#endregion 集合的操作.

  /// <summary>
  /// 行打开模式
  /// </summary>
  public static readonly RowOpenModel = 'RowOpenModel';
  public static readonly PopHeight = 'PopHeight';
  public static readonly PopWidth = 'PopWidth';
  public static readonly Tag0 = 'Tag0';
  public static readonly Tag1 = 'Tag1';
  public static readonly Tag2 = 'Tag2';
  /// <summary>
  /// 实体编辑模式
  /// </summary>
  public static readonly EntityEditModel = 'EntityEditModel';
  public static readonly SearchDictOpenType = 'SearchDictOpenType';
}

/// 表单
export class FrmAdm extends EntityNoName {
  // /// 单号格式
  // get PTable() {
  //   return this.GetValStringByKey(FrmAttr.PTable);
  // }

  constructor(no?: string) {
    super('TS.WF.Admin.FrmAdm');
    if (!!no) {
      this.setPKVal(no);
    }
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    // if (this._enMap != null)
    //   return this._enMap;
    const map = new Map('Sys_MapData', '表单属性');

    map.AddTBStringPK(FrmAttr.No, null, '表单ID', true, true, 1, 190, 20);
    map.AddTBString(MapDataAttr.PTable, null, '存储表', true, false, 0, 100, 20);
    let msg = '提示:';
    msg += `	
1. 该表单把数据存储到那个表里.`;
    msg += `	
2. 该表必须有一个int64未的OID列作为主键..`;
    msg += `	
3. 如果指定了一个不存在的表,系统就会自动创建上.`;
    map.SetHelperAlert(MapDataAttr.PTable, msg);

    map.AddTBString(MapDataAttr.Name, null, '名称', true, false, 0, 200, 20, true);
    map.AddTBInt(MapDataAttr.TableCol, 0, '显示列数', false, false);
    map.AddTBInt(MapDataAttr.FrmW, 900, '表单宽度', true, false);
    map.AddTBString(MapDataAttr.DBSrc, null, '数据源', false, false, 0, 50, 20);
    map.AddTBString(MapDataAttr.FK_FormTree, null, '目录', false, false, 0, 50, 20);
    //map.AddDDLEntities(MapDataAttr.FK_FormTree, "01", "目录", new FrmSorts(), true);
    //表单的运行类型.
    map.AddDDLSysEnum(MapDataAttr.FrmType, 0, '表单类型', true, true, 'FrmType', '@0=经典表单@3=Url表单@6=VSTOExcel表单@61=VSTOWord表单@7=实体类表单@9=WPS表单@10=章节表单');
    //表单解析 0 普通 1 页签展示
    map.AddDDLSysEnum(MapDataAttr.FrmShowType, 0, '表单展示方式', true, true, 'FrmShowType', '@0=普通方式@1=页签方式');

    map.AddTBString(MapDataAttr.Icon, 'icon-doc', '图标', true, false, 0, 100, 100);
    map.AddDDLSysEnum(MapDataAttr.EntityType, 0, '业务类型', true, true, 'EntityType', '@0=独立表单@1=单据@2=Dict实体@3=Tree实体@5=EntityNoName实体@100=数据源实体');

    map.AddBoolean('IsEnableJs', false, '是否启用自定义js函数？', false, false, false);

    map.AddTBString(MapDataAttr.Designer, null, '设计者', true, false, 0, 500, 20);
    map.AddTBString(MapDataAttr.DesignerContact, null, '联系方式', true, false, 0, 500, 20);
    map.AddTBString(MapDataAttr.DesignerUnit, null, '单位', true, false, 0, 500, 20, true);
    map.AddTBString(MapDataAttr.GUID, null, 'GUID', true, true, 0, 128, 20, false);
    map.AddTBString(MapDataAttr.Ver, null, '版本号', true, true, 0, 30, 20);
    map.AddTBString(MapDataAttr.Note, null, '备注', true, false, 0, 400, 100, true);
    map.AddTBInt(MapDataAttr.Idx, 100, '序号', false, false);

    this._enMap = map;
    return this._enMap;
  }

  public DoGenerFrmEmps() {
    return '执行成功';
  }

  public DoExps() {
    return '执行成功';
  }

  public DoReloadRptData() {
    return '成功执行..';
  }

  public DoGenerTitle() {
    return '成功执行..';
  }
  protected override async beforeDelete(): Promise<boolean> {
    const en = new BSEntity('BP.Sys.MapData', this.No);
    await en.Delete();
    return true;
  }
}

/**
 * 表单s
 */
export class FrmAdms extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new FrmAdm();
  }

  constructor() {
    super();
  }
}
