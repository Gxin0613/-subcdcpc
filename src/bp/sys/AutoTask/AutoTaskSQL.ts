import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntityMyPK } from '/@/bp/en/EntityMyPK';
import { SFDBSrc } from '/@/WF/Admin/FrmLogic/SFDBSrc/SFDBSrc';
import { RefMethod, RefMethodType } from '../../en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';

// 自动任务
export class AutoTaskSQL extends EntityMyPK {
  constructor(no?: string) {
    super('TS.Sys.AutoTaskSQL');
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
    map.AddTBString('TaskName', null, '名称33333', true, false, 0, 200, 200);
    map.AddDDLEntities('DBSrc', null, '数据源', new SFDBSrc(), true, null);
    map.AddTBStringDoc('Docs', null, '执行内容', true, false, true);
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
    map.AddTBStringDoc('NoteMark', null, '说明', true, true, true);
    map.AddTBAtParas(500);

    const rm = new RefMethod();
    rm.Title = '手工执行';
    rm.ClassMethod = 'DoIt';
    rm.RefMethodType = RefMethodType.Func;
    rm.Warning = '您确定要执行吗？';
    rm.IsCanBatch = false; //是否允许批处理，在Search.vue组件里.
    rm.IsForEns = false;
    map.AddRefMethod(rm);

    this._enMap = map;
    return this._enMap;
  }
  ///手工执行方法.
  public async DoIt(): Promise<string> {
    const en = new BSEntity('BP.Sys.AutoTask');
    en.MyPK = this.MyPK;
    await en.RetrieveFromDBSources();
    const val = await en.DoMethodReturnString('RunTask');
    return val;
  }
}
