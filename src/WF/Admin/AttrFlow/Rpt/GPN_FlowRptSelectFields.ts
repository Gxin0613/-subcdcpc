import HttpHandler from '../../FoolFormDesigner/dto/HttpHandler';
import { MapAttr, MapAttrs } from '../../FrmLogic/MapAttrs/MapAttr';
import { GloWF } from '../../GloWF';
import { Node } from '/@/WF/TSClass/Node';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { useDBSourceLoader } from '/@/hooks/ens/useDBSourceLoader';
import DBAccess from '/@/utils/gener/DBAccess';
export class GPN_FlowRptSelectFields extends PageBaseGroupNew {
  constructor() {
    super('GPN_FlowRptSelectFields');
    this.PageTitle = '流程列表设置';
  }
  public async Init() {
    this.AddGroup('A', '字段内容');
    const flowNo = this.PKVal.replace('FlowRpt', '');

    // 获取节点的NodeFromID.
    const nodeID = parseInt(flowNo + '01');
    const node = new Node(nodeID);
    await node.Retrieve();
    let frmID = node.NodeFrmID; //'ND' + parseInt(this.PKVal) + '01';
    if (frmID == '') frmID = 'ND' + parseInt(flowNo) + '01';

    //增加子页面.
    //`SELECT OID as No, Lab as Name FROM Sys_GroupField WHERE FrmID='${frmID}' AND (CtrlID = '' OR CtrlID IS NULL) `;
    const attrSQL = GloWF.SQLOfGpeFlowBuessFields(frmID);

    // ` SELECT KeyOfEn AS No, Name, GroupID AS GroupNo FROM Sys_MapAttr WHERE FK_MapData='${frmID}'
    // AND UIContralType <=4 AND KeyOfEn NOT IN ('OID','Rec','RDT','FID','Title','BillNo','BillState','FlowStarter',
    // 'FlowEmps','FlowStartRDT','WFState','Emps')
    // AND UIVisible=1 ORDER BY GroupID,Idx
    // `;
     const { getDBSource } = useDBSourceLoader();
    this.SelectItemsByGroupList('SelectAttrs', '选择字段', this.SelectAttrs, true, async ()=>{
      const groupSQL = GloWF.SQLOfGpnMethodGroupSQL(frmID); 
      const groupList = await getDBSource(groupSQL)||[];
      return JSON.stringify([{No:'SystemNo',Name:'系统信息'}].concat(groupList));
    }, async ()=>{
      const attrSQL = GloWF.SQLOfGpeFlowBuessFields(frmID); 
      const attrList = await getDBSource(attrSQL)||[];
      const sysAttrs=[
        {No:'Starter',Name:'发起人编号',GroupNo:'SystemNo'},
        {No:'StarterName',Name:'发起人',GroupNo:'SystemNo'},
        {No:'FK_Node',Name:'停留节点编号',GroupNo:'SystemNo'},
        {No:'NodeName',Name:'停留节点',GroupNo:'SystemNo'},
        {No:'TodoEmps',Name:'当前处理人',GroupNo:'SystemNo'},
        {No:'Emps',Name:'参与人',GroupNo:'SystemNo'},
        {No:'FlowRDT',Name:'发起日期',GroupNo:'SystemNo'},
        {No:'SendDT',Name:'发送日期',GroupNo:'SystemNo'},
        {No:'PRI',Name:'优先级',GroupNo:'SystemNo'}
      ]
      return JSON.stringify(sysAttrs.concat(attrList));
    });

    // this.SelectItemsByGroupList('TS', '查询条件', this.SelectAttrs, true, groupSQL, attrSQL);
  }

  public override async Save_TextBox_X(pageNo: string, _sortNo: string, tb1: string, _tb2: string, _tb3: string) {
    if (pageNo == 'SelectAttrs') {
      const flowNo = this.PKVal.replace('FlowRpt', '');

      //获取表单的ID,有可能是绑定的单表单.
      const node = new Node(parseInt(flowNo + '01'));
      await node.Retrieve();
      let frmID = node.NodeFrmID;
      if (frmID == '') frmID = 'ND' + parseInt(flowNo) + '01';

      //查询出来所有数据.
      const mapAttrs = new MapAttrs();
      await mapAttrs.Retrieve('FK_MapData', frmID);

      //删除原来的字段.
      const dictID = 'FlowRpt' + flowNo;
      const mapAttrsDict = new MapAttrs();
      await mapAttrsDict.Delete('FK_MapData', dictID);

     
      // const deleteQueue: Promise<any>[] = [];
      // for (const mapAttr of mapAttrsDict) {
      //   if (mapAttr.KeyOfEn == 'OID') continue;
      //   if (mapAttr.KeyOfEn == 'Title') continue;
      //   if (mapAttr.KeyOfEn == 'WFState') continue;
      //   if (mapAttr.KeyOfEn == 'BillNo') continue;
      //   if (mapAttr.KeyOfEn == 'BillState') continue;
      //   if (mapAttr.KeyOfEn == 'BillSta') continue;
      //   deleteQueue.push(mapAttr.Delete());
      // }
      // await Promise.all(deleteQueue);
      const strs = tb1.split(',');
      let idx = 1;
      const sysAttrs=[
        {No:'Starter',Name:'发起人编号'},
        {No:'StarterName',Name:'发起人'},
        {No:'FK_Node',Name:'停留节点编号'},
        {No:'NodeName',Name:'停留节点'},
        {No:'TodoEmps',Name:'当前处理人'},
        {No:'Emps',Name:'参与人'},
        {No:'FlowRDT',Name:'发起日期'},
        {No:'SendDT',Name:'发送日期'},
        {No:'PRI',Name:'优先级'}
      ]
      for (const str of strs) {
        const mapAttr = mapAttrs.find((attr) => attr.KeyOfEn === str);
        if (!mapAttr){
          //有可能是系统字段，可以增加系统字段的
          const attr = sysAttrs.find(item=>item.No===str)
          if(!!attr){
              const mapAttr = new MapAttr();
              mapAttr.CopyJson(JSON.stringify(Object.fromEntries(mapAttrs[0].Row)));
              mapAttr.FK_MapData = dictID;
              mapAttr.KeyOfEn = str;
              mapAttr.Name = attr.Name
              if(str === 'FK_Node' || str == 'PRI')
                mapAttr.MyDataType = 2;
              else
                mapAttr.MyDataType = 1;
              mapAttr.UIContralType = 0;
              mapAttr.LGType = 0;
              mapAttr.Tag ="SystemField";
              mapAttr.MyPK= dictID+'_'+str;
              await mapAttr.Insert();
          }
          continue;
        }
        //判断是否有T字段显示
        const mapAttrT = mapAttrs.find((attr) => attr.KeyOfEn === str + 'T');
        const myattr = new MapAttr(mapAttr.MyPK);
        const num = await myattr.RetrieveFromDBSources();
        if (num == 0) continue;

        myattr.FK_MapData = dictID;
        myattr.MyPK = mapAttr.FK_MapData + '_' + str;
        idx++;
        myattr.Idx = idx;
        await myattr.Insert();
        if (!!mapAttrT) {
          myattr.FK_MapData = dictID;
          myattr.MyPK = mapAttr.FK_MapData + '_' + str + 'T';
          myattr.KeyOfEn = str + 'T';
          idx++;
          myattr.Idx = idx;
          myattr.UIVisible = 0;
          await myattr.Insert();
        }
      }
       //补全数据数据.
      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Rpt');
      handler.AddPara('FlowNo', flowNo); //流程编号. FlowRpt001
      handler.DoMethodReturnString('SearchFlow_InitFields');

      return new GPNReturnObj(GPNReturnType.Message, '设置完成，请点击关闭按钮.');
    }
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  // 新建string枚举
  public readonly SelectAttrs = `
  #### 帮助
  - 您看到的是流程的业务字段,选择这些字段组成查询列表.
  - 选择要展示的字段，点击下一步.

  `;
}
