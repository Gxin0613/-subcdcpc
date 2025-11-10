import { PageBaseTreeEns } from '/@/bp/UIEntity/PageBaseTreeEns';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '../Comm/GloComm';
import HttpHandler from './FoolFormDesigner/dto/HttpHandler';
/**
 * 表单类别-表单
 */
export class TreeEns_Message extends PageBaseTreeEns {
  constructor() {
    super('TreeEns_Message');
    this.PageTitle = '消息';
  }
  //重写的构造方法.
  override async Init() {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
    const ens = await handler.DoMethodReturnJson('Message_Tree');
    // alert(ens);
    this.RootNo = '0';
    this.TreeEns = ens;
    // 定义列，这些列用于显示.
    this.Columns = [
      { id: 'MyPK', name: '标题', IsShow: false, width: 100 },
      { id: 'EmailTitle', name: '标题', width: 350 },
      { id: 'RDT', name: '日期', width: 120 },
      { id: 'IsRead', name: '读取?', width: 50 },
      { id: 'SendTo', name: '发送人', width: 100 },
    ];
    this.BtnsOfToolbar = '设置已读,发消息,'; //超链接时间
    this.EnableContextMenu = false; // 去掉右键菜单
    //    this.BtnsOfItemOptions = ''; //行操作的按钮.
    // // this.BtnsOfToolbar = '查询模式';
    // // this.BtnsOfTableTop = '目录属性,新建表单,导入表单,批量删除';
    // this.BtnsOfTableTop = '新建,数据源属性,新建数据源,帮助';
    // this.BtnsOfItemOptions = '编辑,删除,'; //行操作的按钮.
    // this.IsEnMove = true; //实体是否可以移动？
    // this.DtlEns = new SFTableNoNames();
  }

  public override async GetDtls(nodeID: string) {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Portal');
    handler.AddPara('MsgType', nodeID);
    const ens = await handler.DoMethodReturnJson('Message_Init');
    this.DtlEns = ens;
    return ens;
  }
  public async BtnClick(btnLab: string, treeNodeID: string, itemIDs: string, _selectTreeOrg, _record: Nullable<RowData> = null) {
    if (btnLab === '编辑' || btnLab === '双击行') {
      // alert(itemIDs);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer50, GloComm.UrlEn('TS.Port.SMS', _record.MyPK));
    }
    return false;
  }
}
