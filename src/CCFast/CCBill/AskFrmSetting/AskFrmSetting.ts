import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { GL_AskFrmRuning } from './GL_AskFrmRuning';
import { GL_AskFrmHistory } from './GL_AskFrmHistory';
import { GL_AskFrmPublic } from './GL_AskFrmPublic';
import { GL_AskFrmMyCreate } from './GL_AskFrmMyCreate';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();

// 人员
export class AskFrmSetting extends EntityNoName {
  constructor(no?: string) {
    super('TS.CCBill.AskFrmSetting');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = false;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Emp', '活动');

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '编号', false, false, 1, 3, 50);
    //  map.AddTBString('Name', null, '名称', false, false, 0, 50, 200);
    // map.AddGroupMethod('单据'); //单据
    map.AddGroupMethod('我的活动'); //单据
    map.AddRM_GL(new GL_AskFrmRuning(), '派发给我', 'icon-clock');
    map.AddRM_GL(new GL_AskFrmMyCreate(), '我创建的', 'icon-user');
    map.AddRM_GL(new GL_AskFrmHistory(), '历史活动', 'icon-user-follow');
    map.AddRM_GL(new GL_AskFrmPublic(), '公共活动', 'icon-fire');
    // 设置委托
    this._enMap = map;
    return this._enMap;
  }
}
