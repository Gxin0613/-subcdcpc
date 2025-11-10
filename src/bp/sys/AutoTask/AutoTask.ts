import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK, EntityMyPK } from '/@/bp/en/EntityMyPK';
// 自动任务
export class AutoTask extends EntityMyPK {
  constructor(no?: string) {
    super('TS.Sys.AutoTask');
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
    const map = new Map('Sys_AutoTask', '自动任务');
    map.AddMyPK();
    map.AddTBString('TaskName', null, '名称', true, true, 0, 200, 200);
    map.AddTBString('TaskModel', null, '内容类型', true, true, 0, 200, 100);
    map.AddTBStringDoc('Docs', null, '执行内容', true, true, true);
    map.AddTBString('Times', null, '执行时间', true, false, 0, 200, 300);
    const help = `
    #### 格式约定.
- admin@01:01@12:01：张三每天1点01分和12点01分。
- admin@-01 01:01：张三每月1号1点01分执行。
- admin@06-01 01:01：张三每年6月1号1点01分执行。
- 多个执行用逗号分开.
- 参考流程属性：发起模式的的自动发起说明.
    `;
    map.SetHelperAlert('Times', help);
    map.AddTBString('DBSrc', null, '数据源', true, true, 0, 200, 50);
    map.AddTBStringDoc('NoteMark', null, '说明', true, true, true);
    map.AddTBAtParas(500);
    this._enMap = map;
    return this._enMap;
  }
}

//自动任务s
export class AutoTasks extends EntitiesMyPK {
  get GetNewEntity(): EntityMyPK {
    return new AutoTask();
  }

  constructor() {
    super();
  }
}
