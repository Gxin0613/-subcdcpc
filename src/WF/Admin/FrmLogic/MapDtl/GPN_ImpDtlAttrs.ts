import { GloWF } from '../../GloWF';
import { MapAttr } from '../MapAttrs/MapAttr';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import DBAccess from '/@/utils/gener/DBAccess';

export class GPN_ImpDtlAttrs extends PageBaseGroupNew {
  constructor() {
    super('GPN_ImpDtlAttrs');
    this.PageTitle = '导入实体字段';
  }

  public Init() {
    this.AddGroup('A', '导入实体字段');
    this.AddBlank('Imp', '准备', this.Imp);
    this.SelectItemsByList('Imp.SelectDtl', '选择从表', this.Imp_SelectDtl, false, GloWF.SQLOfMapDtl);

    //const sql = `SELECT MyPK as No, Name FROM Sys_MapAttr WHERE FK_MapData='@Imp.SelectDtl_tb1' `;
    this.SelectItemsByList('Imp.SelectDtl.SelectFields', '选择字段', this.Imp_SelectDtl_SelectFields, true, this.GenerTableFields);
  }

  //获得从表的字段.
  public async GenerTableFields() {
    const tableNo = this.RequestVal('tb1', 'Imp.SelectDtl');

    //const sql = `SELECT MyPK as No, Name FROM Sys_MapAttr WHERE FK_MapData='${tableNo}' AND KeyOfEn NOT IN ('OID','FID','RefPK','Rec','RDT','CDT') `;
    const fields = await DBAccess.RunSQLReturnTable(GloWF.SQLOfMapDtlFields(tableNo));
    return JSON.stringify(fields);
  }

  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
    // const ens = new FrmSorts();
    // await ens.Init();
    // await ens.RetrieveAll();
    // return ens;
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    if (pageNo === 'Imp.SelectDtl') {
    }
    if (pageNo === 'Imp.SelectDtl.SelectFields') {
      const frmID = this.PKVal; //表单ID，传来的主键值。

      //写入字段信息.*************************************
      const attrs = tb1.split(',');
      // const names = tb2.split(',');

      let msg = '';
      const enField = new MapAttr();
      for (let index = 0; index < attrs.length; index++) {
        const attrMyPK = attrs[index];
        enField.MyPK = attrMyPK;
        await enField.Retrieve();

        enField.MyPK = frmID + '_' + enField.Key; //设置主键.
        const isExit = await enField.IsExits();
        if (isExit == true) {
          msg += `@字段: ${attrMyPK} - ${enField.Name} 已经存在.`;
          continue; //如果存在，就不在处理.
        }

        enField.FK_MapData = frmID;
        try {
          await enField.Insert();
        } catch {
          continue;
        }

        msg += `@字段: ${attrMyPK} - ${enField.Name} 成功导入...`;
      }

      return new GPNReturnObj(GPNReturnType.Message, msg);
    }
  }
  // 准备
  public readonly Imp = `
  #### 帮助
  - 选择一个从表，然后导入字段.
  - 已经有的就自动创建.
  - 
  #### 配置图
  - sdfsdfsd
`;

  // 选择从表
  public readonly Imp_SelectDtl = `
  #### 帮助
  - csdfsadfsad
  #### 配置图
  - sdfsdfsd
`;

  // 选择字段
  public readonly Imp_SelectDtl_SelectFields = `
  #### 帮助
  - csdfsadfsad
  #### 配置图
  - sdfsdfsd
`;
}
