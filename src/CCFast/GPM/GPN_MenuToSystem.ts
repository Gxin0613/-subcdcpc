import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { Menu } from '/@/CCFast/GPM/CCMenu/Menu';
import { GloWF } from '/@/WF/Admin/GloWF';

export class GPN_MenuToSystem extends PageBaseGroupNew {
  constructor() {
    super('GPN_MenuToSystem'); //实体的类名，以GPE_开头.
    this.PageTitle = '菜单迁移到其他系统'; //实体名称.
  }
  public async Init() {
    this.AddGroup('A', '菜单迁移到其他系统');
    this.SelectItemsByList('system', '系统', '', false, GloWF.SQLOfSystems()); //'SELECT No,Name From GPM_System'
    this.SelectItemsByList('system.module', '模块', '', false, () => {
      return GloWF.SQLOfModules(this.RequestVal('tb1', 'system')); //`SELECT No, Name FROM GPM_Module WHERE SystemNo='${this.RequestVal('tb1', 'system')}' `;
    });
  }

  //获得类别,如果返回为空，就没有类别.
  public async GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }

  //重写保存方法实现业务逻辑.
  /**
   * @author
   * 存在问题，两个类方法参数个数不同，设计的有问题
   * @last-modified 22/6/28 移除了未使用的pageName , 修改为sortNo
   * @param pageID 页面ID.
   * @param _sortNo 分类编号, 可以为空.
   * @param _tb1
   * @param _tb2
   * @param _tb3
   */
  public override async Save_TextBox_X(pageID: string, _sortNo: string, _tb1: string, _tb2: string, _tb3: string) {
    if (pageID === 'system.module') {
      const menu = new Menu();
      menu.No = this.params.PKVal;
      await menu.RetrieveFromDBSources();
      menu.ModuleNo = _tb1;
      const systemNo = this.RequestVal('tb1', 'system');
      menu.SystemNo = systemNo;
      await menu.Update();
      return new GPNReturnObj(GPNReturnType.Message, '菜单迁移成功');
    }
  }
}
