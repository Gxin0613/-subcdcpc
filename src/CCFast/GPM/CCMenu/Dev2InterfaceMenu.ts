// 实体类
import { Menu } from './Menu';

export default class Dev2InterfaceMenu {
  //集成的平台.CCFast,RuoYi,JeeSite
  public static Plant = 'CCFast';
  /**
   * 创建实体类组件
   * @param icon 标签
   * @param name 名称
   * @param enName 类名称
   * @param modelNo 模块编号
   * @param paras 参数可选
   */
  public static async CreateCommpent(icon: string, name: string, systemNo: string, modelNo: string, enName: string, paras = '') {
    const en = new Menu();
    en.Icon = icon;
    en.ModuleNo = modelNo;
    // en.ModuleNoT = this.GetSortName(sortNo);
    en.SystemNo = systemNo; //系统编号.
    if (enName.includes('GL_') == true) {
    }
    if (enName.includes('TreeEns_') == true) {
    }
    if (enName.includes('Tabs_') == true) {
    }
    en.SetPara('EnName', 'TS.GPM.MenuGenerPage'); //设置类名,属性用它//如果是专业或者极简模式.
    await en.Insert();
  }
  /**
   * 实体查询
   * @param icon 图标
   * @param name 菜单名称
   * @param systemNo 系统编号
   * @param modelNo 模块编号
   * @param enName 实体的类名称
   * @param paras 参数k可选.
   */
  public static EntitySearch(icon: string, name: string, systemNo: string, modelNo: string, enName: string, paras = '') {}
  /**
   * 实体查询
   * @param icon 图标
   * @param name 菜单名称
   * @param systemNo 系统编号
   * @param modelNo 模块编号
   * @param enName 实体的类名称
   * @param paras 参数k可选.
   */
  public static EntityGroup(icon: string, name: string, systemNo: string, modelNo: string, enName: string, paras = '') {}
}
