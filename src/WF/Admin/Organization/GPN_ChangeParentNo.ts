import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloWF } from '/@/WF/Admin/GloWF';
import { useI18n } from '/@/hooks/web/useI18n';
import { Dept } from '/@/bp/port/Dept';
import { CCBPMRunModel, SystemConfig } from '/@/bp/difference/SystemConfig';
import { message } from 'ant-design-vue';
import BSEntity from '/@/utils/gener/BSEntity';

export class GPN_ChangeParentNo extends PageBaseGroupNew {
  constructor() {
    const { t } = useI18n();
    super('GPN_ChangeParentNo'); //实体的类名，以GPE_开头.
    this.PageTitle = '修改上级部门'; //实体名称.
  }

  public async Init() {
    const { t } = useI18n();
    this.AddGroup('ChangeParent', '修改上级部门');
    //增加子页面分组.
    this.SelectItemsByTree('ChangeParent', '选择部门', this.HelpTodo, false, GloWF.srcDeptLazily, GloWF.srcDeptRoot!, true, '', true);
  }

  //获得类别,如果返回为空，就没有类别.
  public async GenerSorts() {
    return Promise.resolve([]);
  }
  //重写保存方法实现业务逻辑.
  /**
   * @author
   * 存在问题，两个类方法参数个数不同，设计的有问题
   * @last-modified 22/6/28 移除了未使用的pageName , 修改为sortNo
   * @param pageID 页面ID.
   * @param sortNo 分类编号, 可以为空.
   * @param tb1 第1个文本框的值
   * @param tb2 第2个文本框的值
   * @param tb3
   */
  public override async Save_TextBox_X(pageID: string, _sortNo: string, tb1: string, _tb2: string, _tb3: string) {
    if (pageID === 'ChangeParent') {
      const dept = new Dept(this.PKVal);
      await dept.Retrieve();
      if (dept.ParentNo == tb1) return; //不需要更改.
      dept.ParentNo = tb1;
      await dept.Update();
      if (SystemConfig.CCBPMRunModel != CCBPMRunModel.Single) {
        const parentDept = new Dept(tb1);
        await parentDept.Retrieve();
        if (parentDept.OrgNo != dept.OrgNo) {
          message.error('调整部门上级的时候,所属组织发生变化,不能切换');
          return;
          /*if (SystemConfig.CCBPMRunModel == CCBPMRunModel.GroupInc) {
            const dept = new BSEntity('BP.WF.Port.Admin2Group.Dept', this.PKVal);
            await dept.RetrieveFromDBSources();
            await dept.DoMethodReturnString('ChangeDeptOrgNo', parentDept.OrgNo);
            message.success('设置成功');
          }*/
        }
      }
      message.success('设置成功');
    }
  }
}
