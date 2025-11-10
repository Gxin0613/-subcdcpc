import { GloComm } from '/@/WF/Comm/GloComm';
import { TabsBase } from '/@/bp/UIEntity/TabsBase';
/**
 * tabs菜单
 */
export class Tabs_Student extends TabsBase {
  constructor() {
    super('Tabs_Student');
    this.PageTitle = '学生管理';
  }
  override Init() {
    this.AddSelfUrl('班级', 'icon-drop', GloComm.UrlEns('TS.Demo.BanJi', ''));
    this.AddSelfUrl('科目', 'icon-drop', GloComm.UrlEns('TS.Demo.KeMu', ''));
    this.AddSelfUrl('省份', 'icon-drop', GloComm.UrlEns('TS.Demo.ShengFen', ''));
    this.AddSelfUrl('城市', 'icon-drop', GloComm.UrlEns('TS.Demo.City', ''));

    this.AddSelfUrl('全部学生', 'icon-drop', GloComm.UrlSearch('TS.Demo.Student', ''));
    this.AddSelfUrl('统计分析', 'icon-drop', GloComm.UrlGroup('TS.Demo.Student', '&FlowNo=001'));
    this.AddSelfUrl('女学生', 'icon-drop', GloComm.UrlSearch('TS.Demo.Student', '&XB=0')); //Search需要支持传入的条件让其默认选中》
    this.AddSelfUrl('男学生', 'icon-drop', GloComm.UrlSearch('TS.Demo.Student', '&XB=1'));
  }
}
