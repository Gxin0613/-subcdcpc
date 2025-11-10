import { MapAttr } from '../../MapAttrs/MapAttr';
import { FieldNumColor } from './FieldNumColor';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';

export class GPN_FieldNumColor extends PageBaseGroupNew {
  constructor() {
    super('GPN_FieldNumColor');
    this.ForEntityClassID = 'TS.MapExt.FieldNumColor';
    this.PageTitle = '新建颜色范围';
  }
  public Init() {
    //增加子页面.
    this.AddGroup('A', '绑定正则');
    this.TextBox3_NameNoNote('RegularExpressionSelf', '设置颜色', this.Desc1, null, '最小值', '颜色值(点帮助)', '最大值');
  }

  public async GenerSorts(): Promise<any[]> {
    return [];
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    const refPKVal = this.RequestVal('RefPKVal');

    //获得mapAttr.
    const mapAttr = new MapAttr(refPKVal);
    await mapAttr.Retrieve();

    const en = new FieldNumColor();
    en.ExtModel = 'FieldNumColor';
    en.Tag = _tb1; //颜色
    en.Tag1 = _tb2; //最小值.
    en.Tag2 = _tb3; //最大值.
    en.FK_MapData = mapAttr.FK_MapData;
    en.AttrOfOper = mapAttr.KeyOfEn;
    en.RefPKVal = refPKVal;

    en.SetPara('EnName', 'TS.MapExt.FieldNumColor');
    await en.Insert();
    return new GPNReturnObj(GPNReturnType.CloseAndReload, '增加成功.');

    //const url = GloComm.UrlEn('TS.MapExt.FieldNumColor', en.MyPK);
    //return 'url@' + url;
  }
  public readonly Desc1 = `
  #### 帮助
  - 用设定的颜色来显示主表或者列表，从表的数据值变化。
  - 颜色    数值：>=MinVal   and 数值 < MinVal
  #### 常用色值
  - 浅粉红  LightPink
  - 深红(猩红) Crimson
  -  	紫色 Purple
  - 靛青/紫兰色  Indigo
  - 	中蓝色  MediumBlue
  - 亮钢蓝 LightSteelBlue
  - 浅绿色(水色) Aqua
  - 春绿色SpringGreen
  - 橄榄 Olive
  - 棕色 Brown
  -  	灰色  Gray
  #### 颜色值
  - 可以通过url: http://xh.5156edu.com/page/z1015m9220j18754.html  获取.
  - 
`;
}
