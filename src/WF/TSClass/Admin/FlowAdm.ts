import { EntityNoNameAttr, EntityNoName, EntitiesNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';
import { TrashBinOutline } from '@vicons/ionicons5';
import { message } from 'ant-design-vue';
import { GloWF } from '../../Admin/GloWF';

/// 流程 属性
export class FlowAttr extends EntityNoNameAttr {
  /// 组织编号
  public static readonly OrgNo = 'OrgNo';
  /// 电话
  public static readonly FK_FlowSort = 'FK_FlowSort';
  /// 位置
  public static readonly BillNoFormat = 'BillNoFormat';
  //草稿规则
  public static readonly Draft = 'Draft';
  public static readonly FlowEventEntity = 'FlowEventEntity';
  public static readonly PTable = 'PTable';
  public static readonly IsCanStart = 'IsCanStart';
  public static readonly TitleRole = 'TitleRole';
  public static readonly Ver = 'Ver';
  public static readonly CreateDate = 'CreateDate';
  public static readonly FlowDevModel = 'FlowDevModel';
}

/// 流程
export class FlowAdm extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.WF.Admin.FlowAdm');
    if (!!pkVal) {
      this.setPKVal(pkVal);
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
    const map = new Map('WF_Flow', '流程模版');

    //  map.AddHidden(FlowAttr.OrgNo, " = ", WebUser.OrgNo);
    map.AddTBStringPK(FlowAttr.No, null, '编号', true, true, 0, 4, 50);
    //处理流程类别.
    //let sql =  "SELECT No,Name FROM WF_FlowSort WHERE OrgNo='@WebUser.OrgNo' ORDER BY No,Idx";
    map.AddDDLSQL(FlowAttr.FK_FlowSort, '', '类别', GloWF.srcFlowSorts, false, null, true);
    map.AddTBString(FlowAttr.OrgNo, null, '组织编号', false, false, 0, 50, 10, false);

    map.SetHelperUrl(FlowAttr.No, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661868&doc_id=31094'); //使用alert的方式显示帮助信息.
    map.AddTBString(FlowAttr.Name, null, '名称', true, false, 0, 50, 200);

    //add  2013-08-30.
    map.AddTBString(FlowAttr.BillNoFormat, null, '单号格式', true, false, 0, 50, 10, false);
    map.SetHelperUrl(FlowAttr.BillNoFormat, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3953012&doc_id=31094');

    map.AddTBString(FlowAttr.FlowEventEntity, null, '事件实体', true, true, 0, 150, 30);
    map.SetHelperUrl(FlowAttr.FlowEventEntity, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661871&doc_id=31094');

    map.AddTBString(FlowAttr.PTable, null, '存储表', true, false, 0, 30, 60);
    map.SetHelperUrl(FlowAttr.PTable, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=4000827&doc_id=31094');

    // add 2013-02-05.
    map.AddTBString(FlowAttr.TitleRole, null, '标题生成规则', true, false, 0, 150, 10, true);
    map.SetHelperUrl(FlowAttr.TitleRole, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661872&doc_id=31094');

    map.AddBoolean(FlowAttr.IsCanStart, true, '独立启动？', true, true);

    // map.AddTBInt('FlowDevModel', 0, '模式', false, false);
    map.AddDDLSysEnum(
      FlowAttr.FlowDevModel,
      0,
      '开发模式',
      true,
      true,
      FlowAttr.FlowDevModel,
      '@0=专业模式@1=极简模式@2=累加模式@3=绑定单表单@4=绑定多表单@5=SDK表单@6=嵌入式表单@7=物联网流程',
    );

    //草稿
    map.AddDDLSysEnum(FlowAttr.Draft, 0, '草稿规则', true, true, FlowAttr.Draft, '@0=无(不设草稿)@1=保存到待办@2=保存到草稿箱');
    map.SetHelperUrl(FlowAttr.Draft, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661878&doc_id=31094');

    map.AddTBDateTime(FlowAttr.CreateDate, null, '创建时间', true, true);
    map.AddTBString(FlowAttr.OrgNo, null, '组织编号', false, false, 0, 50, 10, false);
    map.AddTBString('FrmUrl', null, 'FrmUrl', false, false, 0, 50, 10, false);

    map.AddTBInt('Idx', 0, 'Idx', false, false);

    map.AddTBAtParas(3000);

    //查询.
    map.AddSearchAttr(FlowAttr.FK_FlowSort);

    this._enMap = map;
    return this._enMap;
  }

  protected override async beforeDelete(): Promise<boolean> {
    const en = new BSEntity('BP.WF.Flow', this.No);
    await en.Init();
    await en.Retrieve();
    const msg = await en.DoMethodReturnString('DoDelete');
    if ((msg != null && msg.includes('err@') == true) || msg.includes('您不能删除')) {
      message.success(msg);
      return Promise.resolve(false);
    }
    return Promise.resolve(true);
  }
}

/**
 * 流程s
 */
export class FlowAdms extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new FlowAdm();
  }
  constructor() {
    super();
  }
}
