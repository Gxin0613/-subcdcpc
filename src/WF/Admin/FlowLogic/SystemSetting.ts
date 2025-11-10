import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { GL_Methods } from '../System/GL_Methods';
import { AutoTask } from '/@/bp/sys/AutoTask/AutoTask';
import { GL_Online } from './InfoOnline/GL_Online';
import { DataV_OneFlowEmp } from '../../TSClass/DataV_OneFlowEmp';
import { DataV_Service } from './InfoOnline/DataV_Service';
import { Search_OperaInfo } from './InfoOnline/Search_OperaInfo';
import { Search_LogInfo } from './InfoOnline/Search_LogInfo';
// 人员
export class SystemSetting extends EntityNoName {
  constructor(no?: string) {
    super('TS.Sys.SystemSetting');
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Emp', '系统管理');
    map.AddTBStringPK('No', null, '账号', false, false, 1, 3, 50);
    map.AddTBAtParas(3000);
    // map.AddDDLSysEnum('LoginStyle', 0, '登录风格', true, true, 'LoginStyle', '@0=默认@1=科技@2=简洁');


    map.AddGroupMethod('基本');
    map.AddRM_GL(new GL_Methods(), '工具箱', 'icon-people'); //
    map.AddRM_Search(new AutoTask(), 'icon-settings');
    //  map.AddRM_DtlSearch('自动任务', new AutoTasks(), '', '', '', '', 'icon-drop');
    map.AddGroupMethod('服务信息');
    map.AddRM_GL(new GL_Online(), '在线人员', 'icon-people'); 
    map.AddRM_Search(new Search_LogInfo(), 'icon-settings');
    map.AddRM_Search(new Search_OperaInfo(), 'icon-settings');

    map.AddRM_DataV(new DataV_Service(), 'icon-user', '', '');
    
    // map.AddRM_GL(new GL_Methods(), '缓存监控', 'icon-drop'); //参考ruoyi.

    // map.AddRM_GL(new GL_Methods(), '定时任务', 'icon-drop'); //参考ruoyi.

    this._enMap = map;
    return this._enMap;
  }
}
