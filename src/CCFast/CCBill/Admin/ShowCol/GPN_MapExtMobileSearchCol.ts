import { message } from 'ant-design-vue';
import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { MapAttrs } from '/@/WF/Admin/FrmLogic/MapAttrs/MapAttr';
import { GloWF } from '/@/WF/Admin/GloWF';
import { FrmDict, FrmDictAttr } from '/@/CCFast/CCBill/FrmDict';
import { MapExtMobileSearchCols, MapExtMobileSearchCol } from '/@/CCFast/CCBill/Admin/ShowCol/MapExtMobileSearchCol';
import { MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';

export class GPN_MapExtMobileSearchCol extends PageBaseGroupNew {
  constructor() {
    super('GPN_MapExtMobileSearchCol');
    this.ForEntityClassID = 'TS.CCBill.Admin.MapExtMobileSearchCol';
    this.PageTitle = 'PC端显示的列';
  }
  public async Init() {
    //增加子页面.
    this.AddGroup('A', 'Mobile端显示的列');
    this.entity = new FrmDict(); //对应的实体类,就是要对这个实体的枚举值进行编辑.
    const sqlGroup = GloWF.sqlGroupField(this.RefPKVal);
    const sqlFields = GloWF.sqlBillOrEnFields(this.RefPKVal);
    this.SelectItemsByGroupList('Attr', '选择字段列', this.Desc1, true, sqlGroup, sqlFields, true, FrmDictAttr.ShowCols);
  }

  public async GenerSorts(): Promise<any> {
    return Promise.resolve(JSON.stringify([]));
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, _tb2: string, _tb3: string) {
    const frmDict = new FrmDict();
    frmDict.setPKVal(this.RefPKVal);
    await frmDict.Retrieve();

    const frmID = frmDict.No;
    const ens = new MapExtMobileSearchCols();
    await ens.Retrieve(MapExtAttr.FK_MapData, frmID, 'ExtModel', 'SearchCol');

    //删除取消的数据.
    for (let index = 0; index < ens.length; index++) {
      const en = ens[index];
      if (tb1.indexOf(en.KeyOfEn + ',') >= 0) continue; // 跳过
      await en.Delete();
    }

    const attrs = new MapAttrs();
    await attrs.Retrieve('FK_MapData', frmID);

    //选择的元素.
    const strs = tb1.split(',');
    //const names = tb2.split(',');
    //循环选择的值string.
    for (let index = 0; index < strs.length; index++) {
      const attrKey = strs[index];
      const mapExtMobileSearchCol = new MapExtMobileSearchCol();
      mapExtMobileSearchCol.MyPK = frmID + '_' + attrKey + '_MobileSearchCol'; // + sysEnum.IntKey;
      mapExtMobileSearchCol.setPKVal(mapExtMobileSearchCol.MyPK);
      const isHave = ens.filter((item) => item.KeyOfEn === attrKey).length > 0 ? true : false;
      if (isHave == true) continue;
      const attr = attrs.filter((attr) => attr.KeyOfEn == attrKey)[0];
      mapExtMobileSearchCol.FK_MapData = frmID;
      mapExtMobileSearchCol.ExtModel = 'MobileSearchCol';
      mapExtMobileSearchCol.ExtType = 'MobileSearchCol';
      mapExtMobileSearchCol.AttrOfOper = attr.KeyOfEn;
      mapExtMobileSearchCol.Tag = attr.Name; //字段名
      mapExtMobileSearchCol.W = attr.UIWidth;
      mapExtMobileSearchCol.PRI = index;
      await mapExtMobileSearchCol.Insert();
    }

    //更新选择项.
    frmDict.ShowMobileCols = tb1;
    frmDict.ShowColMobileModel = 1;
    await frmDict.Update();

    message.info('设置成功,请关闭或者设置其他元素,进行编辑.');
    return;
  }

  public readonly Desc1 = `
  #### 帮助
  - 选择要显示的列.
  - 系统列出的是所有可以显示的列.
  `;
}
