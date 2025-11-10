import { GloWF } from '../GloWF';
import { Cond, CondAttr } from './Cond';
import { PageBaseGroupEdit } from '/@/bp/UIEntity/PageBaseGroupEdit';

export class GPE_CondShenFenStation extends PageBaseGroupEdit {
  constructor() {
    super('GPE_CondShenFenStation');
    this.PageTitle = '岗位条件人员身份';
  }
  async Init() {
    this.entity = new Cond(); // 对应的类.
    this.KeyOfEn = CondAttr.SpecOperWay; // 人员.
    const dir = new Cond(this.PKVal);
    await dir.Retrieve();

    //增加子页面.
    this.AddGroup('A', '按发送节点提交人计算'); //增加分组.
    this.Blank('0', '发送人登录部门下所有岗位', this.HelpUn);
    this.Blank('1', '发送人的所有部门的岗位', this.HelpUn);
    this.Blank('2', '发送人选择部门+岗位', this.HelpUn);

    this.AddGroup('B', '按指定节点提交人计算'); //增加分组.
    const sql = GloWF.SQLOfNodesOfFlow(dir.FK_Flow); //`SELECT NodeID No,Name FROM WF_Node WHERE FK_Flow='${dir.FK_Flow}'`;
    this.SingleDDLSQL('10', '指定节点提交人的使用部门下所有岗位', CondAttr.SpecOperPara, this.HelpUn, sql, false);
    this.SingleDDLSQL('11', '指定节点提交人的所有部门的岗位', CondAttr.SpecOperPara, this.HelpUn, sql, false);
    this.SingleDDLSQL('24', '指定节点提交人的使用部门所使用的岗位', CondAttr.SpecOperPara, this.HelpUn, sql, false);

    const frmID = 'ND' + parseInt(dir.FK_Flow) + 'Rpt';
    const sqlFrm = GloWF.SQLOfMapAttrsGener(frmID); // 获得SQL
    this.AddGroup('C', '按表单字段人员计算'); //增加分组.
    this.SingleDDLSQL('20', '字段(参数)人员的主部门下所有的岗位', CondAttr.SpecOperPara, this.HelpUn, sqlFrm, false);
    this.SingleDDLSQL('21', '字段(参数)人员的所有部门的岗位', CondAttr.SpecOperPara, this.HelpUn, sqlFrm, false);
    this.SingleDDLSQL('22', '字段(参数)就是岗位编号', CondAttr.SpecOperPara, this.HelpUn, sqlFrm, false);

    this.AddGroup('D', '按表单字段/系统参数部门计算'); //增加分组.
    this.SingleDDLSQL('30', '字段部门下当前提交人的所有岗位', CondAttr.SpecOperPara, this.HelpUn, sqlFrm, false);
    this.SingleDDLSQL('31', '字段部门下所有人员的所有部门的岗位', CondAttr.SpecOperPara, this.HelpUn, sqlFrm, false);
    this.SingleTB('32', '系统参数部门下当前提交人的所有岗位', CondAttr.SpecOperPara, this.HelpUn, '请输入系统参数');
    this.SingleTB('33', '系统参数部门下所有人员的所有部门的岗位', CondAttr.SpecOperPara, this.HelpUn, '请输入系统参数');
  }
  public AfterSave(pageID: string, pageVal: any) {
    if (pageID == pageVal) throw new Error('Method not implemented.');
  }
  public BtnClick(pageID: string, pageVal: any, btnName: string) {
    if (pageID == pageVal || pageID === btnName) throw new Error('Method not implemented.');
  }
  public readonly Desc0 = `
  #### 说明
   - 默认为该模式。
   - 提交人员登录部门就是，条件的判断参数.
    `;

  public readonly Desc1 = `
  #### 说明
   - 指定节点的处理人作为本步骤的身份。
   - 如下图，设备维修申请人，为公司不同部门，当设备部人员检查后，认定该设备可以维护并给出报价，这时审批权就交还给申请部门的领导。
   - 那么在转向条件就设置为按角色选择，也就是把各部门领导角色的人选择出来，再确认申请人的部门，这样，具有审批权的接收人就是申请人的部门领导。
  #### 流程图
  ![输入图片说明](./resource/WF/Admin/Cond2020/Img/CondShenFenModel.png "屏幕截图")
  #### 配置图
  - 选择新增方向条件
  ![输入图片说明](./resource/WF/Admin/Cond2020/Img/CondShenFenModelSetting.png "屏幕截图")
  - 选择人员身份
  ![输入图片说明](./resource/WF/Admin/Cond2020/Img/CondShenFenModelSetting2.png "屏幕截图")
  
  `;

  public readonly Desc2 = `
  #### 说明
  - 选择的字段存储的是作为人员身份(该字段里存储的是账号)
  - 指定节点表单的字段作为本步骤的本步骤的身份。
  - 需要选择一个节点ID.
  #### 流程图
  ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/ShengqingFlow2.png "屏幕截图")
  #### 表单图
  ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/ShengqingBiaodan2.png "屏幕截图")
  #### 配置图
  ![输入图片说明](./resource/WF/Admin/AttrNode/AccepterRole/Img/ShengqingPeizhi2.png "屏幕截图")
      `;
}
