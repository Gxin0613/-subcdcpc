import { PageBaseTreeEns } from '/@/bp/UIEntity/PageBaseTreeEns';
import { Depts } from '/@/bp/port/Dept';
import { Emp, Emps } from '/@/bp/port/Emp';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { message } from 'ant-design-vue';
import WebUser from '/@/bp/web/WebUser';
import { GloComm } from '../../Comm/GloComm';
import BSEntity from '/@/utils/gener/BSEntity';
import { Station, Stations } from '/@/bp/port/Station';
import { DeptEmpStation, DeptEmpStations } from '/@/bp/port/DeptEmpStation';
import { DeptEmp, DeptEmps } from '/@/bp/port/DeptEmp';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { FieldType } from '/@/bp/en/EnumLab';
import { DataType } from '/@/bp/en/DataType';
import { getAppEnvConfig } from '/@/utils/env';
import DefaultUserIcon from '/@/assets/icons/default_user_icon.png';
import { Org } from './Admin2Group/Org';
import { useUserStore } from '/@/store/modules/user';
import { useI18n } from '/@/hooks/web/useI18n';
import { CommonConfig } from '/@/DataUser/OverrideFiles/CommonConfig';
const { t } = useI18n();
/**
 * 组织结构维护
 */
export class TreeEns_Dept2Emp extends PageBaseTreeEns {
  constructor() {
    super('TreeEns_Dept2Emp');
    this.PageTitle = `${'组织结构'}`; //'组织结构';
    this.ListMode = 'Default';
  }

  //重写的构造方法.
  override async Init(rootNo = '0') {
    if (WebUser.IsAdmin == false) {
      if (WebUser.No != 'orgadmin') {
        message.error('err@您好:' + WebUser.Name + ',非管理员用户不能查看.');
        //没有权限自动退出登录
        const userStore = useUserStore();
        userStore.logout(true);
        return;
      }
    }

    this.IsLazy = true; // 是否懒加载.

    //树数据.
    const trees = new Depts();
    await trees.Init();
    if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) this.RootNo = '0';
    else this.RootNo = WebUser.OrgNo; //定义树的根目录.
    await trees.Retrieve('ParentNo', rootNo, 'Idx'); // No,Name,ParentNo
    if (rootNo === '0') {
      const treeNexts = new Depts();
      await treeNexts.Retrieve('ParentNo', trees[0].No, 'Idx');
      for (const treeNextsKey of treeNexts) {
        trees.push(treeNextsKey);
      }
    }

    //this.RootNo = GloWF.srcDeptRoot;
    //this.rootNo
    // alert(this.RootNo);
    // alert(WebUser.OrgNo);
    // alert(WebUser.CCBPMRunModel);
    // alert(WebUser.CCBPMRunModel);

    this.TreeEns = trees;

    //实体数据类.
    this.DtlEns = new Emps();
    this.RefKey = 'FK_Dept'; //关联的字段,用于数据查询.

    // 定义列: 这些列用于显示.
    if (WebUser.CCBPMRunModel == CCBPMRunModel.SAAS) {
      this.Columns = [
        { id: 'No', name: 'ID', IsShow: false, width: 60 },
        { id: 'EmpAvatar', name: '头像', IsShow: true, IsShowMobile: false },
        { id: 'UserID', name: '人员账号', IsShow: true },
        { id: 'Name', name: '名称', Width: 300 },
        { id: 'StationNo', name: '岗位编号', IsShow: false },
        { id: 'StationName', name: '岗位名称', IsShow: true },
        { id: 'Tel', name: '电话' },
        { id: 'Email', name: '邮件' },
      ];
    } else {
      this.Columns = [
        { id: 'No', name: '账号', IsShow: false },
        { id: 'EmpAvatar', name: '头像', IsShow: true, IsShowMobile: false },
        { id: 'EmpNo', name: '账号', IsShow: true },
        { id: 'Name', name: '名称', IsShow: true, Width: 300 },
        { id: 'StationNo', name: '岗位编号', IsShow: false },
        { id: 'StationName', name: '岗位名称', IsShow: true },
        { id: 'Tel', name: '电话', IsShow: true },
        { id: 'Email', name: '邮件', IsShow: true },
      ];
    }
    this.DtlEnsGroupBy = 'StationName,Name'; //分组字段,多个字段用逗号分开.
    //  this.BtnsOfToolbar = '角色,角色类型,部门,查询模式';

    if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) this.BtnsOfToolbar = `${'角色'},${'角色类型'},${'项目组'},${'导入'}`; //角色，角色类型，组织管理，导入
    else if (WebUser.CCBPMRunModel == CCBPMRunModel.GroupInc) this.BtnsOfToolbar = `${'角色'},${'角色类型'},${'项目组'},${'导入'}`;
    else this.BtnsOfToolbar = `${'角色'},${'角色类型'},${'项目组'}`; //'角色,角色类型,组管理';

    this.BtnsOfTableTop = `${'新建人员'},${'删除'},${'帮助'}`; //'新建人员,批量删除,帮助';
    if (WebUser.CCBPMRunModel === 1) {
      if (WebUser.No == 'admin') this.BtnsOfTableTop = `${'新建组织'},${'组织管理'},${'新建人员'},${'删除'},${'帮助'}`;
      //'新建组织,组织管理,新建人员,批量删除,帮助';
      else {
        const isCreate = await this.IsCreater();

        if (isCreate) this.BtnsOfTableTop = `${'组织属性'},${'新建人员'},${'删除'},${'帮助'}`;
        //'组织属性,新建人员,批量删除,帮助';
        else this.BtnsOfTableTop = `${'新建人员'},${'删除'},${'帮助'}`; //'新建人员,批量删除,帮助';
      }
    }

    if (WebUser.CCBPMRunModel === CCBPMRunModel.SAAS) {
      if (WebUser.No == 'admin') this.BtnsOfTableTop = `${'新建组织'},${'组织管理'},${'新建人员'},${'删除'},${'帮助'}`;
      //'新建组织,组织管理,新建人员,批量删除,帮助';
      else this.BtnsOfTableTop = `${'组织属性'},${'新建人员'},${'删除'},${'帮助'}`; //'组织属性,新建人员,批量删除,帮助';
    }

    this.BtnsOfItemOptions = `${'编辑'},${'删除'}`; //'编辑,删除'; //行操作的按钮.
    this.IsEnMove = false; //实体是否可以移动？
    this.IsTreeEnMove = true; //实体是否可以移动？
    this.IsPartTimeJob = true; //实体是否加载兼职部门。
    // this.IsShowAddClick = true; //显示新建按钮.
    // this.IsShowEditGroupIcon = true; //显示分组实体按钮.
    // this.IsGroupMove = true; //分组是否可以移动？
    // 调用方法 /WF/Comm/PanelGroup.vue?EnName=FlowSort2Flow
  }

  async IsCreater() {
    let isCreate = false;
    if (WebUser.No == WebUser.OrgNo) isCreate = true;

    if (isCreate == false) {
      const org = new Org();
      org.No = WebUser.OrgNo;
      await org.Retrieve();
      if (org.Adminer == WebUser.No) isCreate = true;
    }

    return isCreate;
  }

  override async SearchKeyWord(keyWord: string): Promise<Recordable[] | never[]> {
    if (!this.DtlEns) {
      return [];
    }
    await this.DtlEns.Init();
    if (keyWord.trim() === '') {
      message.warning(`${'请输入关键字'}`); //'请输入关键字'
      return [];
    }

    const dtlEntity = this.DtlEns.GetNewEntity;
    const attrs = dtlEntity._enMap.attrs;
    const refQueryKey: string[] = attrs
      .filter((attr) => attr.MyFieldType === FieldType.Normal && attr.MyDataType === DataType.AppString && attr.Key !== 'OrgNo' && !attr.IsDateField)
      .map((attr) => attr.Key);
    if (WebUser.CCBPMRunModel !== CCBPMRunModel.Single && WebUser.No !== 'admin') await this.DtlEns.RetrieveLikeKey(keyWord, refQueryKey.join(','), 'OrgNo', WebUser.OrgNo);
    else await this.DtlEns.RetrieveLikeKey(keyWord, refQueryKey.join(','));
    this.DtlEns.forEach((en) => {
      en.Row.SetValByKey('EmpNo', en.No);
      en.EmpNo = en.No;
    });
    return this.DtlEns;
  }

  //获得从表的明细.
  public override async GetDtls(nodeID: string) {
    const list: Recordable[] = [];
    //主部门.
    const emps = new Emps();
    await emps.Retrieve('FK_Dept', nodeID, 'Idx');
    //  await emps.RetrieveAll(); //('FK_Dept', nodeID);

    //求出来隶属于部门的人员,
    const deptEmps = new DeptEmps();
    await deptEmps.Retrieve('FK_Dept', nodeID);

    //部门岗位人员.
    const deptEmpStations = new DeptEmpStations();
    await deptEmpStations.Retrieve('FK_Dept', nodeID);

    // //所有的岗位.
    const stations = new Stations();
    await stations.RetrieveAll();
    //头像
    const { VITE_GLOB_API_URL } = getAppEnvConfig();
    //获取代理路径
    const basicPath = import.meta.env.MODE === 'development' ? '/api' : VITE_GLOB_API_URL;
    //用户头像图片存放地址
    const avatarPath: string = basicPath + '/DataUser/UserIcon/';

    //便利所有岗位. Port_DeptEmpStation
    for (let j = 0; j < deptEmpStations.length; j++) {
      const item = deptEmpStations[j];
      //找人员.
      let emp = emps.find((x) => x.No == item.FK_Emp);
      if (emp == null) {
        emp = new Emp(item.FK_Emp);
        const i = await emp.RetrieveFromDBSources();
        if (i == 0) {
          //  await item.Delete();
          emps.push(emp); //可以加入集合吗？
        }
      }
      //找岗位.
      let station = stations.find((x) => x.No == item.FK_Station);
      if (station == null) {
        station = new Station(item.FK_Station);
        const i = await station.RetrieveFromDBSources();
        /*if (i == 0) {
          station.push(station); //可以加入集合吗？
        }*/
      }
      const temp = {
        No: item.MyPK,
        EmpAvatar: !!item.FK_Emp ? avatarPath + item.FK_Emp + '.png' : DefaultUserIcon,
        EmpNo: item.FK_Emp,
        Name: emp?.Name,
        StationNo: item.FK_Station,
        StationName: station.Name,
        Tel: emp?.Tel,
        Email: emp?.Email,
        Idx: station.Idx,
      };
      if (WebUser.CCBPMRunModel == CCBPMRunModel.SAAS) {
        temp['UserID'] = emp?.UserID;
      }
      list.push({ Row: temp });
    }

    //遍历部门人员. Port_DeptEmp
    for (let i = 0; i < deptEmps.length; i++) {
      const item = deptEmps[i];
      if (deptEmpStations.find((x) => x.FK_Emp == item.FK_Emp) == null) {
        const emp = new Emp(item.FK_Emp);
        await emp.RetrieveFromDBSources();

        const temp = {
          No: item.MyPK,
          EmpAvatar: !!item.FK_Emp ? avatarPath + item.FK_Emp + '.png' : DefaultUserIcon,
          EmpNo: item.FK_Emp,
          Name: emp?.Name,
          StationNo: item.StationNo,
          StationName: item.StationNoT,
          Tel: emp?.Tel,
          Email: emp?.Email,
        };
        if (WebUser.CCBPMRunModel == CCBPMRunModel.SAAS) {
          temp['UserID'] = emp?.UserID;
        }

        list.push({ Row: temp });
      }
    }
    //便利人员. Port_Emp
    emps.forEach((item) => {
      if (deptEmpStations.find((x) => x.FK_Emp == item.No) == null && deptEmps.find((x) => x.FK_Emp == item.No) == null) {
        const temp = {
          No: item.No,
          EmpAvatar: !!item.No ? avatarPath + item.No + '.png' : DefaultUserIcon,
          EmpNo: item.No,
          Name: item.Name,
          StationNo: '',
          StationName: '',
          Tel: item.Tel,
          Email: item.Email,
        };
        if (WebUser.CCBPMRunModel == CCBPMRunModel.SAAS) {
          temp['UserID'] = item?.UserID;
        }
        list.push({ Row: temp });
      }
    });
    return list;
  }

  /**
   * 所有的按钮事件，都调用这个事件.(行事件,BtnsOfTableTop事件,  BtnsOfTop事件)
   * @param btnLab 按钮标签, 用户自定义的按钮, 默认的有"双击行"事件.
   * @param treeNodeID 节点ID,
   * @param selectedRowID 当前选择的行,可以为空.
   * @param selectedRowIDs 当前多选的行多个记录使用逗号分开,格式: 001,002,003,
   * @returns true,false: 是否要刷新当前页面.
   */
  public override async BtnClick(btnLab: string, treeNodeID: string, selectedRowID = '', treeNodeOrgNo = '', row) {
    if (btnLab === `${'帮助'}`) {
      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, 'https://docs.qq.com/doc/DRGxxcHFWc0V5RmpK');
    }

    if (btnLab === `${'项目组'}`) {
      return new GPNReturnObj(GPNReturnType.OpenUrlByTab, GloComm.UrlTreeEns('TreeEns_Team2Emp', ''), `${'项目组'}`);
    }
    // alert(btnLab);
    if (btnLab == `${'角色维护'}` || btnLab == `${'角色'}`) {
      if (WebUser.CCBPMRunModel == CCBPMRunModel.Single && WebUser.IsAdmin)
        return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, GloComm.UrlEns('TS.Port.Station', ''), `${'角色维护'}`);
      else return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, GloComm.UrlEns('TS.Port.Station', '&OrgNo=' + WebUser.OrgNo + '&OrderBy=Idx'), `${'角色维护'}`);
      // return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, GloComm.UrlSearch('TS.Port.Station', '&OrgNo=' + WebUser.OrgNo), '角色维护');
    }

    if (btnLab == `${'角色类型维护'}` || btnLab == `${'角色类型'}`) {
      if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, GloComm.UrlEns('TS.Port.StationType', ''));
      else return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, GloComm.UrlEns('TS.Port.StationType', '&OrgNo=' + WebUser.OrgNo + '&OrderBy=Idx'), `${'角色类型维护'}`);
    }
    if (btnLab == `${'组织管理'}`) {
      const className = CommonConfig.CustomOrgClassName || 'TS.Port.AdminGroup.Org';
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, GloComm.UrlSearch(className));
    }

    if (btnLab == `${'查询模式'}`) {
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, GloComm.UrlSearch('TS.Port.Emp'));
    }
    if (btnLab == `${'分组模式'}`) {
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, GloComm.UrlPanelGroup('PG_Dept2Emp'));
    }

    if (btnLab == `${'导入'}`) {
      //导入.
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, GloComm.UrlGPN('GPN_ImpOrg', ''));
    }

    //调用父类方法.
    if (btnLab == `${t('treeens.oper.editdept')}`) return this.Node_Edit(treeNodeID);
    //删除组织
    if (btnLab == `${t('treeens.oper.deleteorg')}`) {
      try {
        if (treeNodeOrgNo === '100') {
          message.error('组织编号为' + treeNodeOrgNo + ',不能删除根节点的组织。(请点击新建组织创建您的组织）');
          return;
        }
        const isDelete = confirm(`${t('treeens.oper.confirdtl')}`);
        if (isDelete) {
          const org = new BSEntity('BP.Cloud.Org', treeNodeOrgNo);
          await org.Init();
          await org.DoMethodReturnString('DoDelete');
        }
        return new GPNReturnObj(GPNReturnType.Reload); //要刷新.
      } catch (err: any) {
        message.error(err);
      }
    }
    //新建组织
    if (btnLab == `${'新建组织'}`) {
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, GloComm.UrlGPN('GPN_Org', '&SortNo=' + treeNodeID) + '&DeptNo=' + treeNodeID, btnLab);
    }
    //组织属性
    if (btnLab == `${'组织属性'}`) {
      const isCreate = await this.IsCreater();
      if (isCreate == false) return new GPNReturnObj(GPNReturnType.Error, `${'您不是一级管理员，不能修改组织信息.'}`);

      let enName = 'TS.Port.Admin2Group.Org';
      if (WebUser.CCBPMRunModel === CCBPMRunModel.SAAS) {
        enName = 'TS.SaaS.Org';
      } else if (WebUser.CCBPMRunModel === 1) {
        if (WebUser.No == 'admin') enName = 'TS.Port.AdminGroup.Org';
      }
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, GloComm.UrlEn(enName, WebUser.userObj.OrgNo), btnLab);
    }
    //调用父类方法.
    if (btnLab == `${'新建'}` || btnLab === `${'新建人员'}`) {
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, GloComm.UrlGPN('GPN_Emp', '') + '&DeptNo=' + treeNodeID, btnLab);
    }

    //调用父类的方法.
    if (btnLab == `${'删除'}`) {
      if (!selectedRowID) {
        message.warning(`${'请选择要删除的数据.'}`);
        return new GPNReturnObj(GPNReturnType.DoNothing); //要刷新.
      }
      if (!window.confirm('您确定要删除[' + selectedRowID + ']吗？')) return new GPNReturnObj(GPNReturnType.DoNothing, null);
      //执行删除.
      const ids = selectedRowID.split(',');
      for (const id of ids) {
        if (id.includes('_') == false) continue;
        const info = id.split('_');
        if (info.length >= 2) {
          row = {};
          row.EmpNo = info[1];
        }
        await this.Item_Delete(treeNodeID, id, row);
      }
      return new GPNReturnObj(GPNReturnType.Reload, null);
    } //return this.Items_Delete(selectedRowID, treeNodeID);

    //调用父类的方法.
    if (btnLab == `${'删除'}`) {
      if (window.confirm('您确定要删除[' + selectedRowID + ']吗?') == false) return new GPNReturnObj(GPNReturnType.DoNothing); //要刷新.;
      return this.Item_Delete(treeNodeID, selectedRowID, row);
    }
    if (btnLab == `${'编辑'}` || btnLab == '双击行') {
      //alert(selectedRowID);
      //row.EmpNo;
      const url = GloComm.UrlEn('TS.Port.Emp', row.EmpNo);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }

    //调用父类的方法.
    // if (btnLab == '编辑') return this.Item_Edit(selectedRowID);
    if (btnLab == '双击行') return this.Item_Edit(selectedRowID);

    if (btnLab == '导入角色') {
      //导入.
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, GloComm.UrlGPN('GPN_ImpStation', ''));
    }

    if (btnLab == '帮助') {
      const url = 'https://docs.qq.com/doc/DRGxxcHFWc0V5RmpK';
      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }

    alert(`${'按钮:'}` + btnLab + ` ${'没有解析.'}`);
  }

  // 右侧表选中扩展, 当且仅当选中一条时有效
  // public override async CreateDtlExt(_row: Recordable): Promise<string> {
  //   const _dtl_entity = this.DtlEns?.GetNewEntity;
  //   if (!_dtl_entity) {
  //     throw new Error('缺少明细表定义，请检查代码');
  //   }
  //   const _pk = _dtl_entity.PK;
  //   const _class_id = _dtl_entity.classID;
  //   return GloComm.UrlEnOnly(_class_id, _row[_pk]);
  // }
  public async Item_Delete(treeNodeID: string, selectedRowID = '', row): Promise<GPNReturnObj> {
    const deptEmp = new DeptEmp(selectedRowID);
    const num = await deptEmp.RetrieveFromDBSources();
    if (num == 1) {
      await deptEmp.Delete();

      //求出所有部门.
      const des = new DeptEmps();
      await des.Retrieve('FK_Emp', row.EmpNo);
      if (des.length == 0) {
        //删除人员信息.
        const emp = new Emp(row.EmpNo);
        if (row.EmpNo == 'admin') {
          message.info(`${'不能删除admin用户.'}`);
          emp.Update();
          return;
        }

        if (row.EmpNo == WebUser.No && WebUser.IsAdmin == true) {
          message.info(`${'不能删除管理员用户.'}`);
          emp.Update();
          return;
        }

        await emp.Delete(); //删除用户.

        //删除岗位信息.
        const des = new DeptEmpStations();
        await des.Delete('FK_Emp', row.EmpNo);
      }
      message.info(`${'成功删除'}`);
      return new GPNReturnObj(GPNReturnType.Update, null); //要刷新.
    }

    const deptEmpSta = new DeptEmpStation(selectedRowID);
    const num1 = await deptEmpSta.RetrieveFromDBSources();
    if (num1 == 1) {
      await deptEmpSta.Delete(); //删除岗位信息.

      const sta = new Station(deptEmpSta.FK_Station);
      await sta.Retrieve();
      //更新冗余字段.
      const deptEmp1 = new DeptEmp(deptEmpSta.FK_Dept + '_' + deptEmpSta.FK_Emp);
      await deptEmp1.RetrieveFromDBSources();
      if (deptEmp1.StationNo.includes(',') == false) {
        deptEmp1.StationNo = deptEmp1.StationNo.replace(sta.No, '');
        deptEmp1.StationNoT = deptEmp1.StationNoT.replace(sta.Name, '');
      } else {
        deptEmp1.StationNo = deptEmp1.StationNo.replace(sta.No + ',', '');
        deptEmp1.StationNoT = deptEmp1.StationNoT.replace(sta.Name + ',', '');
      }
      await deptEmp1.DirectUpdate();

      message.info(`${'成功删除'}`);
      return new GPNReturnObj(GPNReturnType.Update, null); //要刷新.
      // return this.Items_Delete(selectedRowID, treeNodeID);
    }
    return this.Items_Delete(selectedRowID, treeNodeID);
  }
}
