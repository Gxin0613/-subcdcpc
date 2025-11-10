import { PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import HttpHandler from '../../utils/gener/HttpHandler';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import BSEntity from '/@/utils/gener/BSEntity';
import { GetPara, IsMobile } from '/@/utils/gener/StringUtils';
import dayjs from 'dayjs';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';

export class GL_BatchWorkCheckModel extends PageBaseGenerList {
  constructor() {
    super('GL_BatchWorkCheckModel');
    this.PageTitle = '批处理';
  }
  //重写的构造方法.
  async Init() {
    this.LinkField = 'Title';
    this.Icon = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    // 返回批处理,
    this.BtnOfToolbar = '发送,退回';

    // 定义列，这些列用于显示. IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: 'Title', Name: '标题', IsShow: true, DataType: 1, width: 200 },
      { Key: 'WorkID', Name: 'WorkID', IsShow: false, DataType: 1, width: 200 },
      { Key: 'NodeID', Name: '节点ID', IsShow: false, DataType: 1, width: 66 },
      { Key: 'Name', Name: '节点名称', IsShow: false, DataType: 1, width: 200 },
      { Key: 'BatchRole', Name: '规则', IsShow: false, DataType: 1, width: 200 },
      { Key: 'StarterName', Name: '发起人', IsShow: true, DataType: 1, width: 200 },
      { Key: 'ADT', Name: '接收日期', IsShow: true, DataType: 1, width: 200 },
      { Key: 'Num', Name: '待办数量', IsShow: false, DataType: 7, width: 144 },
      { Key: 'FlowNote', Name: '审核意见', IsShow: false, DataType: 1, width: 144 },
    ];

    //获得数据源.
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt_Batch');
    handler.AddPara('FK_Node', this.params.NodeID); //参数.
    const data: any = await handler.DoMethodReturnJson('WorkCheckModel_Init');
    data['Works'].forEach((en) => {
      en.Title = en.Title || en.TITLE || en.title;
      en.WorkID = en.WorkID || en.WORKID || en.workid || en.OID || en.oid;
      en.NodeID = en.NodeID || en.NODEID || en.nodeid;
      en.No = en.No || en.NO || en.no;
      en.StarterName = en.StarterName || en.STARTNAME || en.startname;
      en.Num = en.Num || en.NUM || en.num;
      en.FlowNote = en.FlowNote || en.FLOWNOTE || en.flownote;

      //时间统一长度
      en.ADT = !!en.ADT ? (en.ADT == '无' ? '无' : dayjs(en.ADT).format('YYYY-MM-DD HH:mm')) : '';
    });

    this.Data = data;

    const node = new BSEntity('BP.WF.Node', this.params?.NodeID);
    await node.RetrieveFromDBSources();
    console.log(node);
    let BatchCheckNoteModel = GetPara(node?.data.AtPara, 'BatchCheckNoteModel');
    if (BatchCheckNoteModel == undefined) BatchCheckNoteModel = '0'; //审核意见填写方式,默认为选择的Item一个意见.
    //判断是否添加列
    const files = GetPara(node.data.AtPara, 'BatchFields') || '';
    // const batchListCount = GetPara(node?.data.AtPara, 'BatchCheckListCount');
    for (let i = 0; i < data.Sys_MapAttr.length; i++) {
      const attr = data.Sys_MapAttr[i];
      if (files == undefined) continue;
      if (files.indexOf(attr.KeyOfEn) == -1) continue;
      if (attr.Name == '审核意见') continue;
      this.Columns.push({
        title: attr.Name,
        dataIndex: attr.KeyOfEn,
      });
    }
  }

  //打开页面.
  async LinkFieldClick(object: Record<string, any>) {
    const node = new BSEntity('BP.WF.Node', this.params?.NodeID);
    await node.RetrieveFromDBSources();
    const url = '/#/WF/MyFlow?WorkID=' + object.WorkID + '&NodeID=' + node.NodeID + '&FlowNo=' + node?.data?.FK_Flow + '&FID=' + object.FID + '&PNodeID=' + object.PNodeID;
    if (IsMobile()) {
      const flowOpenModel = CommonConfig.FlowOpenModel || 0;
      if (flowOpenModel === 0) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
      if (flowOpenModel === 1) return new GPNReturnObj(GPNReturnType.OpenUrlByModal, url);
      if (flowOpenModel === 2) return new GPNReturnObj(GPNReturnType.OpenUrlByTab, url);
      if (flowOpenModel === 3) return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    } else {
      // const url = '/#/WF/MyFlow?WorkID=' + object.WorkID + '&FK_Node=' + node.NodeID + '&FK_Flow=' + node.data.FK_Flow + '&FlowNo=' + node.data.FK_Flow + '&FID=' + node.data.FID;
      //要根据不同的, 如何转向?  /#/WF/Comm/GenerList?EnName=GL_Batch
      window.open(url); //打开页面。
      // return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }
  }

  BtnClick(btnName: string, object: Record<string, any>) {
    // if (btnName === '返回批处理') {
    //   const url = '/src/WF/Comm/GL?EnName=GL_Batch';
    //   const obj = new GPNReturnObj(GPNReturnType.GoToUrl, url);
    //   return obj;
    // }
    if (btnName === object.WorkID) return null;
    // throw new Error('Method not implemented.');
  }
}
