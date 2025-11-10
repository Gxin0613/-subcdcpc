import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { RptSearchFKEnumAttr, RptSearchFKEnums } from './RptSearchFKEnum';
/// 报表页面
export class RptPage extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCFast.Windows.RptPage');
    if (!!pkVal) {
      this.No = pkVal;
    }
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('GPM_RptPage', '报表页面');

    // #region 基本信息.
    map.AddTBStringPK('No', null, '编号', true, true, 1, 40, 200);
    map.AddTBString('Name', null, '报表名称', true, false, 0, 300, 20, true);
    map.AddDDLStringEnum('RptModel','RptWhite','报表类型','@RptWhite=通用报表@FlowRptWhite=流程报表@BillRptWhite=单据报表@EnRptWhite=实体报表@EntityRptWhite=高代码报表',false);
     map.AddTBString('FlowNo', null, '流程编号', false, false, 0, 300, 20, true);
    map.AddTBString('FlowName', null, '流程名称', false, false, 0, 300, 20, true);

    map.AddTBString('FrmID', null, '表单编号', false, false, 0, 300, 20, true);
    map.AddTBString('FrmName', null, '表单名称', false, false, 0, 300, 20, true);
    map.AddTBString('DTLab',null,'日期标签',false,false,0, 100, 20);
    map.AddTBString('Search',null,'日期查询条件',false,false,0, 20, 20);
    map.AddTBString('KeySearch',null,'关键字查询条件',false,false,0, 20, 20);
    map.AddTBString('KeyWords',null,'指定文本字段查询',false,false,0, 200, 30);

    map.AddBoolean('IsShowSearchCond',false,'是否启用查询条件',true,true);
    map.AddGroupMethod('查询条件');
    //关键字查询模式.
    //map.AddRM_GPE(new GPE_SearchKey(), 'icon-calendar');
    //外键枚举查询条件
    map.AddRM_DtlSearch('外键枚举查询条件', new RptSearchFKEnums(), RptSearchFKEnumAttr.FrmID, '', '', '', 'icon-drop', true);
    map.AddRM_EnOnly('日期/关键字查询','TS.CCFast.Windows.RptDTSearch','@No');
   
    this._enMap = map;
    return this._enMap;
  }

  override async beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
  protected override beforeUpdateInsertAction(): Promise<boolean> {
    if (this.DTLab == '' || this.DTLab == null) {
      if (this.Search == 'None') this.DTLab = '';
      if (this.Search == 'NY') this.DTLab = '按年月查询';
      if (this.Search == 'ND') this.DTLab = '按年度查询';
      if (this.Search == 'RQ') this.DTLab = '按日期查询';
      if (this.Search == 'NDFromTo') this.DTLab = '按年度查询';
      if (this.Search == 'NYFromTo') this.DTLab = '按年月查询';
      if (this.Search == 'RQFromTo') this.DTLab = '按日期查询';
    }

    return Promise.resolve(true);
  }
}
