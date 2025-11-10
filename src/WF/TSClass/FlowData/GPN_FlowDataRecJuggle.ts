import { message } from 'ant-design-vue';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloWF } from '/@/WF/Admin/GloWF';
import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
import { GenerWorkFlowExt } from '/@/WF/TSClass/FlowData/GenerWorkFlowExt';
import { Node } from '/@/WF/TSClass/Node';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { markRaw } from 'vue';
import Ath from '/@/WF/CCForm/Ath.vue';

export class GPN_FlowDataRecJuggle extends PageBaseGroupNew {
  constructor() {
    super('GPN_FlowDataRecJuggle');
    this.PageTitle = '数据篡改';
  }

  public async Init() {
    const gf = new GenerWorkFlowExt();
    gf.WorkID = this.PKVal;
    await gf.Retrieve();
    const node = new Node();
    node.NodeID = gf.FK_Node;
    await node.Retrieve();
    const frmID = node.NodeFrmID || 'ND' + parseInt(gf.FK_Flow) + 'Rpt';

    this.AddGroup('A', '数据纂改');
    //const sql = `SELECT EmpFromT , RDT , Msg, NodeData  FROM ${'ND' + parseInt(gf.FK_Flow) + 'Track'} WHERE WorkID='${this.PKVal}' AND ActionType IN (35,36) `;
    this.AddTableByOptions({
      no: 'History',
      name: '修改记录',
      columns: [
        {
          title: '修改人',
          key: 'EmpFromT',
          width: 120,
        },
        {
          title: '修改日期',
          key: 'RDT',
          width: 100,
        },
        {
          title: '修改信息',
          key: 'Msg',
          width: 240,
        },
        {
          title: '修改原因',
          key: 'NodeData',
          width: 240,
        },
      ],
      helpDocs: '历史修改记录',
      IsMultiSelect: false,
      srcOfList: GloWF.SQLOfDataRecHistory(parseInt(gf.FK_Flow), this.PKVal),
    });
    //this.AddGroup('B', '修改主表字段');
    //修改主表.
    let sqlAttrs = GloWF.srcFrmFields;
    sqlAttrs = sqlAttrs + '@FrmID=' + frmID;
    this.SelectItemsByList('Table', '修改主表字段', '请选择要修改的主表字段', false, sqlAttrs, true, true);
    this.TextBox2_NameNo('Table.Val', '修改值', '输入要修改的值', null, '修改原因', '修改值', 'abc');
    //修改从表.
    //const sqlDtls = `SELECT No,Name FROM Sys_MapDtl WHERE FK_MapData='${frmID}'`;
    this.SelectItemsByList('Dtl', '修改从表字段', this.HelpUn, false, GloWF.SQLOfDtls(frmID), true, true);
    this.AddTableByOptions({
      no: 'Dtl.Table',
      name: '选择修改行',
      columns: async () => {
        return await GPN_FlowDataRecJuggle.GenerColumns(this.RequestVal('tb1', 'Dtl'));
      },
      helpDocs: '选择修改行',
      IsMultiSelect: false,
      srcOfList: async () => {
        return await GPN_FlowDataRecJuggle.GetDtlInfo(this.RequestVal('tb1', 'Dtl'), this.PKVal);
      },
    });

    this.SelectItemsByList(
      'Dtl.Table.Attr',
      '选择字段',
      this.HelpUn,
      false,
      () => {
        const dtlNo = this.RequestVal('tb1', 'Dtl');
        const sql = GloWF.srcFrmFields + '@FrmID=' + dtlNo;
        return sql;
      },
      true,
      true,
    );
    this.TextBox2_NameNo('Dtl.Table.Attr.Val', '修改值', '输入要修改的值', '', '修改原因', '修改值', '');

    //修改从表.
    //const sqlAths = `SELECT NoOfObj as No,Name FROM Sys_FrmAttachment WHERE FK_MapData='${frmID}'`;
    this.SelectItemsByList('Ath', '修改上传附件', this.HelpUn, false, GloWF.SQLOfFullAth(frmID), true, true);
    this.SelfComponent('Ath.Table', '附件列表', markRaw(Ath), {}, () => {
      return { FrmID: frmID, PKValue: gf.WorkID, WorkID: gf.WorkID, FK_Node: gf.FK_Node, FK_Flow: gf.FK_Flow, FK_FrmAttachment: frmID + '_' + this.RequestVal('tb1', 'Ath') };
    });
    //this.AddGoToIFrm('Ath.Table', '附件列表', `/#/WF/GL/Ath?FrmID=${frmID}&WorkID=${gf.WorkID}&FK_Node=${ gf.FK_Node}&FK_Flow=${gf.FK_Flow}&FK_FrmAttachment=${this.RequestVal('tb1', 'Ath')}`);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, _tb2: string, _tb3: string) {
    //主表字段修改
    const workID = this.PKVal;
    if (pageNo == 'Table.Val') {
      try {
        const attrKey = this.RequestVal('tb1', 'Table');
        const attrName = this.RequestVal('tb2', 'Table');
        const msg = await GPN_FlowDataRecJuggle.UpdateMainInfo(workID, attrKey, attrName, tb1, _tb2); //`更新主表字段[${attrKey}][${attrName}]数据由[${oldVal}]到[${tb1}]`;
        return new GPNReturnObj(GPNReturnType.Message, msg + '更新成功');
      } catch (error: any) {
        message.error(error);
      }
    }
    if (pageNo == 'Dtl.Table.Attr.Val') {
      const dtlNo = this.RequestVal('tb1', 'Dtl'); //从表编码
      const dtlName = this.RequestVal('tb2', 'Dtl'); //从表编码
      const oid = this.RequestVal('tb1', 'Dtl.Table'); //选择行的数据
      const attrKey = this.RequestVal('tb1', 'Dtl.Table.Attr'); //修改的字段
      const attrName = this.RequestVal('tb2', 'Dtl.Table.Attr'); //修改的字段名称
      const msg = await GPN_FlowDataRecJuggle.UpdateDtlInfo(dtlNo, dtlName, oid, attrKey, attrName, tb1, workID, _tb2); //`更新主表字段[${attrKey}][${attrName}]数据由[${oldVal}]到[${tb1}]`;
      return new GPNReturnObj(GPNReturnType.Message, msg + '更新成功');
    }
  }

  public static async GenerColumns(dtlNo: string) {
    const columns: any[] = [];
    const attrs = new MapAttrs();
    await attrs.Retrieve('FK_MapData', dtlNo, 'UIVisible', 1);
    columns.push({
      title: '序号',
      key: 'No',
      width: 50,
      render: (_, index) => {
        return `${index + 1}`;
      },
    });
    attrs.forEach((attr) => {
      columns.push({
        title: attr.Name,
        key: attr.KeyOfEn,
        width: attr.UIWidth,
      });
    });
    return columns;
  }
  public static async GetDtlInfo(dtlNo: string, oid: number) {
    try {
      const gwf = new GenerWorkFlowExt();
      gwf.WorkID = oid;
      await gwf.Retrieve();
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_CCForm');
      handler.AddPara('WorkID', oid);
      handler.AddPara('PWorkID', gwf.PWorkID);
      handler.AddPara('FID', gwf.PFID);
      handler.AddPara('FrmID', dtlNo);
      handler.AddPara('NodeID', gwf.FK_Node);
      const data = await handler.DoMethodReturnString('Dtl_DataOfPage');
      return data['DT'];
    } catch (e) {
      message.error(e as string);
    }
    return null;
  }

  public static async UpdateMainInfo(oid: number, keyOfEn: string, name: string, val: string, msg: string): Promise<string> {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handler.AddPara('WorkID', oid);
    handler.AddPara('KeyOfEn', keyOfEn);
    handler.AddPara('Name', name);
    handler.AddPara('Val', encodeURIComponent(val));
    handler.AddPara('Msg', msg);
    return await handler.DoMethodReturnString('FlowData_UpdateMainInfo');
  }
  public static async UpdateDtlInfo(dtlNo: string, dtlName: string, oid: string, keyOfEn: string, name: string, val: string, refPK: number, msg: string): Promise<string> {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_WorkOpt');
    handler.AddPara('DtlNo', dtlNo);
    handler.AddPara('DtlName', dtlName);
    handler.AddPara('OID', oid);
    handler.AddPara('RefPK', refPK);
    handler.AddPara('KeyOfEn', keyOfEn);
    handler.AddPara('Name', name);
    handler.AddPara('Val', encodeURIComponent(val));
    handler.AddPara('Msg', msg);
    return await handler.DoMethodReturnString('FlowData_UpdateDtlInfo');
  }
  override GenerSorts(_systemNo?: string): Promise<Array<any>> {
    return Promise.resolve([]);
  }
}
