import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';
import { SFColumns } from '../SFSearch/SFColumn';
import { FrmPrintTemplate } from './FrmPrintTemplate';

// 打印数据源
export class PTDBSrc extends EntityMyPK {
  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }
  constructor(no?: string) {
    super('TS.Sys.Printer.PTDBSrc');
    if (!!no) this.MyPK = no;
  }

  public override get EnMap() {
    const map = new Map('Sys_FrmPrintTemplateDBSrc', '打印数据源');

    map.AddMyPK();

    map.AddTBString('FrmID', null, '表单ID', false, false, 0, 60, 60);
    map.AddTBString('FrmName', null, '表单名称', false, false, 0, 60, 60);
    map.AddTBString('FrmPrintTemplateID', null, '模板ID', false, false, 0, 60, 60);

    //Bill=单据,EntityNoName=实体,SQL=数据源,Img=图片,Ath=附件
    map.AddTBString('DBTypeID', null, '数据源类型ID', true, true, 0, 60, 60);
    map.AddTBString('DBTypeName', null, '类型名称', true, true, 0, 60, 60);

    //单据/实体ID
    map.AddTBString('RefFrmID', null, '单据/实体ID', true, true, 0, 60, 60);
    map.AddTBString('RefFrmName', null, '单据/实体名称', true, true, 0, 60, 60);

    //关联字段.
    map.AddTBString('RefAttrKey', null, '实体主键Key', true, true, 0, 60, 60);
    map.AddTBString('RefAttrName', null, '实体主键名称', true, true, 0, 60, 60);

    //SQL.
    map.AddTBString('DBSrc', null, '数据源', false, true, 0, 500, 60);
    map.AddTBString('SQLSelect', null, '查询表达式', false, true, 0, 500, 60);

    map.AddTBInt('Idx', 0, 'Idx', false, false);
    map.AddTBAtParas(4000);

    map.AddRM_DtlSearch('列属性', new SFColumns(), 'RefFrmID', '', '', '', 'icon-list', true);

    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();

    const print = new FrmPrintTemplate();
    print.MyPK = this.FrmPrintTemplateID;
    const num = await print.RetrieveFromDBSources();
    if (num == 0) {
      alert('没有查询到打印ID的数据' + this.FrmPrintTemplateID);
      return Promise.resolve(false);
    }

    this.FrmID = print.FrmID;
    this.FrmName = print.Name;
    return Promise.resolve(true);
  }
}

// 打印数据源s
export class PTDBSrcs extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new PTDBSrc();
  }
  constructor() {
    super();
  }
}
