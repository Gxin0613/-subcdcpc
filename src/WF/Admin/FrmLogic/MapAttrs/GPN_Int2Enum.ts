import { message } from 'ant-design-vue';
import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { MapAttr } from './MapAttr';
import { GloWF } from '../../GloWF';

export class GPN_Int2Enum extends PageBaseGroupNew {
  constructor() {
    super('GPN_Int2Enum');
    this.PageTitle = '转成枚举字段';
  }
  public async Init() {
    //增加子页面.
    this.AddGroup('A', '转成枚举字段');
    this.SelectItemsByList('Dict', '选择枚举', this.HelpTodo, false, GloWF.srcEnums);
  }

  public async GenerSorts(): Promise<any[]> {
    return null;
  }

  public override async Save_TextBox_X(pageNo: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    //获得 mapAttr.
    const mapAttr = new MapAttr(this.RequestVal('PKVal'));
    await mapAttr.Retrieve();

    mapAttr.LGType = 1;
    mapAttr.UIContralType = 1;
    mapAttr.UIBindKey = tb1;
    await mapAttr.Update();
    //检查是否有影子字段.
    message.info('设置成功,请关闭或者设置其他元素,进行编辑.');
    return;
  }
}
