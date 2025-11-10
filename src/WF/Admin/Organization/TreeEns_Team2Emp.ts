import { PageBaseTreeEns } from '/@/bp/UIEntity/PageBaseTreeEns';
import { Team, Teams } from '/@/bp/port/Team';
import { Emp, Emps } from '/@/bp/port/Emp';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { message } from 'ant-design-vue';
import WebUser from '/@/bp/web/WebUser';
import { GloComm } from '../../Comm/GloComm';
import { Station, Stations } from '/@/bp/port/Station';
import { TeamEmpStation, TeamEmpStations } from '/@/bp/port/TeamEmpStation';
import { TeamEmp, TeamEmps } from '/@/bp/port/TeamEmp';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { FieldType } from '/@/bp/en/EnumLab';
import { DataType } from '/@/bp/en/DataType';
import { getAppEnvConfig } from '/@/utils/env';
import DefaultUserIcon from '/@/assets/icons/default_user_icon.png';
import { Org } from './Admin2Group/Org';
import { useUserStore } from '/@/store/modules/user';
import { RowData } from 'naive-ui/es/data-table/src/interface';

/**
 * 组织结构维护
 */
export class TreeEns_Team2Emp extends PageBaseTreeEns {
  constructor() {
    super('TreeEns_Team2Emp');
    this.PageTitle = '项目组';
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
    const trees = new Teams();
    await trees.Init();
    if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) this.RootNo = '0';
    else this.RootNo = WebUser.OrgNo; //定义树的根目录.
    await trees.Retrieve('ParentNo', rootNo, 'Idx');

    if (trees.length == 0) {
      const team = new Team();
      team.No = '100';
      team.Name = '项目组';
      team.ParentNo = '0';
      await team.Insert();
      trees.push(team);
    }

    if (rootNo === '0') {
      const treeNexts = new Teams();
      await treeNexts.Retrieve('ParentNo', trees[0].No, 'Idx');
      for (const treeNextsKey of treeNexts) {
        trees.push(treeNextsKey);
      }
    }
    this.TreeEns = trees;

    //实体数据类.
    this.DtlEns = new Emps();
    this.RefKey = 'TeamNo'; //关联的字段,用于数据查询.

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
    if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) this.BtnsOfToolbar = '用户组类型,导入';
    else this.BtnsOfToolbar = '用户组类型';

    this.BtnsOfTableTop = '新建组人员关联,帮助';
    this.BtnsOfItemOptions = '编辑,删除'; //行操作的按钮.
    this.IsEnMove = false; //实体是否可以移动？
    this.IsTreeEnMove = true; //实体是否可以移动？
    this.IsPartTimeJob = true; //实体是否加载兼职部门。
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
      message.warning('请输入关键字');
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
    const emps = new Emps();

    //求出来隶属于部门的人员,
    const teamEmps = new TeamEmps();
    await teamEmps.Retrieve('TeamNo', nodeID);

    //组岗位人员.
    const teamEmpStations = new TeamEmpStations();
    await teamEmpStations.Retrieve('TeamNo', nodeID);

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
    for (let j = 0; j < teamEmpStations.length; j++) {
      const item = teamEmpStations[j];
      //找人员.
      let emp = emps.find((x) => x.No == item.EmpNo);
      if (emp == null) {
        emp = new Emp(item.EmpNo);
        const i = await emp.RetrieveFromDBSources();
        if (i == 0) {
          //  await item.Delete();
          emps.push(emp); //可以加入集合吗？
        }
      }
      //找岗位.
      let station = stations.find((x) => x.No == item.StationNo);
      if (station == null) {
        station = new Station(item.StationNo);
        const i = await station.RetrieveFromDBSources();
      }
      const temp = {
        No: item.MyPK,
        EmpAvatar: !!item.EmpNo ? avatarPath + item.EmpNo + '.png' : DefaultUserIcon,
        EmpNo: item.EmpNo,
        Name: emp?.Name,
        StationNo: item.StationNo,
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
    for (let i = 0; i < teamEmps.length; i++) {
      const item = teamEmps[i];
      if (teamEmpStations.find((x) => x.EmpNo == item.EmpNo) == null) {
        const emp = new Emp(item.EmpNo);
        await emp.RetrieveFromDBSources();

        const temp = {
          No: item.MyPK,
          EmpAvatar: !!item.EmpNo ? avatarPath + item.EmpNo + '.png' : DefaultUserIcon,
          EmpNo: item.EmpNo,
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
      if (teamEmpStations.find((x) => x.EmpNo == item.No) == null && teamEmps.find((x) => x.EmpNo == item.No) == null) {
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
  public override async BtnClick(btnLab: string, treeNodeID: string, selectedRowID = '', treeNodeOrgNo = '', row: Nullable<RowData>) {
    if (btnLab === '帮助') {
      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, 'https://docs.qq.com/doc/DRGxxcHFWc0V5RmpK');
    }

    // alert(btnLab);
    if (btnLab == '组维护' || btnLab == '组') {
      if (WebUser.CCBPMRunModel == CCBPMRunModel.Single && WebUser.IsAdmin) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, GloComm.UrlEns('TS.Port.Team', ''), '组维护');
      else return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, GloComm.UrlEns('TS.Port.Team', '&OrgNo=' + WebUser.OrgNo + '&OrderBy=Idx'), '组维护');
    }

    if (btnLab == '组类型维护' || btnLab == '组类型') {
      if (WebUser.CCBPMRunModel == CCBPMRunModel.Single) return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, GloComm.UrlEns('TS.Port.TeamType', ''));
      else return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, GloComm.UrlEns('TS.Port.TeamType', '&OrgNo=' + WebUser.OrgNo + '&OrderBy=Idx'));
    }
    if (btnLab == '新建组人员关联') {
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, GloComm.UrlGPN('GPN_TeamEmp', '&TeamNo=' + treeNodeID));
    }

    if (btnLab == '查询模式') {
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, GloComm.UrlSearch('TS.Port.Emp'));
    }
    if (btnLab == '分组模式') {
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, GloComm.UrlPanelGroup('PG_Team2Emp'));
    }
    //调用父类的方法.
    if (btnLab == '删除') {
      if (window.confirm('您确定要删除[' + selectedRowID + ']吗?') == false) return new GPNReturnObj(GPNReturnType.DoNothing); //要刷新.;
      return this.Item_Delete(treeNodeID, selectedRowID, row);
    }
    if (btnLab == '编辑' || btnLab == '双击行') {
      const url = GloComm.UrlEn('TS.Port.Emp', row.EmpNo);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer75, url);
    }
    if (btnLab == '双击行') return this.Item_Edit(selectedRowID);
    alert('按钮:' + btnLab + '没有解析.');
  }
  public async Item_Delete(treeNodeID: string, selectedRowID = '', row): Promise<GPNReturnObj> {
    const teamEmp = new TeamEmp(selectedRowID);
    const num = await teamEmp.RetrieveFromDBSources();
    if (num == 1) {
      await teamEmp.Delete();

      //求出所有部门.
      const des = new TeamEmps();
      await des.Retrieve('EmpNp', row.EmpNo);
      if (des.length == 0) {
        //删除人员信息.
        const emp = new Emp(row.EmpNo);
        if (row.EmpNo == 'admin') {
          message.info('不能删除admin用户.');
          await emp.Update();
          return new GPNReturnObj(GPNReturnType.DoNothing);
        }

        if (row.EmpNo == WebUser.No && WebUser.IsAdmin == true) {
          message.info('不能删除管理员用户.');
          await emp.Update();
          return new GPNReturnObj(GPNReturnType.DoNothing);
        }

        await emp.Delete(); //删除用户.

        //删除岗位信息.
        const des = new TeamEmpStations();
        await des.Delete('EmpNo', row.EmpNo);
      }
      message.info('成功删除');
      return new GPNReturnObj(GPNReturnType.Update, null); //要刷新.
      // return this.Items_Delete(selectedRowID, treeNodeID);
    }

    const teamEmpSta = new TeamEmpStation(selectedRowID);
    const num1 = await teamEmpSta.RetrieveFromDBSources();
    if (num1 == 1) {
      await teamEmpSta.Delete(); //删除岗位信息.

      const sta = new Station(teamEmpSta.StationNo);
      await sta.Retrieve();
      //更新冗余字段.
      const teamEmp = new TeamEmp(teamEmpSta.TeamNo + '_' + teamEmpSta.EmpNo);
      await teamEmp.RetrieveFromDBSources();
      if (teamEmp.StationNo.includes(',') == false) {
        teamEmp.StationNo = teamEmp.StationNo.replace(sta.No, '');
        teamEmp.StationNoT = teamEmp.StationNoT.replace(sta.Name, '');
      } else {
        teamEmp.StationNo = teamEmp.StationNo.replace(sta.No + ',', '');
        teamEmp.StationNoT = teamEmp.StationNoT.replace(sta.Name + ',', '');
      }
      await teamEmp.DirectUpdate();

      message.info('成功删除');
      return new GPNReturnObj(GPNReturnType.Update, null); //要刷新.
    }
    return this.Items_Delete(selectedRowID, treeNodeID);
  }
}
