import { GloWF } from '../../GloWF';
import { ARBindStationSpecSta } from './ARBindStationSpecSta';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { Node } from '/@/WF/TSClass/Node';

export class GPE_ARStaModel extends PageBaseGroupEdit {
  constructor() {
    super('GPE_ARStaModel');
    this.PageTitle = '角色集合范围';
  }
  async Init() {
    this.entity = new ARBindStationSpecSta(); //对应的类.
    this.KeyOfEn = 'ARStaModel'; //要编辑的字段.

    const node = new Node(this.PKVal);
    await node.Retrieve();
    const flowNo = node.FK_Flow;

    //增加子页面.
    this.AddGroup('A', '按发送节点发送人计算'); //增加分组.
    this.Blank('0', '发送人所有的角色', this.Help0);
    this.Blank('1', '发送人使用的角色', this.Help1);

    this.AddGroup('B', '按指定节点提交人计算'); //增加分组.
    const sql = GloWF.SQLOfNodesOfFlow(flowNo); //`SELECT NodeID No,Name FROM WF_Node WHERE FK_Flow='${flowNo}' `;
    this.SelectItemsByList('10', '指定节点提交人的使用角色', this.HelpUn, false, sql, 'ARStaPara', '');
    this.SelectItemsByList('11', '指定节点提交人的所有角色', this.HelpUn, false, sql, 'ARStaPara', '');

    this.AddGroup('C', '按表单字段计算'); //增加分组.
    const frmID = 'ND' + parseInt(flowNo) + 'Rpt';
    const sqlFrm = GloWF.SQLOfMapAttrsGener(frmID); // 获得SQL
    this.SelectItemsByList('20', '字段(参数)值是人员编号-所有角色', this.HelpUn, false, sqlFrm, 'ARStaPara', '');
    this.SelectItemsByList('21', '字段(参数)值是角色编号', this.HelpUn, false, sqlFrm, 'ARStaPara', '');
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }
  public readonly Help0 = `
  #### 说明
   - 提交人所有的岗位集合,与当前的岗位集合匹配.
    `;
  public readonly Help1 = `
    #### 说明
     - 提交人登录部门下的岗位集合.
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
