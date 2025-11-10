import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';

// 测试参数
export class FlowTestParaSetting extends EntityNoName {
  constructor(no?: string) {
    super('TS.WF.Template.FlowTestParaSetting');
    if (!!no) this.setPKVal(no);
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
    const map = new Map('WF_Flow', '测试参数');

    map.AddTBStringPK('No', null, '编号', true, true, 1, 3, 50);
    map.AddTBString('Name', null, '名称', true, true, 0, 50, 500);

    map.AddTBStringDoc('TestSysPara', null, '流程系统参数', true, false, true, this.DescTestSysPara);
    map.AddTBStringDoc('TestFrmPara', null, '表单填充数据', true, false, true, this.TestFrmPara);

    this._enMap = map;
    return this._enMap;
  }

  //系统参数帮助
  public readonly DescTestSysPara = `
  #### 帮助
  - 流程系统参数是流程实例在运行过程中，由外部接口传递写入的参数。
  - 参数存储在WF_GenerWorkFlow表的 AtPara字段里面，格式为 @Key1=Val1@Key2=Val2
  - 调用接口 Flow_SaveParas(workID, paras) 可以保存或者更改系统参数. 
  - 该参数可以用到，方向条件、接受人规则、表单的url参数.
  #### 填写示例
  @QingJiaTianShu=14
  #### 常见的固定参数约定.
  - 发起流程传入的嵌入模式的表单url参数. 参数键值:  
  - 示例: 

  #### 嵌入嵌入式表单url地址参数
  - 参数键值: FrmUrl
  - 示例:

  `;

  //表单参数帮助
  public readonly TestFrmPara = `
  #### 帮助
  - 表单参数是测试的时候，为了避免重复录入在发起之前设置的默认字段值.
  - 启动流程的时候，系统自动按照设置的数据填充到节点表单，然后启动流程.
  #### 参数示例
  @XMMC=驰骋BPM工作流引擎项目
  @XMJE=100
  @XMDZ=山东济南高新区.碧桂园凤凰中心.A座1903
  
  
  `;
}
