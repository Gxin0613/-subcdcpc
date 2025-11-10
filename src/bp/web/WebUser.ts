import { reactive } from 'vue';
import { useUserStore } from '/@/store/modules/user';
import HttpHandler from '/@/utils/gener/HttpHandler';

export interface User {
  No: string;
  Name: string;
  OrgNo: string;
  OrgName: string;
  FK_Dept: string;
  FK_DeptName: string;
  SysLang: string;
  CCBPMRunModel: number;
  IsAdmin: boolean | number;
  Token: string;
  homePath?: string;
  avatar?: string;
  IsFirstLogin: string;
  IsPassWordChange: string;
  FWCPostion: string;
  Roles: '';

  RootNo: '';
}

export interface TokenInfo {
  Token: string;
  UserNo: string;
  OrgNo: string;
}

class UserInfo {
  [x: string]: any;

  //检查当前登录人员是否有岗位编号.
  public async CheckIsHaveStationNo(stationNo: String): Promise<boolean> {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
    handler.AddPara('StationNo', stationNo);
    const str = await handler.DoMethodReturnString('Sys_CheckIsHaveStationNo');
    if (str === '1') return true;
    return false;
  }
  //检查当前登录人员是否有部门编号.
  public async CheckIsHaveDeptNo(stationNo: String): Promise<boolean> {
    const handler = new HttpHandler('BP.WF.HttpHandler.WF_Comm');
    handler.AddPara('DeptNo', stationNo);
    const str = await handler.DoMethodReturnString('Sys_CheckIsHaveDeptNo');
    if (str === '1') return true;
    return false;
  }

  get No() {
    return this.user.No;
  }
  get Name() {
    return this.user.Name;
  }

  get DeptNo() {
    return this.user.FK_Dept;
  }

  get DeptName() {
    return this.user.FK_DeptName;
  }

  get OrgNo() {
    return this.user?.OrgNo;
  }

  get OrgName() {
    return this.user.OrgName;
  }

  get IsAdmin() {
    return !!this.user.IsAdmin;
  }

  get Token() {
    return this.user.Token;
  }

  get SysLang() {
    return this.user.SysLang;
  }

  get Avatar() {
    return this.user.avatar;
  }

  get CCBPMRunModel() {
    return parseInt(this.user.CCBPMRunModel || 0);
  }
  get user() {
    if (this.userObj.No == '') {
      const userStore = useUserStore();
      this.userObj = userStore.userInfo as User;
      return this.userObj;
    }
    return this.userObj;
  }
  get IsFirstLogin() {
    return this.user.IsFirstLogin;
  }
  get IsPassWordChange() {
    return this.user.IsPassWordChange;
  }
  get Roles() {
    //逗号分隔角色id
    return this.user.Roles;
  }
  get RootNo() {
    return this.user.RootNo;
  }
  set setIsFirstLogin(value) {
    this.user.IsFirstLogin = value;
  }
  set setIsPassWordChange(value) {
    this.user.IsPassWordChange = value;
  }
  get FWCPostion(){
    return this.user.FWCPostion;
  }
  set setFWCPostion(value){
    debugger
    this.user.FWCPostion = value;
  }
  private userObj: Partial<User> = {
    No: '',
    Name: '',
    FK_Dept: '',
    FK_DeptName: '',
    OrgName: '',
    OrgNo: '',
    IsAdmin: false,
    Token: '',
    avatar: '',
    CCBPMRunModel: 0,
    SysLang: 'CH',
    IsFirstLogin: '0',
    IsPassWordChange: '0',
    Roles: '',
    FWCPostion:'',
  };

  set userInfo(user: User | null) {
    if (user) {
      this.userObj = user;
    } else {
      this.userObj = {
        No: '',
        Name: '',
        FK_Dept: '',
        FK_DeptName: '',
        OrgName: '',
        OrgNo: '',
        IsAdmin: false,
        Token: '',
        avatar: '',
        CCBPMRunModel: 0,
        SysLang: 'FT',
        IsFirstLogin: '0',
        IsPassWordChange: '0',
        Roles: '',
        FWCPostion:'',
      };
    }
  }
}

const WebUser = reactive(new UserInfo());

export default WebUser;
