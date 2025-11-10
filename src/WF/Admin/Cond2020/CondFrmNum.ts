import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { CondAttr } from './Cond';
import { GloWF } from '../GloWF';

// 条件
export class CondFrmNum extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.WF.CondFrmNum');
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
    const map = new Map('WF_Cond', '表单条件');
    map.AddMyPK();

    map.AddTBString(CondAttr.FrmID, '', '表单ID', true, true, 0, 200, 20, false);
    map.AddTBString(CondAttr.FrmName, '', '表单名称', true, true, 0, 200, 20, false);

    map.AddTBString(CondAttr.FK_Attr, '', '字段', true, true, 0, 200, 20, false);
    map.AddTBString(CondAttr.AttrKey, '', '字段', true, true, 0, 200, 20, false);
    map.AddTBString(CondAttr.AttrName, '', '字段名', true, true, 0, 200, 20, false);

    //选择操作符
    const expCfg = '@dengyu=等于@dayu=大于@dayudengyu=大于等于@xiaoyu=小于@xiaoyudengyu=小于等于@budengyu=不等于';
    map.AddDDLStringEnum(CondAttr.FK_Operator, '=', '操作符', expCfg, true, null, false);

    //const 操作的值.
    map.AddTBString(CondAttr.OperatorValue, '', '值', true, false, 0, 200, 20, true);

    //输入值
    map.AddTBAtParas(2000);
    map.AddTBString(CondAttr.Note, '', '备注', false, false, 0, 200, 20, false);

    this._enMap = map;
    return this._enMap;
  }

  override beforeUpdateInsertAction(): Promise<boolean> {
    //const frmID = this.FrmID;
    const frmName = this.FrmName;

    const attr = this.FK_Attr;
    const oper = GloWF.OperName(this.FK_Operator);

    const zhi = this.OperatorValue;
    const attrName = this.AttrName;
    const val = `表单:[${frmName}]字段: [${attr}${attrName}] [${oper}] [${zhi}] `;
    this.Note = val;
    return Promise.resolve(true);
  }

  override async beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
