import { EntityNoName, EntitiesNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { GPE_AutoStart } from '../AttrFlow/AutoStart/GPE_AutoStart';
import { GPE_Limit } from '../AttrFlow/Limit/GPE_Limit';
import { GPE_StartGuide } from '../AttrFlow/StartGuide/GPE_StartGuide';
import { GPE_BatchStart } from '../AttrFlow/BatchStart/GPE_BatchStart';
import { GPE_SDTOfFlow } from '../AttrFlow/SDTOfFlow/GPE_SDTOfFlow';
import { GPE_DeadLineRole } from '../AttrFlow/DeadLineRole/GPE_DeadLineRole';
import { FlowAttr } from '../../TSClass/Flow';

// 流程属性
export class FlowFD extends EntityNoName {
  constructor(no?: string) {
    // super('TS.WF.FD.FlowFD', 'BP.WF.Template.FlowFD');
    super('TS.WF.FD.FlowFD');
    //关联更新的类.
    this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Flow', '流程属性');

    map.AddGroupAttr('基本属性');
    map.AddTBStringPK(FlowAttr.No, null, '编号', true, true, 1, 4, 3);

    //处理流程类别.
    map.AddTBString(FlowAttr.Name, null, '名称', true, false, 0, 50, 10, true);

    // add 2013-02-14 唯一确定此流程的标记
    map.AddTBString(FlowAttr.FlowMark, null, '流程标记', true, false, 0, 150, 10);
    map.SetHelperUrl(FlowAttr.FlowMark, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661870&doc_id=31094');

    map.AddTBString(FlowAttr.FlowEventEntity, null, '流程事件实体', true, true, 0, 150, 10);
    map.SetHelperUrl(FlowAttr.FlowEventEntity, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661871&doc_id=31094');

    // add 2013-02-05.
    map.AddTBString(FlowAttr.TitleRole, null, '标题生成规则', true, false, 0, 150, 10, true);
    map.SetHelperUrl(FlowAttr.TitleRole, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661872&doc_id=31094');

    map.AddTBString(FlowAttr.TitleRoleNodes, null, '生成标题的节点', true, false, 0, 300, 10);
    // let msg = "设置帮助";
    //msg += "\r\n 1. 如果为空表示只在开始节点生成标题.";
    //msg += "\r\n 2. * 表示在任意节点可生成标题.";
    //msg += "\r\n 3. 要在指定的节点重新生成标题用逗号分开,比如: 102,105,109";
    map.SetHelperUrl(FlowAttr.TitleRoleNodes, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661873&doc_id=31094');

    map.AddBoolean(FlowAttr.IsCanStart, true, '可以独立启动否？(独立启动的流程可以显示在发起流程列表里)', true, true, true);
    map.SetHelperUrl(FlowAttr.IsCanStart, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661874&doc_id=31094');

    // 草稿
    map.AddDDLSysEnum(FlowAttr.Draft, 0, '草稿规则', true, true, FlowAttr.Draft, '@0=无(不设草稿)@1=保存到待办@2=保存到草稿箱');
    map.SetHelperUrl(FlowAttr.Draft, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3661878&doc_id=31094');

    map.AddGroupAttr('数据&表单');
    //批量发起 add 2013-12-27.
    map.AddTBString(FlowAttr.PTable, null, '流程数据存储表', true, false, 0, 100, 10);
    map.SetHelperUrl(FlowAttr.PTable, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=4000827&doc_id=31094');

    //add  2013-08-30.
    map.AddTBString(FlowAttr.BillNoFormat, null, '单据编号格式', true, false, 0, 50, 10, false);
    map.SetHelperUrl(FlowAttr.BillNoFormat, 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=3953012&doc_id=31094');

    map.AddGroupAttr('轨迹');
    map.AddBoolean(FlowAttr.IsFrmEnable, false, '是否显示表单', true, true, false);
    map.AddBoolean(FlowAttr.IsTruckEnable, true, '是否显示轨迹图', true, true, false);
    map.AddBoolean(FlowAttr.IsTimeBaseEnable, true, '是否显示时间轴', true, true, false);
    map.AddBoolean(FlowAttr.IsTableEnable, true, '是否显示时间表', true, true, false);
    map.AddBoolean(FlowAttr.IsOPEnable, false, '是否显示操作', true, true, false);
    map.AddDDLSysEnum(FlowAttr.TrackOrderBy, 0, '排序方式', true, true, FlowAttr.TrackOrderBy, '@0=按照时间先后顺序@1=倒序(新发生的在前面)');
    /**********************************  基本信息   */
    map.AddGroupMethod('基本配置');
    //自动发起
    map.AddRM_GPE(new GPE_AutoStart(), 'icon-file');

    //发起限制规则.
    map.AddRM_GPE(new GPE_Limit(), 'icon-file');

    //发起前置导航.
    map.AddRM_GPE(new GPE_StartGuide(), 'icon-file');

    //批量发起.
    map.AddRM_GPE(new GPE_BatchStart(), 'icon-file');
    map.AddGroupMethod('时限规则');

    /**********************************  流程时限规则   */
    //时限规则.
    map.AddRM_GPE(new GPE_SDTOfFlow(), 'icon-file');

    map.AddRM_GPE(new GPE_DeadLineRole(), 'icon-file');

    // /**********************************  开发接口   */
    // map.AddGroupMethod('开发接口');
    // map.AddRM_UrlRightFrameOpen('URL调用接口', '/src/WF/Admin/AttrFlow/Dev2Interface/Dev_Url.vue', 'icon-file');

    // //同步数据
    // map.AddRM_GPE(new GPE_DTSTable(), 'icon-file');

    // //节点工具栏,主从表映射.
    // map.AddRM_DtlSearch('流程事件', new FlowEvents(), SysEventAttr.RefFlowNo, '', '', 'EventDoType,DoDoc', 'icon-fire');

    // //map.AddRM_DtlSearch('流程事件', new FlowEvents(), SysEventAttr.RefFlowNo, '', '', 'EventDoType,DoDoc', 'icon-fire');

    // //增加链接.
    // map.AddRM_UrlRightFrameOpen('SDK开发接口', '/src/WF/Admin/AttrFlow/Dev2Interface/Dev_SDK.vue', 'icon-fire');
    // map.AddRM_UrlRightFrameOpen('FEE代码接口', '/src/WF/Admin/AttrFlow/Dev2Interface/Dev_FEE.vue', 'icon-fire');
    // map.AddRM_UrlRightFrameOpen('自定义流程属性', '/src//DataUser/OverrideFiles/FlowAttrExts.vue', 'icon-fire');

    // const rm5 = new RefMethod();
    // rm5.Title = '检查流程';
    // rm5.Warning = '您确定要执行吗?大概需要1-2分钟左右.';
    // rm5.GroupName = '开发接口';
    // rm5.ClassMethod = 'CheckFlow';
    // rm5.RefMethodType = RefMethodType.Func;
    // map.AddRefMethod(rm5);

    // const rm6 = new RefMethod();
    // rm6.Title = '删除指定的流程';
    // rm6.Warning = '您确定要执行吗?删除后不可恢复.';
    // rm6.GroupName = '开发接口';
    // rm6.ClassMethod = 'DeleteByWorkID';
    // rm6.HisMap.AddTBInt('WorkID', 'WorkID', 0, '工作ID', true, false);
    // rm6.HisMap.AddTBString('Note', 'Note', '请输入原因', true, false, 0, 100, 100);
    // rm6.RefMethodType = RefMethodType.Func;
    // map.AddRefMethod(rm6);

    this._enMap = map;
    return this._enMap;
  }

  public DeleteByWorkID(workID: number) {
    return '执行成功.' + workID;
  }
}

//流程属性s
export class FlowFDs extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new FlowFD();
  }
  constructor() {
    super();
  }
}
