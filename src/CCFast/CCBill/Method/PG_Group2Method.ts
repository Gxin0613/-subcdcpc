import { ListModel, PageBasePanelGroup } from '/@/bp/UIEntity/PageBasePanelGroup';
import { GroupMethod, GroupMethods } from './GroupMethod';
import { Methods } from './Method';
import { DataType } from '/@/bp/en/DataType';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GloComm } from '/@/WF/Comm/GloComm';

export class PG_Group2Method extends PageBasePanelGroup {
  constructor() {
    super('PG_Group2Method');
    this.PageTitle = '实体功能';
    this.HisListModel = ListModel.Table; //主从模式.
    this.BtnsTop = '新建,新建目录,多语言';
  }

  public async Init() {
    //分组数据.
    const groups = new GroupMethods();
    await groups.Retrieve('FrmID', this.PKVal, 'Idx');
    this.GroupsEns = groups;
    if (this.GroupsEns.length == 0) {
      const g = new GroupMethod();
      g.FrmID = this.PKVal;
      g.Name = '相关功能';
      await g.Insert();
      await groups.Retrieve('FrmID', this.PKVal, 'Idx');
    }
    //this.GroupsEns = groups.filter((group) => group.ParentNo !== '0') as EntitiesNoName;
    //分组数据.

    //明细数据.
    const dtls = new Methods();
    await dtls.Retrieve('FrmID', this.PKVal, 'Idx');
    this.DtlEns = dtls; //明细数据.
    //两个数据源关联的键值.
    this.RefKey = 'GroupID'; //关联的字段.

    if (this.HisListModel === ListModel.Table) {
      //定义列,这些列用于显示.IsRead,PRI是特殊字段. 必须要有No,Name列.
      this.Columns = [
        { Key: 'No', Name: '编号', IsShow: false, DataType: 1 },
        { Key: 'MethodID', Name: 'MethodID', IsShow: false, DataType: 1 },

        { Key: 'Icon', Name: 'Icon', IsShow: false, DataType: 1 },
        { Key: 'Name', Name: '名称', IsShow: true, DataType: 1, width: 300 },
        { Key: 'MethodModel', Name: '方法类型', IsShow: true, DataType: 1, width: 300, RefFunc: 'MenuModelFunc' },
        { Key: 'IsEnable', Name: '启用?', IsShow: true, DataType: DataType.AppBoolean, width: 100 },
      ];
    }

    //处理数据格式.
    for (let index = 0; index < this.DtlEns.length; index++) {
      let menu = this.DtlEns[index];
      menu = this.MenuModelFunc(menu);
    }

    this.IsShowAddClick = false; //显示新建按钮.
    this.IsShowEditGroupIcon = true; //显示分组实体按钮.
    this.IsGroupMove = true; //分组是否可以移动？
    this.IsEnMove = true; //实体是否可以移动？

    this.BtnsEnDtl = '功能权限,';
    this.BtnsEnGroup = '目录权限,';
  }

  //类型转换
  public MenuModelFunc(record) {
    //实体处理.
    if (record.MethodModel === 'FlowEtc' || record.MethodModel === 'FlowSingle' || record.MethodModel === 'FlowBaseData') {
      record.Docs = [
        {
          title: '设计流程',
          onClick: () => {
            console.log(record);
            //   const url = `/#/WF/Designer/EditFlow?FlowNo=${record.MethodID}`;
            const url = GloComm.UrlFlowD(record.MethodID);
            return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
          },
        },
        {
          title: '关系设置',
          onClick: () => {
            const url = GloComm.UrlEn('TS.CCBill.MethodFlowHostBill', record.No);
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
          },
        },
      ];
    }

    if (record.MethodModel === 'DictRefBill') {
      record.Docs = [
        {
          title: '单据属性',
          onClick: () => {
            const url = GloComm.UrlEn('TS.CCBill.FrmBill', record.Tag1);
            //   const url = `/src/WF/C/Form?EnName=TS.CCBill.FrmBill&No=${record.MethodID}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
          },
        },
        {
          title: '设计表单',
          onClick: () => {
            console.log(record);
            const url = `/#/WF/Designer/Form?FrmID=${record.Tag1}`;
            return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
          },
        },
      ];
    }
    return record;
  }

  public IconClick(groupNo?: string | undefined, enNo?: string | undefined) {
    return this.OpenDtl(enNo);
  }

  // 如果通过路由打开页面 /#/WF/xxxx   表示你想跳转到系统下面的某个路由  /router/modules/对应模块.ts (comm.ts)
  // 如果你要加载组件 /src/WF/xxx.vue
  // 定义按钮的返回链接 url@/#/WF/xxxx
  public BtnClick(btnName?: string, selectGroupNo?: string, selectNo?: string) {
    if (btnName === '新建目录') {
      const val = window.prompt('请输入目录名称', '方法目录');
      if (!val) return;

      const en = new GroupMethod();
      en.Name = val;
      en.FrmID = this.PKVal;
      en.Insert();
      return new GPNReturnObj(GPNReturnType.Reload, '创建成功.');
    }
    if (btnName === '多语言') {
      const val = window.prompt('请输入要翻译的语言编号en英语,ft繁体,ja日本', 'en');
      if (!val) return;

      const en = new GroupMethod();
      en.Name = val;
      en.FrmID = this.PKVal;
      en.Insert();
      return new GPNReturnObj(GPNReturnType.Reload, '创建成功.');
    }
    if (btnName === '功能属性') {
    }
    ///侧滑打开.
    if (btnName === '目录维护') {
      //const url = '/@/WF/Comm/Ens.vue?EnName=TS.CCBill.GroupMethod&FrmID=' + this.PKVal;
      const url = GloComm.UrlEns('TS.CCBill.GroupMethod', '&FrmID=' + this.PKVal);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }
    if (btnName === '新建') {
      //   const url = '/@/WF/Comm/UIEntity/GroupPageNew.vue?EnName=GPN_Method&PKVal=' + this.PKVal;
      const url = GloComm.UrlGPN('GPN_Method', '');
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url + '&FrmID=' + this.PKVal + '&PKVal=' + this.PKVal);
    }

    if (btnName === '功能权限') {
      const url = `/@/WF/Comm/Dtl/DtlSearch.vue?EnName=TS.GPM.PCenter&RefPK=CtrlPKVal&ButsTableTop=&ButsItem=&ShowAttrs=&IsMove=1&PKVal=${selectNo}&CtrlObj=Method`;
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }
    if (btnName === '目录权限') {
      const url = `/@/WF/Comm/Dtl/DtlSearch.vue?EnName=TS.GPM.PCenter&RefPK=CtrlPKVal&ButsTableTop=&ButsItem=&ShowAttrs=&IsMove=1&PKVal=${selectGroupNo}&CtrlObj=Group`;
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }
  }
}
