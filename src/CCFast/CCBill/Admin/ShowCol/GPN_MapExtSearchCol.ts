import { message } from 'ant-design-vue';
import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
import { GloWF } from '/@/WF/Admin/GloWF';
import { FrmDict, FrmDictAttr } from '/@/CCFast/CCBill/FrmDict';
import { MapExtSearchCols, MapExtSearchCol } from '/@/CCFast/CCBill/Admin/ShowCol/MapExtSearchCol';
import { MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';

export class GPN_MapExtSearchCol extends PageBaseGroupNew {
  constructor() {
    super('GPN_MapExtSearchCol');
    this.ForEntityClassID = 'TS.CCBill.Admin.MapExtSearchCol';
    this.PageTitle = 'PC端显示的列';
  }
  public async Init() {
    const frmDict = new FrmDict();
    frmDict.setPKVal(this.RefPKVal);
    await frmDict.Retrieve();

    //增加子页面.
    this.AddGroup('A', 'PC端显示的列');
    this.entity = new FrmDict(); //对应的实体类,就是要对这个实体的枚举值进行编辑.
    const sqlGroup = GloWF.sqlGroupField(this.RefPKVal);
    const sqlFields = GloWF.sqlBillOrEnFields(this.RefPKVal);
    this.SelectItemsByGroupList('Attr', '选择字段列', this.Desc1, true, sqlGroup, sqlFields, true, FrmDictAttr.ShowCols);
    this.SetRequestVal('tb1', frmDict.ShowCols, 'Attr');
  }

  public async GenerSorts(): Promise<any> {
    return Promise.resolve(JSON.stringify([]));
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, _tb2: string, _tb3: string) {
    try {
      debugger;
      const frmDict = new FrmDict();
      frmDict.setPKVal(this.RefPKVal);
      await frmDict.Retrieve();
      const frmID = frmDict.No;
      const ens = new MapExtSearchCols();
      await ens.Retrieve(MapExtAttr.FK_MapData, frmID, 'ExtModel', 'SearchCol', 'Idx');
      const selectedAttrs = tb1.split(',').filter((item) => !!item);
      //删除取消的数据.
      for (const en of ens.filter((en) => !selectedAttrs.includes(en.AttrOfOper))) {
        await en.Delete();
      }

      const attrs = new MapAttrs();
      await attrs.Retrieve('FK_MapData', frmID);
      //循环选择的值string..
      let pri = 0;
      const task: Promise<string>[] = [];
      for (const attrKey of selectedAttrs) {
        const mapExtSearchCol = new MapExtSearchCol(frmID + '_' + attrKey + '_SearchCol');
        const skipUpdate = ens.find((item) => item.AttrOfOper === attrKey);
        console.log({ skipUpdate, attrKey });
        if (skipUpdate) continue;
        const attr = attrs.find((attr) => attr.KeyOfEn == attrKey);
        if (!attr) continue;
        mapExtSearchCol.FK_MapData = frmID;
        mapExtSearchCol.ExtModel = 'SearchCol';
        mapExtSearchCol.ExtType = 'SearchCol';
        mapExtSearchCol.AttrOfOper = attr.KeyOfEn;
        mapExtSearchCol.Tag = attr.Name; //字段名
        mapExtSearchCol.W = attr.UIWidth;
        mapExtSearchCol.Idx = pri++;
        task.push(mapExtSearchCol.Save());
      }

      if (task.length > 0) {
        await Promise.all(task);
      }

      //更新选择项.
      frmDict.ShowCols = tb1;
      frmDict.ShowColModel = 1;
      await frmDict.Update();
      message.info('设置成功,请关闭或者设置其他元素,进行编辑.');
    } catch (e) {
      console.error(e);
    }
  }

  public readonly Desc1 = `
  #### 帮助
  - 选择要显示的列.
  - 系统列出的是所有可以显示的列.
  `;
}
