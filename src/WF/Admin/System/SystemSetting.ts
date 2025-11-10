import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { GL_Methods } from './GL_Methods';

// 人员
export class SystemSetting extends EntityNoName {
  constructor(no?: string) {
    super('TS.Sys.SystemSetting');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Emp', '系统管理');
    map.AddTBStringPK('No', null, '账号', false, false, 1, 3, 50);

    map.AddGroupMethod('基本');
    map.AddRM_GL(new GL_Methods(), '系统工具', 'icon-drop'); //
    // //系统设置.
    //map.AddRM_Search(new SFDBSrc(), 'icon-drop');
    // map.AddRM_Search(new SFProc(), 'icon-drop');
    // map.AddRM_Search(new SFSearch(), 'icon-drop');
    // //   map.AddRM_Search(new SysEnumMains(), 'icon');
    // map.AddRM_Search(new SFTable(), 'icon-drop');

    this._enMap = map;
    return this._enMap;
  }
  public SetIcon() {
    return '未实现.';
  }
  public SetSigine() {
    return '未实现.';
  }
}
