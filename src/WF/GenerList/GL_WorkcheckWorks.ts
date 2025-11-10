import WebUser from '/@/bp/web/WebUser';
import { message } from 'ant-design-vue';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { DataType } from '/@/bp/en/DataType';
import BSEntities from '/@/utils/gener/BSEntities';
import BSEntity from '/@/utils/gener/BSEntity';

export class GL_WorkcheckWorks extends PageBaseGenerList {
  constructor() {
    super('GL_WorkcheckWorks');
    this.PageTitle = '审核常用短语';
  }
  //重写的构造方法.
  async Init() {
    //定义列.
    this.Columns = [
      { Key: 'MyPK', Name: 'MyPK', IsShow: false, DataType: DataType.AppString },
      { Key: 'Vals', Name: '常用短语', IsShow: true, DataType: DataType.AppString },
      { Key: 'Btns', Name: 'Btns', IsShow: false, IsShowMobile: false },
    ];
    //退回常用短语
    const ens = new BSEntities('BP.Sys.FastInputs');
    await ens.Init();
    const data = await ens.DoMethodReturnJSON('InitData_Flow');
    data.forEach((en) => {
      en.Btns = '编辑,删除';
    });
    console.log('data', data);
    this.Data = data;
  }

  //打开页面.
  async LinkFieldClick(record: Record<string, any>) {}

  /**
   * 按钮操作，包含工具栏、行操作 ，
   * @param btnName 按钮名称
   * @param object 行数据
   * @param params 组件参数
   * @param callback 回调函数
   * @constructor
   */
  async BtnClick(btnName: string, record: Record<string, any>) {
    if (btnName === '编辑') {
      const msg = window.prompt('请输入常用的短语', record.Vals);
      if (msg == null) return;
      const en1 = new BSEntity('BP.Sys.FastInput', record.MyPK);
      en1.setVal('Vals', msg);
      en1.setVal('CfgKey', 'Flow');
      en1.setVal('FK_Emp', WebUser.No);
      await en1.Update();
      return new GPNReturnObj(GPNReturnType.Reload);
    }

    if (btnName === '删除') {
      //只是清空内容
      const en1 = new BSEntity('BP.Sys.FastInput', record.MyPK);
      en1.setVal('Vals', '');
      en1.setVal('CfgKey', 'Flow');
      en1.setVal('FK_Emp', WebUser.No);
      await en1.Update();
      // en1.Delete();
      return new GPNReturnObj(GPNReturnType.Reload);
    }
  }
}
