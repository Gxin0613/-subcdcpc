import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MapAttrAttr } from './MapAttrs/MapAttr';
import BSEntity from '/@/utils/gener/BSEntity';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { EntitiesOID, EntityOID } from '/@/bp/en/EntityOID';
import Events from '/@/utils/Events';
import { MapData } from './MapData';
import HttpHandler from '/@/utils/gener/HttpHandler';

/// <summary>
/// 控件类型
/// </summary>
export class GroupCtrlType {
  /// <summary>
  /// 框架
  /// </summary>
  public static readonly Frame = 'Frame';
  /// <summary>
  /// 从表
  /// </summary>
  public static readonly Dtl = 'Dtl';
  /// <summary>
  /// 附件
  /// </summary>
  public static readonly Ath = 'Ath';
  /// <summary>
  /// 审核组件
  /// </summary>
  public static readonly FWC = 'FWC';
  /// <summary>
  /// 子流程
  /// </summary>
  public static readonly SubFlow = 'SubFlow';
  /// <summary>
  /// 轨迹
  /// </summary>
  public static readonly Track = 'Track';
  /// <summary>
  /// 子线程
  /// </summary>
  public static readonly Thread = 'Thread';
  /// <summary>
  /// 流转自定义组件
  /// </summary>
  public static readonly FTC = 'FTC';
  /// <summary>
  /// 按钮控件
  /// </summary>
  public static readonly Btn = 'Btn';
}
/// <summary>
/// 分组 - 属性
/// </summary>
export class GroupFieldAttr {
  /// <summary>
  /// 表单ID
  /// </summary>
  public static readonly FrmID = 'FrmID';
  /// <summary>
  /// 标签
  /// </summary>
  public static readonly Lab = 'Lab';
  /// <summary>
  /// 顺序
  /// </summary>
  public static readonly Idx = 'Idx';
  /// <summary>
  /// 控件类型
  /// </summary>
  public static readonly CtrlType = 'CtrlType';
  /// <summary>
  /// 控件ID
  /// </summary>
  public static readonly CtrlID = 'CtrlID';
  /// <summary>
  /// PC端是否折叠显示？
  /// </summary>
  public static readonly IsZDPC = 'IsZDPC';
  /// <summary>
  /// 手机端是否折叠显示？
  /// </summary>
  public static readonly IsZDMobile = 'IsZDMobile';
  /// <summary>
  /// 分组显示的模式 显示 PC端折叠 隐藏
  /// </summary>
  public static readonly ShowType = 'ShowType';
}

// SQL模板属性
export class GroupFieldDir extends EntityOID {
  constructor(pkval?: number) {
    super('TS.FrmUI.GroupFieldDir');
    if (!!pkval) this.OID = pkval;
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
    const map = new Map('Sys_GroupField', '分组容器');

    map.AddTBIntPKOID();
    map.AddTBString(GroupFieldAttr.Lab, null, '标签', true, false, 0, 500, 20, true);
    map.AddTBString(GroupFieldAttr.FrmID, null, '表单ID', true, true, 0, 200, 20);

    map.AddTBString(GroupFieldAttr.CtrlType, null, '控件类型', true, false, 0, 50, 20);
    map.SetHelperUrl('CtrlType', 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=8108065&doc_id=31094');

    map.AddTBString(GroupFieldAttr.CtrlID, null, '控件ID', true, false, 0, 500, 20);

    //map.AddBoolean(GroupFieldAttr.IsZDPC, false, "是否折叠(PC)", true, true);

    map.AddTBString('ParentOID', null, '父级OID', true, false, 0, 128, 20, false);
    map.SetHelperAlert('ParentOID', '对章节表单有效:章节表单的目录父子关系,默认为0,是跟目录.');

    map.AddTBInt(GroupFieldAttr.Idx, 99, '顺序号', true, false);
    map.AddTBString(MapAttrAttr.GUID, null, 'GUID', true, true, 0, 128, 20, true);
    map.AddTBString('Icon', null, 'Icon', true, true, 0, 128, 20, true);
    map.AddTBAtParas(3000);

    this._enMap = map;
    return this._enMap;
  }

  protected override async afterInsert(): Promise<boolean> {
    Events.emit('insertContainer', Object.fromEntries(this.Row));
    return true;
  }
  protected override async beforeDelete(): Promise<boolean> {
    await this.DoDelAllField();
    return true;
  }

  public async DoDelAllField() {
    const en = new BSEntity('BP.Sys.GroupField');
    en.OID = this.OID;
    en.setPK(this.OID + '');
    en.FrmID = this.FrmID;
    if ((await en.RetrieveFromDBSources()) == 1) {
      const data = await en.DoMethodReturnString('DoDelAllField');
      return new GPNReturnObj(GPNReturnType.Message, data);
    }
  }

  public async DoSetGFType(type: number, val: string) {
    const md = new MapData(this.FrmID);
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
    handler.AddPara('FK_MapData', this.FrmID);
    const data: string = (await handler.DoMethodReturnString('Frm_Init')) || '';
    if (data['PageName'] != 'ChapterFrm') return 'err@该设置对章节表单有效.';
    //链接到其他表单上
    if (type == 0) {
      md.No = val;
      if ((await md.RetrieveFromDBSources()) == 0) return 'err@表单ID输入错误.';
      this.CtrlType = 'ChapterFrmLinkFrm';
      this.CtrlID = val;
    }

    //如果是自定义url.
    if (type == 1) {
      this.CtrlType = 'ChapterFrmSelfUrl';
      this.CtrlID = val;
    }
    await this.Update();
    return '执行成功.';
  }
}

// 表单注册s
export class GroupFieldDirs extends EntitiesOID {
  get GetNewEntity(): EntityOID {
    return new GroupFieldDir();
  }
  constructor() {
    super();
  }
}
