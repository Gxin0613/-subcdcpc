import { EntityNoNameAttr, EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import WebUser from '../web/WebUser';
import { CCBPMRunModel } from '../difference/SystemConfig';
import DBAccess from '/@/utils/gener/DBAccess';
import { StationExts } from './StationExt';
import { SubTablePostion } from '../en/Config';
import { useI18n } from '/@/hooks/web/useI18n';
const { t } = useI18n();
// 属性
export class StationTypeAttr extends EntityNoNameAttr {
  /// 组织编号
  public static readonly OrgNo = 'OrgNo';
  /// 序号
  public static readonly Idx = 'Idx';
}
// 角色类型
export class StationType extends EntityNoName {
  constructor(no?: string) {
    super('TS.Port.StationType');
    if (!!no) {
      this.setPKVal(no);
    }
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Port_StationType', '角色类型');
    map.CodeStruct = '2';
    map.AddTBStringPK(StationTypeAttr.No, null, t('treeens.oper.no'), true, true, 2, 32, 100);
    map.AddTBString(StationTypeAttr.Name, null, t('treeens.oper.name'), true, false, 0, 50, 200);
    map.AddTBString('OrgNo', null, '组织编号', false, false, 0, 50, 200);
    map.AddTBInt(StationTypeAttr.Idx, 0, 'Idx', true, false);
    if (WebUser.CCBPMRunModel != CCBPMRunModel.Single) map.AddHidden('OrgNo', '=', '@WebUser.OrgNo');

    map.AddRM_DtlSearch('角色排序', new StationExts(), 'FK_StationType', '导入', '', '', 'icon-drop', true, '', SubTablePostion.Left);

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    // this.OrgNo = WebUser.OrgNo;
    if (!this.OrgNo) this.SetValByKey('OrgNo', WebUser.OrgNo);
    if (!this.No) this.No = DBAccess.GenerGUID();
    return Promise.resolve(true);
  }
}

//角色类型s
export class StationTypes extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new StationType();
  }
  constructor() {
    super();
  }

  //查询全部
  override async RetrieveAll() {
    if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) return await super.RetrieveAll('Idx');
    else return await this.Retrieve('OrgNo', WebUser.OrgNo, 'Idx');
  }
}
