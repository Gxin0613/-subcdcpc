import { GloWF } from '../../GloWF';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { Node, NodeAttr } from '/@/WF/TSClass/Node';

export class GPE_ShenFenModel extends PageBaseGroupEdit {
  constructor() {
    super('GPE_ShenFenModel');
    this.PageTitle = '人员身份规则';
  }
  async Init() {
    this.entity = new Node(); //对应的类.
    this.KeyOfEn = NodeAttr.ShenFenModel; //要编辑的字段.

    //增加子页面.
    this.AddGroup('A', '按组织结构绑定'); //增加分组.
    this.Blank('0', ' 当前人员的身份（默认）', this.Desc0);
    const node = new Node(this.PKVal);
    await node.Retrieve();
    const flowNo = node.FK_Flow;
    this.SelectItemsByList('1', '指定节点的人员身份', this.Desc1, false, GloWF.SQLOfNodesOfFlow(flowNo), NodeAttr.ShenFenVal); //`SELECT NodeID as No,Name FROM WF_Node WHERE FK_Flow='${flowNo}' `
    const frmID = 'ND' + parseInt(node.FK_Flow) + 'Rpt';
    let sql = GloWF.SQLOfMapAttrsGener(frmID);
    sql = sql.replace('MyPK', 'KeyOfEn');
    this.SelectItemsByList('2', '按表单字段' + '值(人员编号)作为人员身份', this.Desc2, false, sql, NodeAttr.ShenFenVal);
    this.SelectItemsByList('3', '按表单字段值(部门编号)作为人员身份', this.Desc3, false, sql, NodeAttr.ShenFenVal);
    this.SelectItemsByList('5', '按表单字段值(部门编号,取该部门的领导)作为人员身份', this.Desc5, false, sql, NodeAttr.ShenFenVal);

    this.SingleTB('4', '按系统参数(部门编号)作为人员身份', NodeAttr.ShenFenVal, this.Desc4, '请输入系统参数');

    // this.SingleDDLSQL('2', '按表单字段', '', this.Desc2, 'SELECT KeyOfEn No,Name FROM Sys_MapAttr WHERE 1=1 ', false);
  }
  public AfterSave(_pageID: string, _pageVal: any) {}
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }
  public readonly Desc3 = `
  #### 说明
   - 表单采集的是一个部门编号.
   - 使用这个部门编号作为当前人员的身份.
    `;
  public readonly Desc5 = `
    #### 说明
     - 表单采集的是一个部门编号
     - 使用这个部门编号的维护的Leader字段，作为当前人员的身份.
      `;

  public readonly Desc4 = `
  #### 说明
   - 获取当前人员信息的是按照指定的部门与指定的角色的交集计算.
   - 指定的部门是从ccbpm的系统参数获取的.
   - 在流程运行的过程中系统参数，是通过 Flow_SavePara() 的方法保存到ccbpm中的.
   - 流程的系统参数存储在 表:WF_GenerWorkFlow 字段:AtPara 中.
   #### 其他
   - 请阅读ccbpm的接口方法，保存参数.

    `;

  public readonly Desc0 = `
  #### 说明
   - 上一步的发送人作为接收人。
   - 默认为该模式。
    `;

  public readonly Desc1 = `
  #### 说明
   - 指定节点的处理人作为本步骤的身份.
   - 需要选择一个节点ID.
  #### 流程图
  ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/ShengqingFlow1.png "屏幕截图")
  #### 配置图
  ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/ShengqingPeizhi1.png "屏幕截图")
      `;

  public readonly Desc2 = `
  #### 说明
  - 选择的字段存储的是作为人员身份(该字段里存储的是账号)
  - 指定节点表单的字段作为本步骤的本步骤的身份.
  - 需要选择一个节点ID.
  #### 流程图
  ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/ShengqingFlow2.png "屏幕截图")
  #### 表单图
  ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/ShengqingBiaodan2.png "屏幕截图")
  #### 配置图
  ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/ShengqingPeizhi2.png "屏幕截图")
      `;
}
