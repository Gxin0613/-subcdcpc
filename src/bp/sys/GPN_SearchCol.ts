import { message } from 'ant-design-vue';
import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { MapExtAttr } from '/@/WF/Admin/FrmLogic/MapExt';
import { ClassFactory } from '/@/bp/da/ClassFactory';
import { EnCfg } from '/@/bp/sys/EnCfg';
import { EnSearchCol, EnSearchCols } from '/@/bp/sys/EnSearchCol';

export class GPN_SearchCol extends PageBaseGroupNew {
  constructor() {
    super('GPN_SearchCol');
    this.ForEntityClassID = 'TS.Sys.EnSearchCol';
    this.PageTitle = 'PC端显示的列';
  }
  public async Init() {
    //增加子页面.
    this.AddGroup('A', 'PC端显示的列');
    this.entity = new EnCfg(); //对应的实体类,就是要对这个实体的枚举值进行编辑.
    this.SelectItemsByGroupList('1', '选择字段列', this.Desc1, true, await this.GenerGroups(), await this.GenerAttrs(), false, 'ShowCols');
  }
  public async GenerSorts(): Promise<any> {
    return Promise.resolve(JSON.stringify([]));
  }
  public async GenerGroups() {
    const en = await ClassFactory.GetEn(this.RefPKVal);
    const groups = en._enMap.attrs.groups.map((group) => {
      return {
        Name: group.key,
        No: group.name,
      };
    });
    return JSON.stringify(groups);
  }
  public async GenerAttrs() {
    const en = await ClassFactory.GetEn(this.RefPKVal);
    const attrs = en._enMap.attrs
      .filter((attr) => !!attr.UIVisible)
      .map((attr) => {
        return {
          Name: attr.Desc,
          No: attr.Key,
          GroupNo: attr.GroupName,
        };
      });
    //如何获取该实体的EnMap的 KeyOfEn, Name 两个属性生成json.返回过去.
    return JSON.stringify(attrs);
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, _tb2: string, _tb3: string) {
    const enCfg = new EnCfg();
    enCfg.setPKVal(this.RefPKVal);
    await enCfg.Retrieve();

    const frmID = enCfg.No;
    const ens = new EnSearchCols();
    await ens.Retrieve(MapExtAttr.FK_MapData, frmID, 'ExtModel', 'SearchCol', 'Idx');
    //选择的元素.
    const selectedAttrs = tb1.split(',');
    //删除取消的数据.
    for (const en of ens.filter((en) => !selectedAttrs.includes(en.KeyOfEn))) {
      await en.Delete();
    }

    const en = await ClassFactory.GetEn(this.RefPKVal);
    const attrs = en._enMap.attrs;
    //循环选择的值string.
    let pri = 0;
    for (const attrKey of selectedAttrs) {
      const enSearchCol = new EnSearchCol();
      enSearchCol.MyPK = frmID + '_' + attrKey + '_SearchCol'; // + sysEnum.IntKey;
      enSearchCol.setPKVal(enSearchCol.MyPK);
      const skipUpdate = ens.find((item) => item.KeyOfEn === attrKey);
      if (skipUpdate) continue;
      const attr = attrs.find((attr) => attr.Key == attrKey);
      if (!attr) continue;
      enSearchCol.FK_MapData = frmID;
      enSearchCol.ExtModel = 'SearchCol';
      enSearchCol.ExtType = 'SearchCol';
      enSearchCol.AttrOfOper = attr.Key;
      enSearchCol.Tag = attr.Desc; //字段名
      enSearchCol.W = attr.UIWidth;
      enSearchCol.Idx = pri++;
      await enSearchCol.Insert();
    }

    //更新选择项.
    enCfg.ShowCols = tb1;
    enCfg.ShowColModel = 1;
    await enCfg.Update();
    message.info('设置成功.');
  }

  public readonly Desc1 = `
  #### 帮助
  - 选择要显示的列.
  - 系统列出的是所有可以显示的列.
  `;
}
