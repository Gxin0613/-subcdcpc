import { message } from 'ant-design-vue';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import Dev2InterfaceCCBill from '../../Dev2InterfaceCCBill';
import { GloWF } from '/@/WF/Admin/GloWF';
import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';

export class GPN_BillRecJuggle extends PageBaseGroupNew {
  constructor() {
    super('GPN_BillRecJuggle');
    this.PageTitle = '数据篡改';
  }

  public async Init() {
    const frmID = this.RequestVal('FrmID');
    const workID = this.RequestVal('WorkID');

    // const frmTracks = new FrmTracks();
    // await frmTracks.Retrieve('WorkID', workID, 'ActionType', 'RecUpdate');
    this.AddGroup('A', '数据纂改');
    const sql = GloWF.SQLOfGpnBillRecJuggle(workID); //`SELECT RecName , RDT , Msg, AtPara  FROM Frm_Track WHERE WorkID='${workID}' AND ActionType IN ('RecMainUpdate','RecDtlUpdate') `;
    //this.Table('History', '修改记录', '历史修改记录', false, sql);
    this.AddTableByOptions({
      no: 'History',
      name: '修改记录',
      columns: [
        {
          title: '修改人',
          key: 'RecName',
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
          key: 'AtPara',
          width: 240,
        },
      ],
      helpDocs: '历史修改记录',
      IsMultiSelect: false,
      srcOfList: sql,
    });
    //this.AddGroup('B', '修改主表字段');
    //修改主表.
    let sqlAttrs = GloWF.srcFrmFields;
    sqlAttrs = sqlAttrs + '@FrmID=' + frmID;
    this.SelectItemsByList('Table', '修改主表字段', '请选择要修改的主表字段', false, sqlAttrs, true, true);
    this.TextBox2_NameNo('Table.Val', '修改值', '输入要修改的值', null, '修改原因', '修改值', 'abc');
    //this.AddGroup('c', '修改从表');
    //修改从表.
    const sqlDtls = GloWF.SQLOfDtls(frmID); //`SELECT No,Name FROM Sys_MapDtl WHERE FK_MapData='${frmID}'`;
    this.SelectItemsByList('Dtl', '修改从表字段', this.HelpUn, false, sqlDtls, true, true);
    this.AddTableByOptions({
      no: 'Dtl.Table',
      name: '选择修改行',
      columns: async () => {
        return await GPN_BillRecJuggle.GenerColumns(this.RequestVal('tb1', 'Dtl'));
      },
      helpDocs: '选择修改行',
      IsMultiSelect: false,
      srcOfList: async () => {
        return await GPN_BillRecJuggle.GetDtlInfo(this.RequestVal('tb1', 'Dtl'), frmID, workID);
      },
    });

    this.SelectItemsByList(
      'Dtl.Table.Attr',
      '选择字段',
      this.HelpUn,
      false,
      () => {
        const dtlNo = this.RequestVal('tb1', 'Dtl');
        const sql = GloWF.srcFrmFields_M(dtlNo);
        return sql;
      },
      true,
      true,
    );
    this.TextBox2_NameNo('Dtl.Table.Attr.Val', '修改值', '输入要修改的值', null, '修改原因', '修改值', 'abc');
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, _tb2: string, _tb3: string) {
    //主表字段修改
    const frmID = this.RequestVal('FrmID');
    const workID = this.RequestVal('WorkID');
    if (pageNo == 'Table.Val') {
      try {
        const attrKey = this.RequestVal('tb1', 'Table');
        const attrName = this.RequestVal('tb2', 'Table');
        const msg = await Dev2InterfaceCCBill.UpdateMainInfo(workID, frmID, attrKey, attrName, tb1, _tb2); //`更新主表字段[${attrKey}][${attrName}]数据由[${oldVal}]到[${tb1}]`;
        //await Dev2InterfaceCCBill.WriteTrack(geEn.EnMap.PTable, workID, msg);
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
      const msg = await Dev2InterfaceCCBill.UpdateDtlInfo(dtlNo, dtlName, oid, attrKey, attrName, tb1, workID, _tb2); //`更新主表字段[${attrKey}][${attrName}]数据由[${oldVal}]到[${tb1}]`;
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
  public static async GetDtlInfo(dtlNo: string, frmID: string, workID: number) {
    return await Dev2InterfaceCCBill.GetDtlInfo(workID, frmID, dtlNo);
  }
  override GenerSorts(_systemNo?: string): Promise<Array<any>> {
    return Promise.resolve([]);
  }
}
