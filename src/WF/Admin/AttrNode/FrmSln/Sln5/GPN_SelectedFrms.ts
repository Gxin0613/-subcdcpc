import { message } from 'ant-design-vue';
import { GloWF } from '../../../GloWF';
import { NodeExt } from '../../NodeExt';
import { FrmNodeExt } from './FrmNodeExt';
import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GPN_SelectedFrms extends PageBaseGroupNew {
  public Init() {
    this.PageTitle = '选择表单';
    //增加子页面.
    this.AddGroup('A', '选择表单');
    this.SelectItemsByGroupList('ByGroupList', '选择表单', this.Desc100, true, GloWF.srcFrmTree, GloWF.srcFrmListByEntityType);
  }

  constructor() {
    super('GPN_SelectedFrms');
    this.ForEntityClassID = 'TS.AttrNode.FrmNodeExt';
  }
  public readonly Desc100 = `
  #### 帮助
  - 请按您的需要勾选表单，点击下一步按钮就可以绑定到该节点
  `;

  /**
   *
   * 存在问题，两个类方法参数个数不同，设计的有问题
   * @last-modified 22/6/28 移除了未使用的pageName , 修改为sortNo
   * @param pageID 页面ID.
   * @param sortNo 分类编号, 可以为空.
   * @param tb1 第1个文本框的值
   * @param tb2 第2个文本框的值
   * @param tb3 第3个文本框的值
   */
  public override async Save_TextBox_X(pageID: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    const nodeID = this.RequestVal('RefPKVal');

    const node = new NodeExt();
    node.NodeID = nodeID;
    await node.Retrieve();

    //选择的元素.
    const strs = tb1.split(',');
    const names = tb2.split(',');

    for (let index = 0; index < strs.length; index++) {
      const frmID = strs[index];
      const frmNode = new FrmNodeExt();
      frmNode.FK_Frm = frmID;
      frmNode.FrmNameShow = names[index];
      frmNode.FK_Node = nodeID;
      frmNode.FK_Flow = node.FK_Flow;
      frmNode.MyPK = frmNode.FK_Frm + '_' + frmNode.FK_Node + '_' + node.FK_Flow;
      frmNode.FrmEnableRole = 0; //默认启用.
      frmNode.SetPara('EnName', 'TS.AttrNode.FrmNodeExt');
      const isHave = await frmNode.IsExits();
      if (isHave == false) frmNode.Insert();
    }

    message.info('表单已经增加表单树.');
    // alert('表单已经增加表单树.');
    // const frmNode = new FrmNodeExt();
    // const frmID = tb1;
    // const frmName = tb2;
    // frmNode.FK_Flow = node.FK_Flow;
    // frmNode.FK_Node = node.NodeID;
    // frmNode.FK_Frm = frmID;
    // frmNode.MyPK = frmNode.FK_Node + '_' + frmNode.FK_Frm;
    // frmNode.FrmNameShow = frmName;
    // const num = await frmNode.RetrieveFromDBSources();
    // if (num == 0) frmNode.Insert();
    // alert('表单已经增加表单树.');
  }

  //不需要分组,就返回空.
  GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
    //  return null;
  }
}
