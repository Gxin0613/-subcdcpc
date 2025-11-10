import { GenerListPageShowModel, PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import BSEntity from '/@/utils/gener/BSEntity';
import { message } from 'ant-design-vue';

export class GL_FlowVer extends PageBaseGenerList {
  constructor() {
    super('GL_FlowVer');
    this.PageTitle = '版本管理';
  }
  //重写的构造方法.
  async Init() {
    this.LinkField = 'Name'; //焦点字段.
    this.Icon = 'icon-drop';
    this.BtnOfToolbar = '新建流程版本';
    this.PageSize = 15; // 分页的页面行数, 0不分页.
    this.HisGLShowModel = GenerListPageShowModel.Table;

    //定义列,这些列用于显示, IsRead, PRI是特殊字段.
    this.Columns = [
      { Key: 'Ver', Name: '版本号', IsShow: false, IsShowMobile: false, DataType: 2 },
      { Key: 'No', Name: '流程编号', IsShow: true, IsShowMobile: true, DataType: 1, width: 50 },
      { Key: 'Name', Name: '名称', IsShow: true, IsShowMobile: true, DataType: 1, width: 100 },
      { Key: 'IsRel', Name: '发布状态', IsShow: true, IsShowMobile: true, DataType: 1, width: 50 },
      { Key: 'NumOfRuning', Name: '运行数', IsShow: true, IsShowMobile: true, DataType: 1, width: 50 },
      { Key: 'NumOfOK', Name: '完成数', IsShow: true, IsShowMobile: true, DataType: 1, width: 40 },
      { Key: 'Btns', Name: 'Btns', IsShow: false, IsShowMobile: false },
    ];

    const flowNo = this.RequestVal('PKVal');
    const en = new BSEntity('BP.WF.Flow');
    await en.Init();
    en.No = flowNo;
    en.setPK(flowNo);
    await en.Retrieve();
    const data: any = await en.DoMethodReturnJSON('VerGenerVerList');
    //处理数据,增加标签.
    data.forEach((en) => {
      // 判断是否是逾期.  SDT 应完成日期与当前日期对比.

      if (en.IsRel == 0) {
        en.IsRel = '未发布';
        en.Btns = '设置主版本,删除,编辑';
      }
      if (en.IsRel == 1) {
        en.IsRel = '已发布';
        en.Btns = '删除,编辑';
      }
      //  if (en.IsRel == 0) en.IsRel = '<img src="resource/WF/Img/PRI/0.png" style="display:inline"/>';
    });

    //设置数据源.
    this.Data = data;
  }

  //打开页面.
  LinkFieldClick(object: Record<string, any>) {
    /* let url = '/#/WF/MyFlow?';
    const keys = Object.keys(object);
    const useKeys = ['WorkID', 'FK_Flow', 'FlowNo', 'FK_Node', 'FID', 'PWorkID', 'PFlowNo', 'PNodeID'];
    for (const key of keys) {
      if (key === 'WorkID') continue;
      if (key === 'No') {
        url += `&FK_Flow=${object[key]}&FlowNo=${object[key]}`;
        continue;
      }
      if (!useKeys.includes(key)) url += `&${key}=${object[key]}`;
    }
    //   window.open(url); //打开页面。
    return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);*/
    const url = '/#/WF/Designer/EditFlow?FK_Flow=' + object.No + '&FlowNo=' + object.No;
    return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
  }

  async BtnClick(btnName: string, object: Record<string, any>) {
    if (btnName === '新建流程版本') {
      //获取当前的主版本的流程编号
     // debugger;
      let flowNo = '';
      if (this.Data.length == 0) flowNo = this.RequestVal('PKVal');
      else {
        this.Data.forEach((item) => {
          if (item.IsRel == '已发布') flowNo = item.No;
        });
      }
      const en = new BSEntity('BP.WF.Flow', flowNo);
      await en.Init();
      await en.DoMethodReturnString('VerCreateNew');
      return new GPNReturnObj(GPNReturnType.Update);
    }
    if (btnName === '设置主版本') {
      if (window.confirm('您确定要设置当前版本为主版本？') == false) return;
      const en = new BSEntity('BP.WF.Flow', object.No);
      await en.Init();
      await en.DoMethodReturnString('VerSetCurrentVer');
      await en.DoMethodReturnString('DoCheck');
      return new GPNReturnObj(GPNReturnType.Update);
    }
    if (btnName === '删除') {
      if (window.confirm('您确定要删除吗?') == false) return;
      const en = new BSEntity('BP.WF.Flow', object.No);
      await en.Init();
      const msg = await en.DoMethodReturnString('DoDelete');
      if (typeof msg === 'string' && msg.includes('err@')) {
        message.error(msg);
        return new GPNReturnObj(GPNReturnType.DoNothing);
      }
      message.success(msg);
      return new GPNReturnObj(GPNReturnType.Update);
    }
    if (btnName === '编辑') {
      const url = '/#/WF/Designer/EditFlow?FK_Flow=' + object.No + '&FlowNo=' + object.No;
      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }
    alert('未实现的按钮功能:' + btnName);
    return;
  }
}
