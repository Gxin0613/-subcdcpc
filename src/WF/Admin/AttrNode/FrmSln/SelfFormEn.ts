import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNodeID } from '/@/bp/en/EntityNodeID';
import { NodeExtAttr } from '/@/WF/Admin/AttrNode/NodeExt';

// 节点属性
export class SelfFormEn extends EntityNodeID {
  constructor(pkval?: number) {
    super('TS.WF.SelfFormEn', 'BP.WF.Template.NodeExt');
    //this.RefEnName = "TS.WF.Template.NodeExt"; //关联更新的类.
    if (!!pkval) this.NodeID = pkval;
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
    const map = new Map('WF_Node', 'URL参数');
    map.AddTBIntPK('NodeID', 0, '节点ID', true);
    map.AddTBString(NodeExtAttr.Name, null, '名称', false, false, 0, 50, 200);
    map.AddDDLSysEnum(
      'SelfFormEnRoot',
      0,
      '文件根路径',
      true,
      true,
      'SelfFormEnRoot',
      '@0=内部路由(无需http前缀)@1=全路径@2=子系统设置@3=全局配置文件(.env)@4=系统参数FrmUrl@5=内部vue文件',
    );
    map.SetHelperUrl(
      'SelfFormEnRoot',
      `## 特别说明 
       - 内部路由需要在低代码配置菜单，通常是 /#/Form/Test?xx=yy模式 
 
       - 内部vue文件包含vue文件路径即可, 如: /views/Form/Test.vue?xx=yy, 需要在文件中通过 defineProps({params: Object}) 获取参数, 还需要通过defineExpose()暴露一个Save方法供外部调用`,
    );

    map.AddTBString(NodeExtAttr.FormUrl, null, 'URL(PC端)', true, false, 0, 200, 200, true);
    map.AddTBString(NodeExtAttr.FormUrlMobile, null, 'URL(移动端)', true, false, 0, 200, 200, true);

    map.AddDDLSysEnum('SelfFrmShowType', 0, '流程组件展示方式', true, true, 'SelfFrmShowType', '@0=顺序展示@1=Tab标签页');
    map.SetHelperUrl('SelfFrmShowType', 'https://gitee.com/opencc/JFlow/wikis/pages/preview?sort_id=13246873&doc_id=31094');

    // map.AddDDLSysEnum('FrmSln', 0, '表单方案', true, true, 'FrmSln', '@0=默认@1=只读@2=自定义');
    // map.AddTBString('CtrlIDVisable', null, '隐藏的ID', true, false, 0, 50, 200, true);
    // map.AddTBString('CtrlIDReadonly', null, '只读的ID', true, false, 0, 50, 200, true);

    map.ParaFields = ',SelfFormEnRoot,SelfFrmShowType,';
    map.AddTBAtParas(500);

    this._enMap = map;
    return this._enMap;
  }
}
