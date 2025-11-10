import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesNoName } from '/@/bp/en/EntityNoName';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { SFTableAttr } from './SFTable';
import { SFDBSrc } from '../SFDBSrc/SFDBSrc';

// Handler字典表
export class SFTableHandler extends EntityNoName {
  constructor(no?: string) {
    super('TS.FrmUI.SFTableHandler');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Sys_SFTable', 'Handler字典表');
    map.AddTBStringPK(SFTableAttr.No, null, '编号', true, true, 1, 200, 20);
    map.AddTBString(SFTableAttr.Name, null, '名称', true, false, 0, 200, 20);
    map.AddDDLEntities(SFTableAttr.FK_SFDBSrc, 'local', '数据源', new SFDBSrc(), true);

    map.AddDDLSysEnum(SFTableAttr.CodeStruct, 0, '字典表类型', true, true, SFTableAttr.CodeStruct, '@0=编号名称类型@1=树结构类型');
    const desc = `
        #### 帮助
         -  WebAPI的输入格式：@WebApiHost/DataUser/GetEmps?id=51184
         - 此处只支持用户定义好的内置参数，比如：id=51184
        #### 其它
        - 访问ccfrom提供的内置的handler,开发人员进行重写返回数据.
        - 表单在运行的时候,通过访问这个服务，携带设置的参数，解析返回的数据，展现在表单的控件上.
        `;
    map.AddTBString(SFTableAttr.SelectStatement, null, '地址', true, false, 0, 1000, 600, true, desc);

    const note = ` 
        #### 帮助
        - 对树形结构的字段有效.
        - 根目录的parentNo数据.
        `;
    map.AddTBString(SFTableAttr.RootVal, null, '根节点值', true, false, 0, 1000, 600, true, note);
    this._enMap = map;
    return this._enMap;
  }

  public DoEdit() {
    // return TS.Difference.SystemConfig.CCFlowWebPath + "WF/Admin/FoolFormDesigner/SFTableSQLEditData.htm?FK_SFTableSQL=" + this.No;
  }
}

//Handler字典表 s
export class SFTableHandlers extends EntitiesNoName {
  get GetNewEntity(): EntityNoName {
    return new SFTableHandler();
  }
  constructor() {
    super();
  }
}
