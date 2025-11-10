import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
import DBAccess from '/@/utils/gener/DBAccess';
import { MapAttrGeners } from '../MapAttrs/MapAttrGener';
import { MapDtlExts } from '../MapDtl/MapDtlExt';
import { FrmAttachmentExts } from '../FrmAttachment/FrmAttachmentExt';
import { GPE_PTDBSrcBill } from './GPE_PTDBSrcBill';

// 单据数据源
export class PTDBSrcBill extends EntityMyPK {
  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }
  constructor(no?: string) {
    super('TS.Sys.Printer.PTDBSrcBill');
    if (!!no) this.MyPK = no;
  }

  public override get EnMap() {
    const map = new Map('Sys_FrmPrintTemplateDBSrc', '单据数据源');

    map.AddMyPK();

    map.AddTBString('FrmID', null, '表单ID', false, false, 0, 60, 60);
    map.AddTBString('FrmName', null, '表单名称', false, false, 0, 60, 60);
    map.AddTBString('FrmPrintTemplateID', null, '模板ID', false, false, 0, 60, 60);

    //Bill=单据,EntityNoName=实体,SQL=数据源,Img=图片,Ath=附件
    map.AddTBString('DBTypeID', null, '数据源类型ID', false, false, 0, 60, 60);
    map.AddTBString('DBTypeName', null, '类型名称', false, false, 0, 60, 60);

    map.AddTBInt('FrmRefPKModel', 0, '关联主键', false, true);
    map.AddTBString('FrmRefPKAttrKey', null, '主键(宿主表的字段)', true, true, 0, 60, 60);
    map.AddTBString('FrmRefPKAttrName', null, '主键名称', true, true, 0, 60, 60);

    //实体单据.
    map.AddTBString('RefFrmID', null, '单据ID', true, true, 0, 60, 60);
    map.AddTBString('RefFrmName', null, '单据名称', true, true, 0, 60, 60);

    map.AddTBInt('Idx', 0, 'Idx', false, false);
    map.AddTBAtParas(4000);

    map.AddGroupAttr('关系设置');
    map.AddRM_GPE(new GPE_PTDBSrcBill(), 'icon-drop');

    map.AddGroupAttr('数据源结构');
    map.AddRM_DtlSearch(
      '字段',
      new MapAttrGeners(),
      '',
      '',
      '',
      'KeyOfEn,Name,MyDataType,UIBindKey,Enable,Visable,AtPara',
      'icon-list',
      false,
      '&UIVisible=1&FK_MapData=@RefFrmID',
    );
    map.AddRM_DtlSearch('从表', new MapDtlExts(), '', '', '', 'Name,PTable', 'icon-list', false, '&FK_MapData=@RefFrmID');
    map.AddRM_DtlSearch('附件', new FrmAttachmentExts(), '', '', '', 'Name,NoOfObj', 'icon-drop', false, '&FK_MapData=@RefFrmID');

    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    this.MyPK = DBAccess.GenerGUID();

    return Promise.resolve(true);
  }
}

// 单据数据源s
export class PTDBSrcBills extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new PTDBSrcBill();
  }
  constructor() {
    super();
  }
}
