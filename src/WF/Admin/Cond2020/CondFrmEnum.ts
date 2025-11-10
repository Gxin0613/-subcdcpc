import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { CondAttr } from './Cond';
import { GloWF } from '../GloWF';

// 条件
export class CondFrmEnum extends EntityMyPK {
  constructor(pkval?: string) {
    super('TS.WF.CondFrmEnum');
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
    map.AddTBString(CondAttr.Tag1, '', '枚举Key', false, false, 0, 200, 20, false);

    //选择操作符
    const expCfg = '@dengyu=等于@budengyu=不等于@in=在范围内@notin=不在范围内@like=包含@notlike=不包含';
    map.AddDDLStringEnum(CondAttr.FK_Operator, '=', '操作符', expCfg, true, '请选择表达式,如果多个就在创建多个条件.', false);

    //const 操作的值. @这里需要根据数据库类型判断,与系统名称冲突.
    //const sql = `SELECT IntKey as No, Lab as Name FROM Sys_Enum WHERE EnumKey='@Tag1' Order by IntKey `;
    // const sql = `SELECT IntKey as No, Lab as Name FROM Sys_Enum WHERE EnumKey='QJLX' order by IntKey `;
    map.AddDDLSQL(CondAttr.OperatorValue, '', '值', GloWF.SQLOfCondFrmEnum, true, null, true);
    //map.AddTBString(CondAttr.OperatorValue, '', '值', true, false, 0, 200, 20, true);
    //输入值
    map.AddTBAtParas(2000);
    map.AddTBString(CondAttr.Note, '', '备注', false, false, 0, 200, 20, false);

    this._enMap = map;
    return this._enMap;
  }

  override beforeUpdateInsertAction(): Promise<boolean> {
    //  const frmID = this.FrmID;
    const frmName = this.FrmName;
    const attr = this.FK_Attr;
    const oper = GloWF.OperName(this.FK_Operator);
    const zhi = this.OperatorValue;
    const zhiText = this.OperatorValueT;

    const attrName = this.AttrName;
    const val = `表单:[${frmName}]字段: [${this.AttrKey}][${attrName}] [${oper}] [${zhi}][${zhiText}] `;
    this.Note = val;
    return Promise.resolve(true);
  }

  override async beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
