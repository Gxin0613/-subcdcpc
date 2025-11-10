import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { MapAttr } from './MapAttr';
import { EditType } from '/@/bp/en/EnumLab';
import { GloWF } from '../../GloWF';

export class GPN_String2SFSSQL extends PageBaseGroupNew {
  constructor() {
    super('GPN_String2SFSSQL');
    this.PageTitle = '转成数据源字段';
  }
  public async Init() {
    //获得 mapAttr.
    const mapAttr = new MapAttr(this.RequestVal('PKVal'));
    await mapAttr.Retrieve();
    if (mapAttr.HisEditType == EditType.UnDel) {
      alert('系统字段不能设置.');
      return;
    }

    //增加子页面.
    this.AddGroup('A', '转成数据源字段');
    this.SelectItemsByList('Dict', '选择数据源', this.HelpTodo, false, GloWF.srcSFTable);
  }

  public async GenerSorts(): Promise<any[]> {
    return null;
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    try {
      const refPKVal = this.RequestVal('PKVal');
      //获得 mapAttr.
      const mapAttr = new MapAttr(refPKVal);
      await mapAttr.Retrieve();
      //检查是否有影子字段?
      const attrT = new MapAttr(mapAttr.FK_MapData + '_' + mapAttr.KeyOfEn + 'T');
      const val = await attrT.RetrieveFromDBSources();
      if (val == 0) {
        const val = window.confirm('没有外部数据源的隐藏影子字段,您确定要,名字为[' + mapAttr.KeyOfEn + 'T]的字段.');
        if (val == false) {
          return new GPNReturnObj(GPNReturnType.Error, '没有影子字段,创建失败.');
        }
        attrT.MyPK = mapAttr.FK_MapData + '_' + mapAttr.KeyOfEn + 'T';
        attrT.KeyOfEn = mapAttr.KeyOfEn + 'T';
        attrT.UIVisible = 0;
        await mapAttr.Insert();
      } else {
        attrT.UIVisible = 0;
        await attrT.Update();
      }
      mapAttr.UIContralType = 1;
      mapAttr.UIBindKey = tb1;
      await mapAttr.Update();
      //检查是否有影子字段.
    } catch (e: any) {
      return new GPNReturnObj(GPNReturnType.Error, e.toString());
    }
  }
}
