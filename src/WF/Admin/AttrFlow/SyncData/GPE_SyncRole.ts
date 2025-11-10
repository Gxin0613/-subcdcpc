import { GloWF } from '../../GloWF';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { Flow } from '/@/WF/TSClass/Flow';

export class GPE_SyncRole extends PageBaseGroupEdit {
  constructor() {
    super('GPE_SyncRole');
    this.PageTitle = '同步数据规则';
  }
  Init() {
    this.entity = new Flow(); //对应的类.
    this.KeyOfEn = 'DTSWay'; //对应的字段.
    //增加子页面.
    this.AddGroup('A', '数据同步规则'); //增加分组.
    this.Blank('0', '不执行同步', this.Desc0);
    this.Blank('1', '任何节点发送后都执行同步', this.Desc1);
    const sql = GloWF.SQLOfNodesOfFlow(this.PKVal); //`SELECT NodeID as No,Name FROM WF_Node WHERE FK_Flow='${this.PKVal}' `;
    this.SelectItemsByList('3', '指定的节点发送后', this.Desc3, true, sql, 'DTSSpecNodes', '');
    this.Blank('2', '流程结束时', this.Desc2);
    //this.SingleTB('3', '指定的节点发送后', 'DTSSpecNodes', this.Desc3, '输入节点ID', 1);
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }
  public readonly Desc0 = `
  #### 帮助
  - 数据同步，就是在流程运动过程过程中向其他系统读写数据。
  - 默认为不同步。
  - 根据应用系统的需求，设置同步时间与同步方式。
  - 使用ccbpm的数据同步功能可能定期的向指定的系统推送数据。
  - 推送什么数据，在同步内容里定义。
  ##### 应用场景
  - 请假流程中，请假信息需要写入到HR系统中去。
  - 订单流程需要写入到ERP，进销存系统中去。
  ##### 其他
  - 流程都有一个业务数据表，默认名字NDxxxRpt，此表的名字可以自定义。
  - ccbpm在运行过程中，都把业务数据写入到这个表里，该表的数据是流程数据+业务数据组成。
  - 二次开发人员可以通过访问该表定期的获取数据，也可以使用触发器来完成数据同步。
`;
  public readonly Desc1 = `
  #### 帮助
  - 当用户执行发送的时候执行数据同步。
  - 任何节点执行发送，都执行同步。
  #### 其它
  - 如果数据量太大，就会导致发送变慢。
`;

  public readonly Desc2 = `
  #### 帮助
  - 在流程的结束事件里执行同步。
`;
  public readonly Desc3 = `
  #### 帮助
  - 在指定的节点发送的事件里执行同步。
  - 请选择要执行的节点。
`;
}
