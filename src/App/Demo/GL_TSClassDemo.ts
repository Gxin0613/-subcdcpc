import { GenerListPageShowModel, PageBaseGenerList } from '../../bp/UIEntity/PageBaseGenerList';
import { AtPara } from '/@/bp/da/AtPara';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
export class GL_TSClassDemo extends PageBaseGenerList {
  override OnTextBlur(_object: Record<string, any>) {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('GL_TSClassDemo');
    this.PageTitle = '实体GUIDDemo';
  }
  //重写的构造方法.
  async Init() {
    this.LinkField = 'Name';
    this.Icon = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    this.HisGLShowModel = GenerListPageShowModel.Table;
    this.BtnOfToolbar = '帮助';
    this.ShowIdx = true;
    this.GroupFields = 'EnType';
    // 定义列，这些列用于显示.
    this.Columns = [
      { Key: 'EnType', Name: '类型', IsShow: true },
      { Key: 'No', Name: '编号', IsShow: true, width: 200 },
      { Key: 'Name', Name: '名称', IsShow: true, width: 180, align: 'left' },
      { Key: 'FrmEnName', Name: '类名', IsShow: true, width: 300, align: 'left' },
      { Key: 'FrmDesc', Name: '内容描述', IsShow: true, width: 600, align: 'left' },
      { Key: 'AtPara', Name: '参数字段', IsShow: false },
      { Key: 'Btns', Name: 'Btns', IsShow: false, IsShowMobile: false },
    ];
    const demoList: Recordable[] = [
      {
        No: 'Student',
        Name: '基本元素',
        FrmName: '',
        FrmEnName: 'TS.Demo.Student',
        FrmDesc: '表单基本元素：文本、数值、枚举、外键、附件.',
        AtPara: '@EnName=TS.Demo.Student',
        EnType: '数据实体',
      },
      {
        No: 'StudentDtl',
        Name: '主从表',
        FrmName: '主从表',
        FrmEnName: 'TS.Demo.StudentDtl',
        FrmDesc: '主从表(简历、荣誉、家庭关系)、一对多关系（选修科目）.',
        AtPara: '@EnName=TS.Demo.StudentDtl',
        EnType: '数据实体',
      },
      {
        No: 'StudentExt',
        Name: '业务逻辑',
        FrmName: '业务逻辑-base',
        FrmEnName: 'TS.Demo.StudentExt',
        FrmDesc: '级联、数值计算、输入校验、日期格式。',
        AtPara: '@EnName=TS.Demo.StudentExt',
        EnType: '数据实体',
      },
      {
        No: 'StudentPop',
        Name: 'Pop&TextBox填充',
        FrmName: '业务逻辑-pop',
        FrmEnName: 'TS.Demo.StudentPop',
        FrmDesc: 'Pop弹窗各种类型，文本框搜索下拉展现，Pop&Textbox落值后填充其他控件.',
        AtPara: '@EnName=TS.Demo.StudentPop',
        EnType: '数据实体',
      },
      {
        No: 'StudentLink',
        Name: '连接',
        FrmName: '连接',
        FrmEnName: 'TS.Demo.StudentLink',
        FrmDesc: '超链接、字段连接、左侧功能连接。',
        AtPara: '@EnName=TS.Demo.StudentLink',
        EnType: '数据实体',
      },
      {
        No: 'StudentFlowComponent',
        Name: '流程组件',
        FrmName: '流程组件',
        FrmEnName: 'TS.Demo.StudentFlowComponent',
        FrmDesc: '发起多次业务流程、宿主流程、流程发起纪录列表。评论组件、日志组件、打印组件。',
        AtPara: '@EnName=TS.Demo.StudentFlowComponent',
        EnType: '数据实体',
      },
      {
        No: 'StudentWG',
        Name: '外挂',
        FrmName: '外挂',
        FrmEnName: 'TS.Demo.StudentWG',
        FrmDesc: '对卡片实现增加按钮、响应按钮事件等操作。',
        AtPara: '@EnName=TS.Demo.StudentWG',
        EnType: '数据实体',
      },
      {
        No: 'StudentMethod',
        Name: '方法执行',
        FrmName: '方法执行',
        FrmEnName: 'TS.Demo.StudentMethod',
        FrmDesc: '执行无参数方法（注销学籍）、有参数方法（调班）。',
        AtPara: '@EnName=TS.Demo.StudentMethod',
        EnType: '数据实体',
      },
      {
        No: 'StudentDtlExt',
        Name: '主从表控件联动',
        FrmName: '主从表控件联动',
        FrmEnName: 'TS.Demo.StudentDtlExt',
        FrmDesc: '主从表控件联动，如主表更新科目1名称，从表自动更新列名，从表更新成绩，主表也将汇总',
        AtPara: '@EnName=TS.Demo.StudentDtlExt',
        EnType: '数据实体',
      },
      {
        No: 'StudentPrinter',
        Name: '打印',
        FrmName: 'Rtf,Excel,Word打印',
        FrmEnName: 'TS.Demo.StudentPrinter',
        FrmDesc: '对于Rtf,Excel,Word,VSTO模式的模板打印.',
        AtPara: '@EnName=TS.Demo.StudentPrinter',
        EnType: '数据实体',
      },
      {
        No: 'GPN_Demo',
        Name: '新建GPN',
        FrmName: '新建分组页面Items列表',
        FrmEnName: 'GPN_Demo',
        FrmDesc: '对于各种类型的新建Item的演示.',
        AtPara: '@EnName=GPN_Demo',
        EnType: '新建GPN',
      },
    ];
    for (const item of demoList) {
      item.Btns = '列表,单记录';
    }
    this.Data = demoList;
  }

  //按钮事件.
  BtnClick(btnName: string, object: Record<string, any>, _ids: string) {
    if (btnName == '帮助') {
      const myurl = 'https://docs.qq.com/doc/DRGZzblhkdWlOZXFG';
      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, myurl, '帮助');
    }

    const atPara = new AtPara(object.AtPara);
    const paraEnName = atPara.GetValStrByKey('EnName');
    if (btnName === '列表') {
      let url = '/src/WF/Comm/Search.vue';
      if (paraEnName) {
        url += `?EnName=${paraEnName}`;
      } else {
        url += `?EnName=${object.FrmEnName}`;
      }
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url, object.Name);
    }
    if (btnName === '单记录') {
      return this.LinkFieldClick(object);
    }
    return new GPNReturnObj(GPNReturnType.Error, '未知事件:' + btnName);
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    const atPara = new AtPara(object.AtPara);
    const paraEnName = atPara.GetValStrByKey('EnName');
    let url = '/src/WF/Comm/En.vue';
    if (paraEnName) {
      url += `?EnName=${paraEnName}`;
    } else {
      url += `?EnName=${object.FrmEnName}`;
    }
    url += `&PKVal=0001`;
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url, object.Name);
  }
}
