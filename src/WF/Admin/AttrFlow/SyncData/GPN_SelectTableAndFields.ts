import { GloWF } from '../../GloWF';
import { SyncData } from './SyncData';
import { SyncDataField } from './SyncDataField';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GPN_SelectTableAndFields extends PageBaseGroupNew {
  public async Init() {
    //增加子页面.
    this.AddGroup('A', '选择流程业务字段,在选择要同步的数据表'); //增加分组.

    // 获取参数,获取主键.
    const sdPKVal = this.RequestVal('RefPKVal');
    const sd = new SyncData();
    sd.MyPK = sdPKVal;
    await sd.RetrieveFromDBSources();
    const valInt = Number.parseInt(sd.FlowNo);

    //按角色计算.
    const srcOfList = GloWF.SQLOfSelectTableAndFields(valInt); //`SELECT KeyOfEn as No, Name FROM Sys_MapAttr WHERE FK_MapData='ND${valInt}Rpt'  ORDER BY GroupID,Idx`;
    this.SelectItemsByList('DBSrc', '选择要同步的数据', this.Docs0, true, srcOfList);
  }
  constructor() {
    super('GPN_SelectTableAndFields');
    this.PageTitle = '表与字段';
    this.ForEntityClassID = 'TS.AttrFlow.SyncDataField';
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
    // const refPKVal = this.RequestVal('RefPKVal');
    // //查询出来数据.
    // const syncData = new SyncData();
    // syncData.MyPK = refPKVal;
    // await syncData.RetrieveFromDBSources();

    // const sfDBSrc = new BSEntity('BP.Sys.SFDBSrc');
    // sfDBSrc.No = syncData.DBSrc;
    // await sfDBSrc.Retrieve();

    // const tables = sfDBSrc.DoMethodReturnJSON('GetTablesJSON');
    // return tables;
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    const refPKVal = this.RequestVal('RefPKVal');
    //查询出来数据.
    const syncData = new SyncData();
    syncData.MyPK = refPKVal;
    await syncData.RetrieveFromDBSources();
    if (!syncData.PTable && syncData.PTable != sortNo) {
      const msg = `您确定要更改同步到的数据表吗？原来的表是[${syncData.PTable}],现在的表是[${sortNo}]'`;
      if (window.confirm(msg) == true) {
        syncData.PTable = sortNo; //选择的要同步到的数据表.
        await syncData.Update();
      }
    }

    const attrs = tb1.split(',');
    const names = tb2.split(',');

    const en = new SyncDataField();
    for (let index = 0; index < attrs.length; index++) {
      const attr = attrs[index];

      en.MyPK = refPKVal + '_' + attr; //设置主键.
      const isExit = await en.IsExits();
      if (isExit == true) continue; //如果存在，就不在处理.

      en.RefPKVal = refPKVal;
      en.AttrKey = attr;
      en.AttrName = names[index];
      en.AttrType = 1; // names[index]; //字段类型.
      en.IsSync = true; //是否同步？
      en.FlowNo = syncData.FlowNo;
      await en.Insert();
    }

    //关闭并刷新.
    return new GPNReturnObj(GPNReturnType.CloseAndReload);
  }
  // 按表单字段计算
  public readonly Docs0 = `
  #### 帮助
  - 请在右边的下拉框里选择要同步的数据表.
  - 选择要同步的流程业务字段.
  - 点击创建按钮，系统就会自动把要同步的业务字段信息，写入到从表里.
  - 通过配置流程数据与要同步的字段关系,完成同步内容设置.
`;

  //按人员计算
  public readonly Docs1 = `
  #### 帮助
  - 自动抄送给要绑定的人员.
`;
}
