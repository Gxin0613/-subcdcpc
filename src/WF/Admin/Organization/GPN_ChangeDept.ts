import { PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloWF } from '/@/WF/Admin/GloWF';
import { Emp } from '/@/bp/port/Emp';
import { DeptEmp } from '/@/bp/port/DeptEmp';
import { createVNode } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';

export class GPN_ChangeDept extends PageBaseGroupNew {
  constructor() {
    super('GPN_ChangeDept'); //实体的类名，以GPE_开头.
    this.PageTitle = '切换主部门'; //实体名称.
  }

  public async Init() {
    this.AddGroup('ChangeEmp', '切换主部门');
    //增加子页面分组.
    this.SelectItemsByTree('ChangeEmp', '选择部门', this.HelpTodo, false, GloWF.srcDeptLazily, GloWF.srcDeptRoot!, true, '', true);

    // this.SelectItemsByTree('ChangeEmp', '选择部门', this.HelpTodo, false, GloWF.srcDepts, GloWF.srcDeptRoot!);
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
  public override async Save_TextBox_X(pageID: string, sortNo: string, tb1: string, tb2: string, tb3: string) {
    //如果是专业或者极简模式.
    if (pageID === 'ChangeEmp') {
      const emp = new Emp(this.PKVal);
      await emp.Retrieve();
      if (emp.FK_Dept == tb1) return; //不需要更改.

      Modal.confirm({
        title: '切换主部门',
        content: '确定要切换主部门吗？',
        icon: createVNode(ExclamationCircleOutlined),
        okText: '确定',
        async onOk() {
          //查出岗位并删除
          const de = new DeptEmp(emp.FK_Dept + '_' + emp.No);
          await de.RetrieveFromDBSources();
          console.log('de', de);
          const station = de.StationNo;
          const stationT = de.StationNoT;
          await de.Delete();

          console.log('station', station);

          //人员部门更新
          emp.FK_DeptText = tb2;
          emp.FK_Dept = tb1;
          await emp.Update();

          //更新岗位信息.
          const cde = new DeptEmp(tb1 + '_' + emp.No);
          await cde.Retrieve();
          cde.StationNo = station;
          cde.StationNoT = stationT;
          console.log('cde', cde);
          await cde.Update();

          message.success('更改成功');
        },
        cancelText: '取消',
        onCancel() {
          Modal.destroyAll();
        },
      });
      // }
    }
  }
}
