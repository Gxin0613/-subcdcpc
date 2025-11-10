import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';

// 条件
export class RecReadonlyFieldEnum extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.CCBill.RecReadonlyFieldEnum');
    //this.RefEnName = "TS.WF.Template.NodeExt"; //关联更新的类.
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
    const map = new Map('Frm_DBRole', '表单条件');
    map.AddMyPK();
    map.AddTBString('FrmID', '', '表单ID', false, false, 0, 200, 20, false);
    map.AddTBString('AttrID', '', '字段ID', true, true, 0, 200, 20, false);
    map.AddTBString('AttrKey', '', '字段', true, true, 0, 200, 20, false);
    map.AddTBString('AttrName', '', '字段名', true, true, 0, 200, 20, false);
    map.AddTBString('UIBindKey', '', '枚举键值', true, true, 0, 200, 20, false);

    //选择操作符
    const expCfg = '@dengyu=等于@budengyu=不等于@in=在范围内@notin=不在范围内';
    map.AddDDLStringEnum('OperatorMark', '=', '操作符', expCfg, true, '', false);

    //const 操作的值.
    map.AddTBString('OperatorValue', '', '值', true, false, 0, 200, 20, true);
    map.AddTBAtParas(2000);
    map.AddBoolean('IsEnable', true, '是否启用？', true, true, true);
    //参数值.
    map.ParaFields = ',AttrID,AttrKey,AttrName,OperatorMark,OperatorValue,';

    map.AddTBString('Docs', '', '描述', false, false, 0, 200, 20, false);

    this._enMap = map;
    return this._enMap;
  }

  override beforeUpdateInsertAction(): Promise<boolean> {
    const val = `字段: [${this.AttrKey}${this.AttrName}] [${this.OperatorMark}] [${this.OperatorValue}] `;
    this.Docs = val;
    return Promise.resolve(true);
  }

  override async beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
