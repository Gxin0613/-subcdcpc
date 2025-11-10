import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MapAttr, MapAttrAttr } from './MapAttr';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { GPE_Pop } from '../MapExt/Pop/GPE_Pop';
import { GPE_TBFullCtrl } from '../MapExt/TBFullCtrl/GPE_TBFullCtrl';
import { GPE_MultipleChoiceSearch } from '../MapExt/MultipleChoiceSearch/GPE_MultipleChoiceSearch';
import { GPE_MultipleChoiceSmall } from '../MapExt/MultipleChoiceSmall/GPE_MultipleChoiceSmall';
import { GPE_SingleChoiceSmall } from '../MapExt/SingleChoiceSmall/GPE_SingleChoiceSmall';
import { GPE_FieldNameLink } from '../MapExt/FieldNameLink/GPE_FieldNameLink';
import { GPE_QRCode } from '../MapExt/QRCode/GPE_QRCode';
import { BindFunctions } from '../MapExt/BindFunction/BindFunction';
import { GPE_FastInput } from '../MapExt/FastInput/GPE_FastInput';
import { MapExtAttr } from '../MapExt';
import { GPE_ReadOnlyLink } from '../MapExt/ReadOnlyLink/GPE_ReadOnlyLink';
import BSEntity from '/@/utils/gener/BSEntity';
import Events from '/@/utils/Events';
import { GPE_KeepSecret } from '../MapExt/GPE_KeepSecret';
import { GPE_FieldFormat } from '../MapExt/GPE_FieldFormat';
import { DataType } from '/@/bp/en/DataType';
import { GPN_String2SFSSQL } from './GPN_String2SFSSQL';
import { GPE_Cascader } from '../MapExt/GPE_Cascader';
import { GPE_FieldPopShowDtl } from '../MapExt/FieldPopShowDtl/GPE_FieldPopShowDtl';
import { GPE_FieldDefVal } from '/@/WF/Admin/FrmLogic/MapExt/GPE_FieldDefVal';
import { GPE_GenerDBSrcSearch } from '/@/CCFast/GenerDBSrc/GPE_GenerDBSrcSearch';

/// <summary>
/// 字段属性
/// </summary>
export class MapAttrString extends EntityMyPK {
  public static readonly SQLOfGroupAttr = '';

  constructor(mypk?: string) {
    super('TS.FrmUI.MapAttrString');
    this.RefEnName = 'BP.Sys.FrmUI.MapAttrString';
    if (!!mypk) this.MyPK = mypk;
  }

  /// <summary>
  /// 实体的权限控制
  /// </summary>
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
    const map = new Map('Sys_MapAttr', '文本字段');

    map.AddGroupAttr('基本设置');
    map.AddMyPK();
    map.AddTBString(MapAttrAttr.FK_MapData, null, '表单ID', false, false, 1, 100, 20);
    map.AddTBString(MapAttrAttr.Name, null, '字段中文名', true, false, 0, 200, 20, true);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '字段名', true, true, 1, 200, 20);

    //默认值.
    // const sql = "SELECT No,Name FROM Sys_GloVar WHERE GroupKey='DefVal'";
    //显示的分组.
    map.AddTBString('ExtDefVal', '0', '系统默认值', false, false, 0, 200, 20, true);
    map.AddTBString(MapAttrAttr.DefVal, null, '默认值表达式', false, false, 0, 400, 20, true);
    //map.SetHelperAlert(MapAttrAttr.DefVal, '可以编辑的字段设置默认值后，保存时候按照编辑字段计算.');

    map.AddTBInt(MapAttrAttr.MinLen, 0, '最小长度', true, false);
    map.AddTBInt(MapAttrAttr.MaxLen, 50, '最大长度', true, false);
    map.SetHelperAlert(MapAttrAttr.MaxLen, '定义该字段的字节长度.');
    // map.AddDDLStringEnum(MapAttrAttr);
    map.AddBoolean(MapAttrAttr.UIVisible, true, '是否可见？', true, true);
    map.SetHelperAlert(MapAttrAttr.UIVisible, '对于不可见的字段可以在隐藏功能的栏目里找到这些字段进行编辑或者删除.');
    map.AddBoolean(MapAttrAttr.UIIsEnable, true, '是否可编辑？', true, true);
    map.SetHelperAlert(MapAttrAttr.UIIsEnable, '不可编辑,让该字段设置为只读.');
    map.AddBoolean(MapAttrAttr.UIIsInput, false, '是否必填项？', true, true);
    map.AddBoolean('IsEncrypt', false, '是否加密保存到数据库', true, true);
    map.SetHelperAlert('IsEncrypt', '保存数据库加密,展示时解密,需要客户在DataUser/OverrideFiles/CCFormRef.ts中自定义处理加密解密功能.');
    //map.AddDDLSysEnum('DefValRole', 1, '默认值加载模式', true, true, '', '@1=只加载一次@2=每次打开页面重新加载@3=字段只读的时候重新加载');
    //map.AddBoolean(MapAttrAttr.IsRichText, false, '是否富文本？', true, true);
    //map.SetHelperAlert(MapAttrAttr.IsRichText, '以html编辑器呈现或者编写字段.');
    //map.AddBoolean(MapAttrAttr.IsSecret, false, '是否保密？', true, true);
    //map.AddBoolean(MapAttrAttr.IsSupperText, false, '是否大块文本？(是否该字段存放的超长字节字段)', true, true, true);
    //map.SetHelperAlert(MapAttrAttr.IsSupperText, '大块文本存储字节比较长，超过4000个字符.');
    // map.AddDDLSysEnum(MapAttrAttr.IsSigan, 0, '签名模式', true, true, MapAttrAttr.IsSigan, '@0=无@1=图片签名@2=山东CA@3=广东CA@4=图片盖章');
    //map.SetHelperAlert(MapAttrAttr.IsSigan, '图片签名,需要的是当前是只读的并且默认值为@WebUser.No,其他签名需要个性化的编写数字签章的集成代码.');

    // map.AddBoolean('EnableAG', false, '自动生成编号', true, true, true);
    // map.AddDDLStringEnum('AGPrefixRule', 'userNo', '编号前缀', '@userNo=登录用户id@username=登录用户名', true);
    // map.SetHelperAlert('AGPrefixRule', '自定义前缀配置时，规则无效');
    // map.AddTBString('AGCustomPrefix', null, '自定义前缀', true, false, 0, 400, 20, false);
    // map.AddDDLSysEnum('AGRule', 1, '编号规则', true, true, '', '@1=前缀+编号@2=前缀+年+编号@3=前缀+年+月+编号@4=前缀+年+月+日+编号');
    map.AddGroupAttr('外观设置');
    map.AddTBFloat(MapAttrAttr.UIWidth, 100, '宽度', true, false);
    map.SetHelperAlert(MapAttrAttr.UIWidth, '对实体、单据表格列展示有效,显示文本框的宽度.');
    map.AddTBFloat(MapAttrAttr.UIHeight, 23, '高度', true, false);
    map.AddTBString(MapAttrAttr.Icon, null, '图标', true, false, 0, 50, 20, true);
    map.AddTBString(MapAttrAttr.Tip, null, '激活提示', true, false, 0, 400, 20, true);
    map.SetHelperAlert(MapAttrAttr.Tip, '在文本框输入的时候显示在文本框背景的提示文字,也就是文本框的 placeholder 的值.');
    map.AddBoolean('IsLabLine', false, '移动端:标题独占一行?', true, true);
    map.AddTBInt(MapAttrAttr.EditType, 0, "编辑类型", false, false);

    map.ParaFields = ',IsLabLine,IsEncrypt,';
    map.AddTBAtParas(4000);

    //map.AddTBString("CSSLabel", null, "标签样式css", true, false, 0, 400, 20, true);
    //map.AddTBString("CSSCtrl", null, "控件样式css", true, false, 0, 400, 20, true);
    //CCS样式.
    //map.AddDDLSQL(MapAttrAttr.CSS, "0", "控件样式", MapAttrString.SQLOfCSSAttr, true);

    map.AddGroupMethod('基本设置');
    map.AddRM_GPE(new GPE_FieldDefVal(), 'icon-eye');
    map.AddRM_GPE(new GPE_Pop(), 'icon-notebook');
    map.AddRM_GPE(new GPE_Cascader(), 'icon-feed');

    map.AddRM_GPE(new GPE_TBFullCtrl(), 'icon-energy');
    map.AddRM_GPE(new GPE_FastInput(), 'icon-pencil');
    map.AddRM_GPE(new GPE_FieldNameLink(), 'icon-paper-clip');
    map.AddRM_GPE(new GPE_ReadOnlyLink(), 'icon-link');
    map.AddRM_GPE(new GPE_FieldFormat(), 'icon-fire');

    map.AddRM_GPE(new GPE_QRCode(), 'icon-docs');
    map.AddRM_DtlSearch('事件绑函数', new BindFunctions(), MapExtAttr.RefPKVal, '', '', '', 'icon-puzzle', false, '&ExtModel=BindFunction');
    map.AddRM_GPE(new GPE_KeepSecret(), 'icon-key');

    map.AddRM_GPE(new GPE_FieldPopShowDtl(), 'icon-link'); //数据pop设置

    map.AddGroupMethod('选择输入');
    map.AddRM_GPE(new GPE_MultipleChoiceSmall(), 'icon-equalizer');
    map.AddRM_GPE(new GPE_GenerDBSrcSearch(), 'icon-settings', '', '小范围多选2025', '&MarkID=MultipleChoiceSmall&DBModel=SFTable');

    map.AddRM_GPE(new GPE_SingleChoiceSmall(), 'icon-info');
    map.AddRM_GPE(new GPE_GenerDBSrcSearch(), 'icon-settings', '', '小范围单选2025', '&MarkID=SingleChoiceSmall&DBModel=SFTable');

    map.AddRM_GPE(new GPE_MultipleChoiceSearch(), 'icon-magnifier');

    //map.AddRM_GPE(new GPE_SingleChoiceSmall(), 'icon-docs', '_FastInput');
    //  map.AddRM_DtlSearch('正则表达式', new RegularExpressions(), MapExtAttr.RefPKVal, '', '', 'Tag,Doc,Tag1', 'icon-settings', false, '&ExtModel=RegularExpression');

    map.AddGroupMethod('高级设置');
    const rm13 = new RefMethod();
    rm13.Title = '字段重命名';
    rm13.ClassMethod = 'DoRenameField';
    rm13.HisMap.AddTBString('key1', '@KeyOfEn', '字段重命名为?', true, false, 0, 100, 100);
    rm13.RefMethodType = RefMethodType.Func;
    rm13.Warning = '如果是节点表单,系统就会把该流程上的所有同名的字段都会重命名,包括NDxxxRpt表单.';
    rm13.Icon = 'icon-refresh';
    map.AddRefMethod(rm13);

    const rm15 = new RefMethod();
    rm15.Title = '中文名重命名';
    rm15.ClassMethod = 'DoRenameCH';
    rm15.HisMap.AddTBString('key1', '@Name', '字段重命名为?', true, false, 0, 100, 100);
    rm15.RefMethodType = RefMethodType.Func;
    rm15.Warning = '如果是节点表单,系统就会把该流程上的所有同名的字段都会重命名,包括NDxxxRpt表单.';
    rm15.Icon = 'icon-refresh';
    map.AddRefMethod(rm15);

    const rm141 = new RefMethod();
    rm141.Title = '类型强制转换';
    rm141.ClassMethod = 'DoTurnQZFieldType';
    rm141.HisMap.AddDDLSysEnum('key1', 1, '数据类型', true, true, 'MyDataType');
    //const ms1g = `
    //####  输入类型:格式:int,float,double,date,datetime,boolean,money `;
    //rm141.HisMap.AddTBString('key1', 'int', ms1g, true, false, 0, 100, 100, true, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=10327592&doc_id=31094');
    rm141.RefMethodType = RefMethodType.Func;
    rm141.Warning = 'string类型转化为枚举,请先转为int,由int转枚举,';
    rm141.Icon = 'icon-directions';
    map.AddRefMethod(rm141);
    //转化为数据源字段.
    map.AddRM_GPN(new GPN_String2SFSSQL(), 'icon-list');

    const rm133 = new RefMethod();
    rm133.Title = '转成签批组件';
    rm133.ClassMethod = 'DoTurn2Check';
    rm133.RefMethodType = RefMethodType.Func;
    rm133.Warning = '确定要执行吗？执行后关闭窗口，刷新一下设计器.';
    rm133.Icon = 'icon-refresh';
    map.AddRefMethod(rm133);

    this._enMap = map;
    return this._enMap;
  }
  public HelpZhuanHuan = `
  #### 说明 
  - 输入类型:格式:int,float,double,date,datetime,boolean,money
   -  string类型的字段转化为数值类型的字段，如果已经有非数值数据可能会错误，导致转化失败.
   -  转化之前，系统讲把 null 或者为空白字符 数据设置为 '0', 执行转换.
   -  如果转化失败：系统将按照如下步骤处理.
   -  1. 把该字段重命名,比如:ABC1.
   -  2. 创建一个同名的指定转换类型的字段.
   -  3. 遍历ABC1 数据，进行对应ABC字段转换更新，更新不成功的设置为0.
  `;
  protected override async beforeUpdateInsertAction(): Promise<boolean> {
    if (this.ExtDefVal === 'DefVal') {
    } else if (this.ExtDefVal != '0' && this.ExtDefVal != 'SQL' && this.UIIsEnable == '0') {
      this.DefVal = this.ExtDefVal;
    }
    if (this.ExtDefVal == '0') this.DefVal = '';
    return true;
  }
  public async DoRenameField(val: string) {
    if (this.KeyOfEn === val) return 'err@字段没有重命名';
    const en = await new BSEntity('BP.Sys.FrmUI.MapAttrString', this.MyPK);
    await en.Retrieve();
    const result = await en.DoMethodReturnString('DoRenameField', val);
    Events.emit('reloadForm');
    return result;
  }
  public async DoTurn2Check() {
    const mapattr = new MapAttr(this.MyPK);
    await mapattr.RetrieveFromDBSources();
    mapattr.UIContralType = 14;
    await mapattr.Update();
    return '执行成功，请关闭页面，刷新F5设计器。';
  }

  public async DoRenameCH(val: string) {
    if (this.Name === val) return 'err@请输入不同的名字.';
    const en = await new BSEntity('BP.Sys.FrmUI.MapAttrString', this.MyPK);
    await en.Retrieve();
    const result = await en.DoMethodReturnString('DoRenameCH', val);
    Events.emit('reloadForm');
    return result;
  }

  public async DoTurnFieldType(val: string) {
    const sysAttr = new BSEntity('BP.Sys.MapAttr', this.MyPK);
    await sysAttr.Init();
    await sysAttr.RetrieveFromDBSources();

    if (!!val) {
      let type: any = 0;
      if (val.toLocaleLowerCase() == 'date') type = DataType.AppDate;
      if (val.toLocaleLowerCase() == 'datetime') type = DataType.AppDateTime;
      if (val.toLocaleLowerCase() == 'int') type = DataType.AppInt;
      if (val.toLocaleLowerCase() == 'boolean') type = DataType.AppBoolean;
      if (val.toLocaleLowerCase() == 'float') type = DataType.AppFloat;
      if (val.toLocaleLowerCase() == 'money') type = DataType.AppMoney;
      const msg = await sysAttr.DoMethodReturnString('DoTurnFieldType', type);
      return msg;
    }
    return '请输入字段转换类型';
  }

  public async DoTurnQZFieldType(val: number) {
    const sysAttr = new BSEntity('BP.Sys.MapAttr', this.MyPK);
    await sysAttr.Init();
    await sysAttr.RetrieveFromDBSources();
    if (val == sysAttr.MyDataType) return '转换的类型和字段类型一致';
    if (!!val) {
      const msg = await sysAttr.DoMethodReturnString('DoTurnQZFieldType', val.toString());
      return msg;
    }
    return '请输入字段转换类型';
  }
}
