import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { MapAttrAttr } from '../MapAttrs/MapAttr';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import BSEntity from '/@/utils/gener/BSEntity';
import Events from '/@/utils/Events';

// 签批
export class SignCheck extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.FrmUI.SelfCommonent.SignCheck');
    if (!!pkval) this.MyPK = pkval;
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_MapAttr', '签批组件');

    map.AddMyPK();
    map.AddTBString(MapAttrAttr.Name, null, '字段中文名', true, false, 0, 200, 20, true);
    map.AddTBString(MapAttrAttr.KeyOfEn, null, '字段名', true, true, 1, 200, 20, true);

    const rm = new RefMethod();
    rm.Title = '字段重命名';
    rm.ClassMethod = 'DoRenameField';
    rm.HisMap.AddTBString('key1', '@KeyOfEn', '字段重命名为?', true, false, 0, 100, 100);
    rm.RefMethodType = RefMethodType.Func;
    rm.Warning = '如果是节点表单，系统就会把该流程上的所有同名的字段都会重命名，包括NDxxxRpt表单。';
    map.AddRefMethod(rm);

    const rm3 = new RefMethod();
    rm3.Title = '视频教程';
    rm3.ClassMethod = 'DoVideo';
    rm3.RefMethodType = RefMethodType.Func;
    map.AddRefMethod(rm3);

    this._enMap = map;
    return this._enMap;
  }
  /**
   * 重命名.
   * @param name 新名字.
   * @returns 执行结果.
   */
  public async DoRenameField(name: string) {
    const en = new BSEntity('BP.Sys.FrmUI.MapAttrSrring', this.MyPK);
    await en.Retrieve();
    const data = await en.DoMethodReturnString('DoRenameField', name);
    Events.emit('reloadForm');
    return data;
  }

  public DoFieldNameLink() {
    return '../../Admin/FoolFormDesigner/MapExt/FieldNameLink.htm?FK_MapData=' + this.getFrmID() + '&KeyOfEn=' + this.KeyOfEn;
  }

  public DoVideo() {
    const url = 'https://www.bilibili.com/video/BV1EK411T7U4';
    return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
  }
  /// <summary>
  /// 设置签批组件
  /// </summary>
  /// <returns>执行结果</returns>
  public DoSetTextBox() {
    // const en = new MapAttrString(this.MyPK);
    // en.UIContralType = UIContralType.TB;
    // en.UIIsEnable = true;
    // en.UIVisible = true;
    // en.Update();
    return '设置成功,当前签批组件已经是文本框了,请关闭掉当前的窗口.';
  }
}
