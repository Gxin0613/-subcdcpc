import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import { FrmAttachmentAttr } from './FrmAttachment';
import BSEntity from '/@/utils/gener/BSEntity';
import { GPE_AthCtrlWay } from './GPE_AthCtrlWay';
// 附件
export class FrmAttachmentExt extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.FrmUI.FrmAttachmentExt', 'BP.Sys.FrmUI.FrmAttachmentExt');
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
    const map = new Map('Sys_FrmAttachment', '附件');
    map.GroupBarShowModel = 1;
    map.AddGroupAttr('基础信息');
    map.AddMyPK();
    map.AddTBString(FrmAttachmentAttr.FK_MapData, null, '表单ID', true, true, 1, 100, 20);
    map.AddTBString(FrmAttachmentAttr.NoOfObj, null, '附件标识', true, true, 0, 50, 20);
    map.AddTBInt(FrmAttachmentAttr.FK_Node, 0, '节点控制(对sln有效)', false, false);

    //for渔业厅增加.
    map.AddDDLSysEnum(FrmAttachmentAttr.AthRunModel, 0, '运行模式', true, true, FrmAttachmentAttr.AthRunModel, '@0=流水模式@1=固定模式@2=自定义页面');

    map.AddDDLSysEnum('AthEditType', 0, '在线编辑方式', true, true, 'AthEditType', '@0=不编辑@1=Office插件@2=WPS插件@3=混合模式');
    map.SetHelperAlert(
      'AthEditType',
      `Office插件使用VSTO软件程序打开本地Office客户端工具,WPS插件通过WPS应用进行打开,	
混合模式下采用两种方式,用户可自由选择.`,
    );
    map.AddTBString(FrmAttachmentAttr.Name, null, '附件名称', true, false, 0, 50, 20, true);
    map.AddTBString(FrmAttachmentAttr.Exts, null, '文件格式', true, false, 0, 50, 20, true, null);
    map.SetHelperAlert(
      FrmAttachmentAttr.Exts,
      `上传要求,设置模式为: *.doc, *.docx, *.png, *.pdf, *.xml,多个中间用逗号分开.	
表示仅仅允许上传指定的后缀的文件.不做限制则无需填写.`,
    );

    map.AddTBInt(FrmAttachmentAttr.NumOfUpload, 0, '最小上传数量', true, false);
    map.SetHelperAlert(
      'NumOfUpload',
      `如果为0则标识必须上传. 	
用户上传的附件数量低于指定的数量就不让保存.`,
    );

    map.AddTBInt(FrmAttachmentAttr.TopNumOfUpload, 99, '最大上传数量', true, false, false);
    map.AddTBInt(FrmAttachmentAttr.FileMaxSize, 10240, '附件最大限制(KB)', true, false, false);
    map.AddDDLSysEnum(FrmAttachmentAttr.UploadFileNumCheck, 0, '上传校验方式', true, true, FrmAttachmentAttr.UploadFileNumCheck, '@0=不用校验@1=不能为空@2=每个类别下不能为空');

    map.AddDDLSysEnum(
      FrmAttachmentAttr.AthSaveWay,
      0,
      '保存方式',
      true,
      true,
      FrmAttachmentAttr.AthSaveWay,
      '@3=保存到对象存储OSS@0=保存到web服务器@1=保存到数据库@2=ftp服务器@4=存储链接(只能接受外部数据)@5=保存到MiNiO分布式存储@6=保存到金山对象存储',
    );
    const helpAthSaveWay = `  帮助
#### 附件保存方式说明
1. 保存到web服务器：将附件保存到当前应用的web服务器上，适用于小型应用。
2. 保存到数据库：将附件保存到数据库中，适用于需要高安全性和数据完整性的应用。
3. 保存到对象存储OSS：将附件保存到阿里云、腾讯云等对象存储服务，适用于大规模数据存储和访问。
4. ftp服务器：将附件保存到FTP服务器，适用于需要跨平台访问的应用。
5. 存储链接(只能接受外部数据)：适用于从外部系统获取附件数据，不进行存储。
6. 保存到MiNiO分布式存储：将附件保存到MiNiO分布式存储系统，适用于需要高可用性和分布式存储的应用。
7. 保存到金山对象存储：将附件保存到金山的对象存储服务，适用于与金山集成的应用。`;
    map.SetHelperAlert(FrmAttachmentAttr.AthSaveWay, helpAthSaveWay);
    map.AddTBString(FrmAttachmentAttr.Sort, null, '类别', true, false, 0, 500, 20, true, null);
    map.SetHelperAlert(
      FrmAttachmentAttr.Sort,
      `设置格式:生产类,文件类,其他，也可以设置一个SQL，比如select Name FROM Port_Dept  	
目前已经支持了扩展列,可以使用扩展列定义更多的字段，该设置将要被取消.`,
    );

    map.AddGroupAttr('外观');
    map.AddTBString('OpenDesc', null, '上传说明', true, false, 0, 500, 20, true, null);

    map.AddBoolean(FrmAttachmentAttr.IsTurn2Html, false, '是否转换成html(方便手机浏览)', true, true, true);
    map.AddBoolean(FrmAttachmentAttr.IsVisable, true, '是否显示附件分组', true, true, true);
    map.AddDDLSysEnum(FrmAttachmentAttr.FileType, 0, '附件类型', true, true, FrmAttachmentAttr.FileType, '@0=普通附件@1=图片文件@2=经纬度展示图片@3=签名图片');
    map.AddDDLSysEnum(FrmAttachmentAttr.PicUploadType, 0, '图片附件上传方式', true, true, FrmAttachmentAttr.PicUploadType, '@0=拍照上传或者相册上传@1=只能拍照上传');
    map.SetHelperAlert(FrmAttachmentAttr.PicUploadType, '该功能只使用于移动端图片文件上传的方式.');
    map.AddBoolean(FrmAttachmentAttr.IsEnableTemplate, true, '是否启用模板下载？', true, true, false);
    map.AddTBFloat(FrmAttachmentAttr.H, 150, '高度', true, false);
    map.AddBoolean(FrmAttachmentAttr.IsIdx, false, '是否排序?', true, true);
    // #region 权限控制。
    //hzm新增列
    // map.AddTBInt(FrmAttachmentAttr.DeleteWay, 0, "附件删除规则(0=不能删除1=删除所有2=只能删除自己上传的", false, false);
    map.AddGroupAttr('权限控制');
    map.AddDDLSysEnum(FrmAttachmentAttr.DeleteWay, 1, '附件删除规则', true, true, FrmAttachmentAttr.DeleteWay, '@0=不能删除@1=删除所有@2=只能删除自己上传的');

    map.AddBoolean(FrmAttachmentAttr.IsUpload, true, '是否可以上传', true, true);
    map.AddBoolean(FrmAttachmentAttr.IsDownload, true, '是否可以下载', true, true);

    map.AddBoolean(FrmAttachmentAttr.IsAutoSize, true, '自动控制大小', true, true);
    map.AddBoolean(FrmAttachmentAttr.IsNote, true, '是否增加备注', true, true);
    map.AddBoolean(FrmAttachmentAttr.IsExpCol, true, '是否启用扩展列', true, true);

    map.AddBoolean(FrmAttachmentAttr.IsShowTitle, true, '是否显示标题列', true, true);

    map.AddDDLSysEnum(FrmAttachmentAttr.UploadType, 0, '上传类型', true, false, FrmAttachmentAttr.CtrlWay, '@0=单个@1=多个@2=指定');
    map.SetHelperAlert(FrmAttachmentAttr.UploadType, '单附件：请使用字段单附件组件。');

    map.AddDDLSysEnum(FrmAttachmentAttr.AthUploadWay, 0, '控制上传控制方式', true, true, FrmAttachmentAttr.AthUploadWay, '@0=继承模式@1=协作模式');

    // map.AddDDLSysEnum(
    //   FrmAttachmentAttr.CtrlWay,
    //   0,
    //   '控制呈现控制方式',
    //   true,
    //   true,
    //   'Ath' + FrmAttachmentAttr.CtrlWay,
    //   '@0=PK-主键@1=FID-干流程ID@2=PWorkID-父流程ID@3=仅能查看自己上传的附件@4=WorkID-按照WorkID计算(对流程节点表单有效)@5=P2WorkID@6=P3WorkID',
    // );

    //map.AddDDLSysEnum(FrmAttachmentAttr.DataRef, 0, "数据引用", true, true, FrmAttachmentAttr.DataRef,
    //    "@0=当前组件ID@1=指定的组件ID");
    // #endregion 权限控制。

    // #region 流程相关
    map.AddGroupAttr('流程相关');
    //map.AddDDLSysEnum(FrmAttachmentAttr.DtlOpenType, 0, "附件删除规则", true, true, FrmAttachmentAttr.DeleteWay,
    //    "@0=不能删除@1=删除所有@2=只能删除自己上传的");
    map.AddBoolean(FrmAttachmentAttr.IsToHeLiuHZ, true, '该附件是否要汇总到合流节点上去？(对子线程节点有效)', true, true, true);
    map.AddBoolean(FrmAttachmentAttr.IsHeLiuHuiZong, true, '是否是合流节点的汇总附件组件？(对合流节点有效)', true, true, true);
    map.AddTBString(FrmAttachmentAttr.DataRefNoOfObj, 'AttachM1', '对应附件标识', true, false, 0, 150, 20);
    map.SetHelperAlert('DataRefNoOfObj', '对WorkID权限模式有效,用于查询贯穿整个流程的附件标识,与从表的标识一样.');
    map.AddDDLSysEnum(FrmAttachmentAttr.ReadRole, 0, '阅读规则', true, true, FrmAttachmentAttr.ReadRole, '@0=不控制@1=未阅读阻止发送@2=未阅读做记录');
    map.AddTBInt(FrmAttachmentAttr.GroupID, 0, 'GroupID', false, false);
    // #endregion 流程相关
    // #region 其他属性。
    //参数属性.
    map.AddTBAtParas(3000);
    /// #endregion 其他属性。

    // #region 基本功能.
    //  map.AddGroupMethod('基本功能');
    map.AddGroupMethod('基本功能');

    const rm = new RefMethod();
    rm.Title = '测试FTP服务器';
    rm.ClassMethod = 'DoTestFTPHost';
    rm.RefMethodType = RefMethodType.Func;
    rm.Icon = 'icon-fire';
    map.AddRefMethod(rm);

    const rm1 = new RefMethod();
    rm1.Title = '重命名标记';
    rm1.ClassMethod = 'ResetAthName';
    rm1.HisMap.AddTBString('F', null, '命名后的标记', true, false, 0, 100, 50);
    rm1.RefMethodType = RefMethodType.Func;
    rm1.Icon = 'icon-note';
    // EnName=TS.FrmUI.GroupField&PKVal=${props?.widgetInfo?.id}
    map.AddRM_EnOnly('分组设置', 'TS.FrmUI.GroupField', '@GroupID', 'icon-credit-card');

    let msg = '说明：';
    msg += `	
 1. 每个附件都有一个标记比如，Ath1,Ath2, FJ. `;
    msg += `	
 2. 这个标记在一个表单中不能重复，这个标记也叫附件的小名。`;
    msg += `	
 3. 在父子流程，或者多表单流程中，这个标记可以用于继承附件的展示。`;
    msg += `	
 4. 比如：一个父流程的附件组件的标记为Ath1, 一个子流程的表单的附件表单要看到这个附件信息，就需要把两个小名保持一致。`;
    rm1.Warning = msg;
    map.AddRefMethod(rm1);

    map.AddRM_GPE(new GPE_AthCtrlWay(), 'icon-drop');

    // #endregion 基本功能.

    // //#region 高级设置.
    // map.AddGroupMethod("实验中功能");
    // const rm2 = new RefMethod();

    // rm.Title = "类别设置";
    // rm.ClassMethodName = this.ToString() + ".DoSettingSort";
    // rm.RefMethodType = RefMethodType.RightFrameOpen;
    // map.AddRefMethod(rm);

    // rm = new RefMethod();

    // rm.Title = "设置扩展列";
    // rm.ClassMethodName = this.ToString() + ".DtlOfAth";
    // rm.RefMethodType = RefMethodType.LinkeWinOpen;
    // // map.AddRefMethod(rm);
    // #endregion 高级设置.

    // map.AddRefMethod(rmAdv2);
    //   #endregion 基本配置.
    this._enMap = map;
    return this._enMap;
  }
  //测试.
  public async DoTestFTPHost() {
    const en = new BSEntity('BP.Sys.FrmUI.FrmAttachmentExt', this.PKVal);
    await en.Retrieve();
    const data = await en.DoMethodReturnString('DoTestFTPHost');
    return 'ftp测试结果:' + data;
  }
  public async ResetAthName(name: string) {
    const en = new BSEntity('BP.Sys.FrmUI.FrmAttachmentExt', this.MyPK);
    await en.Retrieve();
    const data = await en.DoMethodReturnString('ResetAthName', name);
    return '重命名:' + data;
  }
  public DoSettingSort() {
    return '测试成功.';
  }
  public DtlOfAth() {
    return '测试成功.';
  }
}

//附件s
export class FrmAttachmentExts extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new FrmAttachmentExt();
  }
  constructor() {
    super();
  }
}
 