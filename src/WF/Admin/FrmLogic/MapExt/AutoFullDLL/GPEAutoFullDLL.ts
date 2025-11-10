import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { MapExtAttr } from '../../MapExt';
import { SFDBSrc } from '../../SFDBSrc/SFDBSrc';

// 表格弹窗
export class GPEAutoFullDLL extends EntityMyPK {
  constructor(mypk?: string) {
    super('TS.MapExt.GPEAutoFullDLL');
    // this.RefEnName = 'TS.Sys.MapExt'; //关联更新的类.
    if (!!mypk) this.MyPK = mypk;
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
    const map = new Map('Sys_MapExt', '设置显示过滤');

    map.AddGroupAttr('基本设置');
    map.AddMyPK();
    map.AddTBString(MapExtAttr.FK_MapData, null, '表单ID', false, false, 0, 50, 200, true);
    map.AddDDLSysEnum(MapExtAttr.DBType, 0, '数据源类型', true, true, 'DBType', '@0=执行SQL@1=执行url返回JSON@2=执行CCFromRef.js返回JSON', null, false);
    map.AddDDLEntities(MapExtAttr.FK_DBSrc, 'local', '数据源', new SFDBSrc(), true, null, false);

    map.AddTBStringDoc(MapExtAttr.Doc, null, '表达式', true, false, true, this.DescTag1);

    // map.AddTBString(MapExtAttr.Doc, null, '日期从', true, false, 0, 50, 200, true, this.DescDoc);
    // map.AddTBString(MapExtAttr.Tag1, null, '到', true, false, 0, 50, 200, true, this.DescTag1);
    // map.AddRadioBtn(MapExtAttr.Tag, 0, '节假日', true, true, 'JieJiaRi', '@0=不计算节假日@1=计算节假日');
    //参数字段.  @SelectType=1@IsEnter=0
    // map.ParaFields = ',SelectType,IsEnter,Title,BtnLab,SearchTip,ShowModel,MultipleSelectType,';

    this._enMap = map;
    return this._enMap;
  }
  override async beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }

  override async beforeUpdateInsertAction(): Promise<boolean> {
    return Promise.resolve(true);
  }
  public readonly DescTag1 = ` 
   #### 说明
   - 该SQL必须返回No,Name 两个列.
   - 至此ccbpm表达式.
   - 比如:该下拉框是一个人员，您需要仅仅显示本部门人员.
   - SELECT No,Name FROM Port_Emp WHERE FK_Dept='@WebUser.DeptNo'
    `;
}
