import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { MapDataAttr } from '../MapData';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { FrmPrintTemplates } from '../PrintTemplate/FrmPrintTemplate';
import { MapDataVerAttr, MapDataVers } from './MapDataVer/MapDataVer';
import { MapAttrAttr, MapAttrs } from '../MapAttrs/MapAttr';
import { AttrStrings } from './AttrString';
import { AttrHides } from './AttrHide';
import { AttrEnums } from './AttrEnum';
import { AttrNums } from './AttrNum';
import { AttrSFSQLs } from './AttrSFSQL';
import { AttrDTs } from './AttrDT';
import { GPE_FrmReferencePanel } from './FrmReferencePanel/GPE_FrmReferencePanel';
import { GPN_FrmExpImp } from '../ImpExp/GPN_FrmExpImp';
import { GroupFieldAttr } from '../GroupField';
import { GroupFieldLangs } from '../GroupFieldLang';
import { MapAttrLangs } from '../MapAttrs/MapAttrLang';
import { MapDtlLangs } from '../MapDtlLang';
import { FrmAttachmentLangs } from '../FrmAttachment/FrmAttachmentLang';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';
import { Entities } from '/@/bp/en/Entities';
import { GloComm } from '/@/WF/Comm/GloComm';
import { GPE_FrmShareSln } from '../ShareFrm/GPE_FrmShareSln';
import { SysEventAttr, SysEvents } from './FrmEvent/SysEvent';
import { GPE_FrmBodySecret } from '../MapExt/GPE_FrmBodySecret';
import { GPE_FrmWorkModel } from '../MapExt/GPE_FrmWorkModel';
import { GPE_FrmType } from '../GPE_FrmType';
import { SysEnumLangs } from '../SysEnum/SysEnumLang';
import { message } from 'ant-design-vue';
import { GroupMethodLangs } from '../FrmAttachment/GroupMethodLang';
import { MethodLangs } from '../FrmAttachment/MethodLang';
import { GPE_GenerDBSrcSearch } from '/@/CCFast/GenerDBSrc/GPE_GenerDBSrcSearch';
// 表单注册
export class MapFrmFool extends EntityNoName {
  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }
  constructor(no?: string) {
    super('TS.Frm.MapFrmFool', 'BP.Sys.MapData');
    if (!!no) this.setPKVal(no);
  }

  public override get EnMap() {
    const map = new Map('Sys_MapData', '表单属性');
    map.GroupBarShowModel = 1;
    map.AddGroupAttr('基本属性');
    map.AddTBStringPK(MapDataAttr.No, null, '表单编号', true, true, 1, 100, 20);
    const msg1 = `
#### 提示
1. 该表单把数据存储到那个表里.
2. 该表必须有一个int64未的OID列作为主键.
3. 如果指定了一个不存在的表,系统就会自动创建上.
`;

    map.AddTBString(MapDataAttr.PTable, null, '存储表', true, false, 0, 50, 20, false, msg1);
    map.AddTBString(MapDataAttr.Name, null, '名称', true, false, 0, 100, 20, true);
    map.AddTBString(MapDataAttr.DBSrc, null, '数据源', false, false, 0, 30, 20);
    map.AddTBString(MapDataAttr.UrlExt, null, '自定义URL', true, false, 0, 300, 20, true);

    // map.AddTBInt('ShareSln', 0, '表单共享方案', false, false);
    // if (WebUser.CCBPMRunModel == CCBPMRunModel.GroupInc) {
    map.AddTBInt('ShareSln', 0, '表单共享方案', false, false);
    map.AddTBString('Orgs', null, '共享组织', false, false, 0, 300, 20, true);
    map.AddTBString('OrgsT', null, '组织名称', false, false, 0, 300, 20, true);

    // map.SetPopList('Orgs', GloWF.srcOrgs, true, '300px', '500px', '共享...', 'icon-organization');
    // }

    map.AddGroupAttr('外观');
    map.AddTBInt(MapDataAttr.TableCol, 0, '显示列数', false, false);
    map.AddTBInt(MapDataAttr.FrmW, 900, '表单宽度', true, false);

    //  map.AddDDLEntities(MapDataAttr.FK_FormTree, "01", "表单类别", new SysFormTrees(), true);
    //表单解析 0 普通 1 页签展示
    map.AddDDLSysEnum(MapDataAttr.FrmShowType, 0, '展示方式', true, true, 'FrmShowType', '@0=普通方式@1=页签方式@2=从表页签合并@3=表格方式');
    map.AddDDLSysEnum(MapDataAttr.MobileFrmShowType, 0, '展示方式', true, true, 'MobileFrmShowType', '@0=普通方式@1=页签方式');

    //表单的运行类型.
    // map.AddDDLSysEnum(MapDataAttr.FrmType, 0, "表单类型", true, true, MapDataAttr.FrmType);
    map.AddTBString(MapDataAttr.Icon, 'icon-doc', '图标', true, false, 0, 100, 100, true);
    //map.AddBoolean('IsEnableJs', false, '是否启用自定义js函数?', true, true, true);

    map.AddGroupAttr('设计者信息');
    // map.AddTBString(MapDataAttr.Designer, null, '设计者', true, false, 0, 500, 20);
    // map.AddTBString(MapDataAttr.DesignerContact, null, '联系方式', true, false, 0, 500, 20);
    // map.AddTBString(MapDataAttr.DesignerUnit, null, '单位', true, false, 0, 500, 20, true);
    //map.AddTBString(MapDataAttr.Note, null, '备注', true, false, 0, 400, 100, true);
    map.AddTBString(MapDataAttr.GUID, null, 'GUID', true, true, 0, 40, 20, false);
    map.AddTBString(MapDataAttr.Ver, null, '版本号', true, true, 0, 30, 20);
    //增加参数字段.
    map.AddTBAtParas(4000);
    map.AddTBInt(MapDataAttr.Idx, 100, '序号', false, false);

    map.AddGroupMethod('基本功能');
    // 装载填充
    map.AddRM_GPE(new GPE_GenerDBSrcSearch(), 'icon-login', '', '装载填充', '&MarkID=PageLoadFullMainTable');
    //事件.
    map.AddRM_DtlSearch('表单事件', new SysEvents(), SysEventAttr.RefPKVal, '', '', SysEventAttr.ShowAttrs, 'icon-grid');

    //参考面板.
    map.AddRM_GPE(new GPE_FrmReferencePanel(), 'icon-magnifier');
    map.AddRM_GPE(new GPE_FrmBodySecret(), 'icon-key');

    //工作模式
    map.AddRM_GPE(new GPE_FrmWorkModel(), 'icon-settings');
    map.AddRM_GPE(new GPE_FrmType(), 'icon-note'); //表单工作模式.

    //共享方案.
    map.AddRM_GPE(new GPE_FrmShareSln(), 'icon-magnifier');

    //map.AddRM_UrlTabOpen('导出模版', '', 'icon-share-alt');
    map.AddRM_GPN(new GPN_FrmExpImp(), 'icon-share-alt');

    const str3 = `KeyOfEn,Name,DefVal,MinLen,MaxLen,`;
    map.AddRM_DtlSearch('隐藏字段', new AttrHides(), MapAttrAttr.FK_MapData, '', '', str3, 'icon-energy', false, '&UIVisible=0');

    map.AddGroupMethod('模板打印', 'icon-printer');
    const str1 = `Name,FileModel,PrintFileType,TemplateFileModel,`;
    map.AddRM_DtlSearch('模板打印', new FrmPrintTemplates(), MapDataVerAttr.FrmID, '', '', str1, 'icon-printer');
 
    map.AddRM_UrlLinkeWinOpen('帮助', 'https://docs.qq.com/doc/DRHNQeE9tV3ZlVE11', 'icon-support');

    map.AddGroupMethod('版本管理', 'icon-playlist');
    map.AddRM_DtlSearch('版本', new MapDataVers(), MapDataVerAttr.FrmID, '', '', '', 'icon-book-open');
    map.AddRM_UrlLinkeWinOpen('帮助', 'https://docs.qq.com/doc/DRFVORWF3R0ZIV1h5', 'icon-support');

    map.AddGroupMethod('批量修改');
    map.AddRM_DtlBatch('文本字段', new AttrStrings(), MapAttrAttr.FK_MapData, '', '', 'iconfont icon-fuwenbenkuang', '&UIVisible=1&LGType=0&UIContralType=0&MyDataType=1');
    map.AddRM_DtlBatch('整数字段', new AttrNums(), MapAttrAttr.FK_MapData, '', '', 'iconfont icon-zhengshu', '&LGType=0&UIVisible=1&MyDataType=2');
    map.AddRM_DtlBatch('浮点字段', new AttrNums(), MapAttrAttr.FK_MapData, '', '', 'iconfont icon-ziduanleixing-zhengshu', '&LGType=0&UIVisible=1&MyDataType=3');
    map.AddRM_DtlBatch('金额', new AttrNums(), MapAttrAttr.FK_MapData, '', '', 'iconfont icon-yifabupiaoju-renminbi-xi', '&MyDataType=8&UIVisible=1');
    map.AddRM_DtlBatch('日期', new AttrDTs(), MapAttrAttr.FK_MapData, '', '', 'iconfont icon-riqiqishu', '&MyDataType=6&UIVisible=1');
    map.AddRM_DtlBatch('日期时间', new AttrDTs(), MapAttrAttr.FK_MapData, '', '', 'iconfont icon-shijian1', '&MyDataType=7&UIVisible=1');
    map.AddRM_DtlBatch('枚举字段', new AttrEnums(), MapAttrAttr.FK_MapData, '', '', 'iconfont icon-xialakuangbiaodan', '&LGType=1&MyDataType=1');
    // map.AddRM_DtlBatch('外键字段', new AttrSFTables(), MapAttrAttr.FK_MapData, '', '', 'icon-energy', '&LGType=2');
    map.AddRM_DtlBatch('外部数据源', new AttrSFSQLs(), MapAttrAttr.FK_MapData, '', '', 'iconfont icon-xialakuang1', '&LGType=0&UIContralType=1');

    map.AddGroupMethod('国际化', 'icon-globe');
    map.AddRM_DtlBatch('分组', new GroupFieldLangs(), GroupFieldAttr.FrmID, '', '', 'icon-drop', '');
    map.AddRM_DtlBatch('字段', new MapAttrLangs(), 'FK_MapData', '', '', 'icon-drop', 'UIVisible=1');
    map.AddRM_DtlBatch('从表', new MapDtlLangs(), 'FK_MapData', '', '', 'icon-drop', 'UIVisible=1');
    map.AddRM_DtlBatch('附件', new FrmAttachmentLangs(), 'FK_MapData', '', '', 'icon-drop', '');

    const rm2 = new RefMethod();
    rm2.Title = '自动翻译';
    rm2.ClassMethod = 'SysLange';
    rm2.Icon = 'icon-check';
    rm2.RefMethodType = RefMethodType.Func;
    rm2.HisMap.AddTBString('SysNo', 'En', '请输入要翻译的语言编号en英语,ft繁体,ja日本', true, false, 0, 100, 100, true, '');
    map.AddRefMethod(rm2);
    this._enMap = map;
    return this._enMap;
  }

  public async SysLange(lang: string) {
    //方法分组.
    const groups = new GroupMethodLangs();
    await groups.Retrieve('FrmID', this.No);
    await MapFrmFool.SysLange_Ens(groups, lang, '方法分组');

    //方法.
    const mtds = new MethodLangs();
    await mtds.Retrieve('FrmID', this.No);
    await MapFrmFool.SysLange_Ens(mtds, lang, '方法');

    //翻译分组.
    const gfEns = new GroupFieldLangs();
    await gfEns.Retrieve('FrmID', this.No);
    await MapFrmFool.SysLange_Ens(gfEns, lang, '分组标签');

    //翻译字段.
    const attrs = new MapAttrLangs();
    await attrs.Retrieve('FK_MapData', this.No, 'UIVisible', 1);
    await MapFrmFool.SysLange_Ens(attrs, lang, '字段名称');

    //翻译附件.
    const aths = new FrmAttachmentLangs();
    await aths.Retrieve('FK_MapData', this.No);
    await MapFrmFool.SysLange_Ens(aths, lang, '附件名称');

    //翻译枚举.
    const mapAttrs = new MapAttrs();
    await mapAttrs.Retrieve('FK_MapData', this.No, 'LGType', 1);
    for (let index = 0; index < mapAttrs.length; index++) {
      const enAttr = mapAttrs[index];
      const ensEnums = new SysEnumLangs();
      await ensEnums.Retrieve('EnumKey', enAttr.UIBindKey);
      await MapFrmFool.SysLange_Ens(ensEnums, lang, '枚举');
    }

    // 翻譯.
    //翻译从表.
    const dtls = new MapDtlLangs();
    await dtls.Retrieve('FK_MapData', this.No);
    await MapFrmFool.SysLange_Ens(dtls, lang, '从表');

    //翻译從表字段.
    for (let index = 0; index < dtls.length; index++) {
      const dtl = dtls[index];
      const myattrs = new MapAttrLangs();
      await myattrs.Retrieve('FK_MapData', dtl.No, 'UIVisible', 1);
      await MapFrmFool.SysLange_Ens(myattrs, lang, '从表字段');

      const mapAttrs = new MapAttrs();
      await mapAttrs.Retrieve('FK_MapData', dtl.No, 'LGType', 1);
      for (let index = 0; index < mapAttrs.length; index++) {
        const enAttr = mapAttrs[index];
        const ensEnums = new SysEnumLangs();
        await ensEnums.Retrieve('EnumKey', enAttr.UIBindKey);
        await MapFrmFool.SysLange_Ens(ensEnums, lang, '枚举值');
      }
    }

    const en = new BSEntity('BP.Sys.MapData', this.No);
    await en.Retrieve();
    await en.DoMethodReturnString('ClearCache');
    return '自动翻译成功.';
  }
  public static async SysLange_Ens(ens: Entities, lang: string, desc = '') {
    //执行翻译.
    let someText = '';
    for (let index = 0; index < ens.length; index++) {
      const en = ens[index];
      //判断有数据吗？ 有就不翻译.
      const oldval = en.GetValByKey('Name' + lang);
      if (oldval) continue;
      let text = en.Name;
      if (!text) text = en.Lab;
      someText += text + ',';
    }

    someText = someText.slice(0, -1);

    if (someText == '') {
      // message.info('翻译[' + desc + ']-已经完成...');
      return;
    }

    message.info('开始翻译[' + desc + ']-[' + someText + ']...');

    const vals = await GloComm.ToLang(someText, lang);
    if (vals == null || vals == undefined || vals == '') return;

    for (let index = 0; index < ens.length; index++) {
      const en = ens[index];
      let text = en.Name;
      if (!text) text = en.Lab;
      const val = !!vals && Array.isArray(vals) ? vals.filter((item) => item.query == text) : [];

      if (val.length == 0) continue;
      en.SetValByKey('Name' + lang, val[0].translation);
      await en.DirectUpdate();
    }
  }

  public CheckFrm() {
    return '检查结果如下..xxxxxxxxxxxxxx@xxxxxxx  @xxxxxxxxxx';
  }
}
// 表单注册s
export class MapFrmFools extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new MapFrmFool();
  }
  constructor() {
    super();
  }
}
