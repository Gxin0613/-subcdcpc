import { TabsBase } from '/@/bp/UIEntity/TabsBase';
/**
 * 流程类别流程
 */
export class Tabs_FlowApp extends TabsBase {
  override Init() {
    this.AddSearch('学生女', 'icon-drop', 'TS.Demo.Student', '&XB=0');
    this.AddSearch('学生男', 'icon-drop', 'TS.Demo.Student', '&XB=1');
    this.AddGL('待办', 'icon-drop', 'GL_Todolist', '&FlowNo=001');
  }
  constructor() {
    super('Tabs_FlowApp');
    this.PageTitle = '流程应用';
  }
}
