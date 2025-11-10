import { GloWF } from '../../GloWF';
import { ARBindStationSpecDept } from './ARBindStationSpecDept';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';
import { Node } from '/@/WF/TSClass/Node';

export class GPE_ARDeptModel extends PageBaseGroupEdit {
  constructor() {
    super('GPE_ARDeptModel');
    this.PageTitle = '部门集合范围';
  }
  async Init() {
    this.entity = new ARBindStationSpecDept(); //对应的类.
    this.KeyOfEn = 'ARDeptModel'; //要编辑的字段.

    const node = new Node(this.PKVal);
    await node.Retrieve();
    const flowNo = node.FK_Flow;

    //增加子页面.
    this.AddGroup('A', '按发送节点发送人计算'); //增加分组.
    this.Blank('0', '(上一节点)发送人所有的部门', this.Help0);
    this.Blank('1', '(上一节点)发送人登录部门', this.Help1);
    this.Blank('2', '(上一节点)发送人使用部门', this.HelpUn);
    this.Blank('3', '(开始节点)发起人使用部门', this.HelpUn);

    this.AddGroup('B', '按指定节点提交人计算'); //增加分组.
    const sql = GloWF.SQLOfNodesAcceptRole(flowNo); //`SELECT NodeID No,CONCAT(NodeID,'_',Name) as Name FROM WF_Node WHERE FK_Flow='${flowNo}' `;
    this.SelectItemsByList('10', '指定节点提交人的使用部门', this.HelpUn, false, sql, 'ARDeptPara', '');
    this.SelectItemsByList('11', '指定节点提交人的所有部门', this.HelpUn, false, sql, 'ARDeptPara', '');
    this.SelectItemsByList('12', '指定节点提交人的主部门', this.HelpUn, false, sql, 'ARDeptPara', '');

    this.AddGroup('C', '按表单字段计算'); //增加分组.
    const frmID = 'ND' + parseInt(flowNo) + 'Rpt';
    const sqlFrm = GloWF.SQLOfMapAttrsGener(frmID); // 获得SQL
    this.SelectItemsByList('20', '字段(参数)值是人员编号-主部门', this.HelpUn, false, sqlFrm, 'ARDeptPara', '');
    this.SelectItemsByList('21', '字段(参数)值是人员编号-所有部门', this.HelpUn, false, sqlFrm, 'ARDeptPara', '');
    this.SelectItemsByList('22', '字段(参数)值是部门编号', this.HelpUn, false, sqlFrm, 'ARDeptPara', '');
    this.SingleTB('23', '系统参数值是部门编号', 'ARDeptPara', this.HelpUn, '请输入系统参数');
    //  this.TextBox2('22', '字段(参数)值是人员编号', NodeAttr.ARStationSFPara, '输入人员编号字段', 'ARStationSFPara2', '请输入部门编号字段', this.HelpUn);
    // //增加子页面.
    // this.AddGroup('A', '按组织结构绑定'); //增加分组.
    // this.Blank('0', ' 当前人员的身份（默认）', this.Desc0);
    // const node = new Node(this.PKVal);
    // await node.Retrieve();
    // const flowNo = node.FK_Flow;

    // this.SelectItemsByList('1', '指定节点的人员身份', this.Desc1, false, `SELECT NodeID No,Name FROM WF_Node WHERE FK_Flow='${flowNo}' `, NodeAttr.ShenFenModelPara);
    // this.SelectItemsByList('3', '指定节点的人员部门+岗位身份', this.Desc1, false, `SELECT NodeID No,Name FROM WF_Node WHERE FK_Flow='${flowNo}' `, NodeAttr.ShenFenModelPara);

    // const frmID = 'ND' + this.PKVal;
    // this.SelectItemsByList(
    //   '2',
    //   '按表单字段值(人员编号)作为人员身份',
    //   this.Desc2,
    //   false,
    //   `SELECT KeyOfEn No,Name FROM Sys_MapAttr WHERE FK_MapData='${frmID}' `,
    //   NodeAttr.ShenFenModelPara,
    // );
    // this.SingleDDLSQL('2', '按表单字段', '', this.Desc2, 'SELECT KeyOfEn No,Name FROM Sys_MapAttr WHERE 1=1 ', false);
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
