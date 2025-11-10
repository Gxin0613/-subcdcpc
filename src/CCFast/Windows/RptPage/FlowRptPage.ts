import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { GloWF } from '/@/WF/Admin/GloWF';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import { WindowTemplates } from '../Admin/WindowTemplate';
/// 报表页面
export class FlowRptPage extends EntityNoName {
  constructor(pkVal?: string) {
    super('TS.CCFast.Windows.FlowRptPage');
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
    const map = new Map('GPM_RptPage', '流程报表页面');

    // #region 基本信息.
    map.AddTBStringPK('No', null, '编号', true, true, 1, 40, 200);
    map.AddTBString('Name', null, '报表名称', true, false, 0, 300, 20, false);
    map.AddTBString('FlowNo', null, '流程编号', true, true, 0, 300, 20, false);
    map.AddTBString('FlowName', null, '流程名称', true, true, 0, 300, 20, false);
    map.AddDDLStringEnum('RptModel','RptWhite','报表类型','@RptWhite=通用报表@FlowRptWhite=流程报表@BillRptWhite=单据报表@EnRptWhite=实体报表@EntityRptWhite=高代码报表',false);
    map.AddBoolean('IsShowSearchCond',false,'是否启用查询条件',true,true);
    const rm = new RefMethod();
    rm.Title = '删除所有Windows';
    rm.ClassMethod = 'DeleteAll';
    rm.RefMethodType = RefMethodType.FuncToolbar;
    rm.Warning = '您确定要执行吗？';
    rm.IsCanBatch = false; //是否允许批处理，在Search.vue组件里.
    rm.IsForEns = false;
    map.AddRefMethod(rm);
    this._enMap = map;
    return this._enMap;
  }
  public async DeleteAll(): Promise<string> {
    if (window.confirm('您确定要删除吗?') == false) return '用户执行了取消.';

    const dtls = new WindowTemplates();
    await dtls.Retrieve('PageID', this.No);

    for (let index = 0; index < dtls.length; index++) {
      const element = dtls[index];
      await element.Delete();
    }
    return '删除成功:' + dtls.length + '记录.';
  }
  override async beforeInsert(): Promise<boolean> {
    return Promise.resolve(true);
  }
}
