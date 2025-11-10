import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { FrmAttachmentAttr } from './FrmAttachment';
import { GPE_AthCtrlWay } from './GPE_AthCtrlWay';
// 字段单附件
export class FrmAttachmentSingle extends EntityMyPK {
  constructor(pkval?: string) {
    // super("bp.demo.FrmAttachmentSingle","TS.Demo.BPFramework.FrmAttachmentSingle");
    super('TS.FrmUI.FrmAttachmentSingle');
    if (!!pkval) this.MyPK = pkval;
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
    const map = new Map('Sys_FrmAttachment', '字段单附件');

    map.AddMyPK();

    // #region 基本属性。
    map.AddTBString(FrmAttachmentAttr.FK_MapData, null, '表单ID', true, true, 1, 100, 20);
    map.AddTBString(FrmAttachmentAttr.NoOfObj, null, '附件标识', true, true, 0, 50, 20);
    map.AddTBInt(FrmAttachmentAttr.FK_Node, 0, '节点控制(对sln有效)', false, false);

    map.AddTBString(FrmAttachmentAttr.Name, null, '附件名称', true, false, 0, 50, 20, false);

    map.AddTBString(FrmAttachmentAttr.Exts, null, '文件格式', true, false, 0, 50, 20, false, null);
    map.SetHelperAlert(
      FrmAttachmentAttr.Exts,
      `上传要求,设置模式为: *.doc, *.docx, *.png, *.pdf, *.xml,多个中间用逗号分开.	
表示仅仅允许上传指定的后缀的文件.不做限制则无需填写.`,
    );

    map.AddBoolean(FrmAttachmentAttr.NumOfUpload, false, '是否必填？', true, true);
    // map.SetHelperAlert("NumOfUpload", "如果为0则标识必须上传. \t\n用户上传的字段单附件数量低于指定的数量就不让保存.");

    map.AddTBInt(FrmAttachmentAttr.FileMaxSize, 10240, '附件最大限制(KB)', true, false);

    map.AddDDLSysEnum(
      FrmAttachmentAttr.AthSaveWay,
      0,
      '保存方式',
      true,
      true,
      FrmAttachmentAttr.AthSaveWay,
      '@3=保存到对象存储OSS@0=保存到web服务器@1=保存到数据库@2=ftp服务器@4=存储链接(只能接受外部数据)@5=保存到MiNiO分布式存储@6=保存到金山对象存储',
    );

    map.AddDDLSysEnum(FrmAttachmentAttr.AthSingleRole, 0, '模板规则', true, true, FrmAttachmentAttr.AthSingleRole, '@0=不使用模板@1=使用上传模板@2=使用上传模板自动加载数据标签');
    map.SetHelperAlert(FrmAttachmentAttr.AthSingleRole, '单附件模板使用规则，如果启用，您需要上传wps/word模板。');

    map.AddDDLSysEnum(FrmAttachmentAttr.AthEditModel, 0, '在线编辑模式', true, true, FrmAttachmentAttr.AthEditModel, '@0=只读@1=可编辑全部区域@2=可编辑非数据标签区域');
    map.SetHelperAlert(FrmAttachmentAttr.AthEditModel, '用于控制附件的在线编辑模式');

    //   #endregion 基本属性。

    //   #region 权限控制。
    map.AddBoolean(FrmAttachmentAttr.DeleteWay, true, '是否可以删除？', true, true);

    //map.AddDDLSysEnum(FrmAttachmentAttr.DeleteWay, 1, "删除规则", true, true, FrmAttachmentAttr.DeleteWay,
    //    "@0=不能删除@1=删除所有@2=只能删除自己上传的");

    map.AddBoolean(FrmAttachmentAttr.IsUpload, true, '是否可以上传', true, true);
    map.AddBoolean(FrmAttachmentAttr.IsDownload, true, '是否可以下载', true, true);
    map.AddBoolean(FrmAttachmentAttr.IsNote, true, '是否增加备注', true, true);

    map.AddDDLSysEnum(FrmAttachmentAttr.AthUploadWay, 0, '控制上传控制方式', true, true, FrmAttachmentAttr.AthUploadWay, '@0=继承模式@1=协作模式');

    //  #region 节点相关
    map.AddBoolean(FrmAttachmentAttr.IsToHeLiuHZ, true, '该字段单附件是否要汇总到合流节点上去？(对子线程节点有效)', true, true, true);
    map.AddBoolean(FrmAttachmentAttr.IsHeLiuHuiZong, true, '是否是合流节点的汇总字段单附件组件？(对合流节点有效)', true, true, true);
    map.AddTBString(FrmAttachmentAttr.DataRefNoOfObj, 'AttachM1', '对应字段单附件标识', true, false, 0, 150, 20);
    map.SetHelperAlert('DataRefNoOfObj', '对WorkID权限模式有效,用于查询贯穿整个流程的字段单附件标识,与从表的标识一样.');
    map.AddDDLSysEnum(FrmAttachmentAttr.ReadRole, 0, '阅读规则', true, true, FrmAttachmentAttr.ReadRole, '@0=不控制@1=未阅读阻止发送@2=未阅读做记录');
    // #endregion 节点相关

    // #region 其他属性。
    //  map.AddBoolean(FrmAttachmentAttr.IsIdx, false, "是否排序?", true, true);
    map.AddBoolean(FrmAttachmentAttr.IsTurn2Html, false, '是否转换成html(方便手机浏览)', true, true, true);

    //参数属性.
    map.AddTBAtParas(3000);
    //隐藏字段.
    map.AddTBInt(FrmAttachmentAttr.UploadType, 0, '0单附件1多附件', false, false);
    map.AddTBInt(FrmAttachmentAttr.IsVisable, 0, '是否可见?', false, false);

    // #endregion 其他属性。
    //  #region 基本配置.
    //RefMethod rm = new RefMethod();

    const rm = new RefMethod();
    rm.Title = '上传wps模板';
    rm.ClassMethod = this.ToString() + '.DoUploadTemplateWPS';
    rm.RefMethodType = RefMethodType.RightFrameOpen;
    rm.Icon = 'icon-fire';
    map.AddRefMethod(rm);

    const rm2 = new RefMethod();
    rm2.Title = '上传word模板';
    rm2.ClassMethod = this.ToString() + '.DoUploadTemplateWord';
    rm2.RefMethodType = RefMethodType.RightFrameOpen;
    rm2.Icon = 'icon-fire';
    map.AddRefMethod(rm2);

    const rm3 = new RefMethod();
    rm3.Title = '测试FTP服务器';
    rm3.ClassMethod = this.ToString() + '.DoTestFTPHost';
    rm3.RefMethodType = RefMethodType.Func;
    rm3.Icon = 'icon-fire';
    map.AddRefMethod(rm3);
    map.AddRM_GPE(new GPE_AthCtrlWay(), 'icon-drop');

    // #endregion 基本配置.
    //   #endregion 基本配置.
    this._enMap = map;
    return this._enMap;
  }

  public DoUploadTemplateWPS() {
    return '../../Admin/FoolFormDesigner/Template/FrmAttachmentSingle/UploadAthTemplateWPS.htm?FrmID=' + this.FK_MapData + '&MyPK=' + this.MyPK;
  }
  public DoUploadTemplateWord() {
    return '../../Admin/FoolFormDesigner/Template/FrmAttachmentSingle/UploadAthTemplateWord.htm?FrmID=' + this.FK_MapData + '&MyPK=' + this.MyPK;
  }
  /// <summary>
  /// 测试连接
  /// </summary>
  /// <returns></returns>
  public async DoTestFTPHost() {
    const en = new BSEntity('TS.Sys.FrmAttachmentSingle', this.MyPK);
    await en.Init();
    const data = await en.DoMethodReturnString('DoTestFTPHost');
    return data;
  }

  public IsUse = false;
}

//字段单附件s
export class FrmAttachmentSingles extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmAttachmentSingle();
  }
  constructor() {
    super();
  }
}
