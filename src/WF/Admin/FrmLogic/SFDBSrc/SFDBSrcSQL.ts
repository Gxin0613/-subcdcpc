import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import { SFDBSrcAttr } from './SFDBSrc';
import { RefMethod } from '/@/bp/en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';
import { SFProcs } from '../SFProc/SFProc';
import { SFTables } from '../SFTable/SFTable';
import { SFSearchs } from '../SFSearch/SFSearch';
import { GPN_SFTableSQL } from '../SFTable/db/GPN_SFTableSQL';

// 数据源
export class SFDBSrcSQL extends EntityNoName {
  constructor(no?: string) {
    super('TS.Sys.SFDBSrcSQL');
    if (!!no) this.setPKVal(no);
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
    const map = new Map('Sys_SFDBSrc', 'SQL数据源');
    map.AddTBStringPK(SFDBSrcAttr.No, null, '编号', true, true, 1, 20, 20);
    map.AddTBString(SFDBSrcAttr.Name, null, '名称', true, false, 0, 30, 20);
    map.AddTBString(SFDBSrcAttr.DBSrcType, 'WebApi', '类型', true, true, 0, 30, 20);
    map.AddTBString(SFDBSrcAttr.ConnString, null, '连接', true, false, 0, 300, 20, true);
    map.AddTBAtParas(300);

    map.AddGroupMethod('基本设置');
    map.AddRM_GPN(new GPN_SFTableSQL(), 'icon-drop'); //新建字典.

    const rm = new RefMethod();
    rm.Title = '连接测试';
    rm.ClassMethod = 'TestConn';
    rm.Warning = '';
    map.AddRefMethod(rm);

    map.AddGroupMethod('列表');
    map.AddRM_DtlSearch('字典', new SFTables(), 'FK_SFDBSrc', '', '', '', 'icon-drop');
    map.AddRM_DtlSearch('查询', new SFSearchs(), 'FK_SFDBSrc', '', '', '', 'icon-drop');
    map.AddRM_DtlSearch('过程', new SFProcs(), 'FK_SFDBSrc', '', '', '', 'icon-drop');

    this._enMap = map;
    return this._enMap;
  }
  public async TestConn() {
    const en = new BSEntity('BP.Sys.SFDBSrc', this.No);
    await en.Init();
    en.No = this.No;
    await en.Retrieve();
    const data = await en.DoMethodReturnString('DoConn');
    return data;
    //alert(data);
  }
}
