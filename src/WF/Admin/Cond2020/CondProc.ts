import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { CondAttr } from './Cond';
import { SFDBSrc } from '../FrmLogic/SFDBSrc/SFDBSrc';

// 过程
export class CondProc extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.WF.CondProc');
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
    const map = new Map('WF_Cond', '条件-过程Proc');

    map.AddMyPK();
    map.AddDDLEntities(CondAttr.FK_DBSrc, null, '数据源', new SFDBSrc(), false, null, false);
    map.AddTBStringDoc(CondAttr.OperatorValue, '', '过程名称', true, true, true);
    map.AddTBString(CondAttr.Note, null, '备注', true, true, 0, 4000, 400, true);
    map.AddTBAtParas(2000);

    this._enMap = map;
    return this._enMap;
  }

  override beforeUpdateInsertAction(): Promise<boolean> {
    if (!this.Note) this.Note = '请参考SQL';
    return Promise.resolve(true);
  }

  override async beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
