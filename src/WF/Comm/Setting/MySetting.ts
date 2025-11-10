import { EntityNoName } from '/@/bp/en/EntityNoName';
import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { Dept } from '/@/bp/port/Dept';
import { AuthAttr, Auths } from './Auth';
import { RefMethod, RefMethodType } from '/@/bp/en/Map/RefMethod';
import BSEntity from '/@/utils/gener/BSEntity';
import WebUser from '/@/bp/web/WebUser';
import { GPE_MyFrmStyle } from './GPE_MyFrmStyle';
import { GPN_WorkShift } from './GPN_WorkShift';
import { CCBPMRunModel } from '/@/bp/difference/SystemConfig';
import { AesEncryption } from '/@/utils/cipher';
import { getAppEnvConfig } from '/@/utils/env';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { GPN_SelfMenu } from './GPN_SelfMenu';

// 人员
export class MySetting extends EntityNoName {
  constructor(no?: string) {
    super('TS.User.MySetting');
    if (WebUser.CCBPMRunModel == CCBPMRunModel.SAAS && no?.includes('_') == false) no = WebUser.OrgNo + '_' + no;
    if (!!no) this.setPKVal(no);
  }

  // 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = false;
    uac.IsUpdate = true;
    uac.IsInsert = false;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('WF_Emp', '我的设置');

    map.AddGroupAttr('基本信息');
    map.AddTBStringPK('No', null, '账号', true, true, 1, 3, 50);
    map.AddTBString('UserID', null, 'UserID', true, false, 0, 50, 200);
    map.AddTBString('Name', null, '名称', true, false, 0, 50, 200);
    map.AddDDLEntities('FK_Dept', null, '部门', new Dept(), false);

    map.AddTBString('Tel', null, '电话', true, false, 0, 50, 200);
    map.AddTBString('Email', null, '邮件', true, false, 0, 50, 200);
    map.AddTBInt('FrmStyle', 0, '表单风格', false, false);
    map.AddDDLStringEnum('SysLang', 'CH', '系统语言', '@CH=中文@En=英文@FT=繁体@JP=日文', true);

    map.AddGroupAttr('邮件设置');
    map.AddDDLStringEnum('EM_SeverType', 'IMAP', '服务器类型', '@IMAP=IMAP@POP3=POP3', true);
    map.AddTBString('EM_Email', null, '邮件账号', true, false, 0, 50, 200);
    map.AddTBString('EM_Pass', null, '密码', true, false, 0, 50, 200);

    map.AddTBString('EM_IMAP_SeverIP', null, 'IMAP服务器', true, false, 0, 50, 200, true);
    map.AddTBString('EM_IMAP_Port', null, '端口', true, false, 0, 50, 200);
    map.AddBoolean('EM_IMAP_SSL', false, 'SSL', true, true);

    map.AddTBString('EM_SMTP_SeverIP', null, 'SMTP服务器', true, false, 0, 50, 200, true);
    map.AddTBString('EM_SMTP_Port', null, '端口', true, false, 0, 50, 200);
    map.AddBoolean('EM_SMTP_SSL', false, 'SSL', true, true);

    map.AddTBString('EM_SMTP_SenderName', null, '发件人名称', true, false, 0, 50, 200, true);
    map.AddTBStringDoc('EM_SMTP_SenderSigner', null, '签名', true, false, true);

    map.AddTBAtParas(3500); // @EnName=TS.XXX.AA@Key=xxxx

    map.AddRM_DtlSearch('授权', new Auths(), AuthAttr.Auther, '', '', 'AutherToEmpNo,AutherToEmpName,AuthTypeText', 'icon-drop', false, '');

    const rm2 = new RefMethod();
    rm2.Title = '修改密码';
    rm2.RefMethodType = RefMethodType.TabOpen;
    rm2.ClassMethod = '/src/views/sys/user/ChangeMyPwd.vue';
    // rm2.ClassMethod = 'CPass';
    // rm2.HisMap.AddTBString('p1', null, '原密码', true, false, 0, 100, 1000, true);
    // rm2.HisMap.AddTBString('p2', null, '新密码', true, false, 0, 100, 1000, true);
    // rm2.HisMap.AddTBString('p3', null, '确认密码', true, false, 0, 100, 1000, true);
    map.AddRefMethod(rm2);

    const rm12 = new RefMethod();
    rm12.Title = '设置头像';
    rm12.RefMethodType = RefMethodType.TabOpen;
    rm12.ClassMethod = '/src/views/sys/user/UploadAvatar.vue';
    // rm12.HisMap.attrs.AddTBImageUpload('f1', '', '更换头像', true, false);
    map.AddRefMethod(rm12);

    const r1 = new RefMethod();
    r1.Title = '设置签名（电子签名图片）';
    r1.RefMethodType = RefMethodType.TabOpen;
    r1.ClassMethod = '/src/views/sys/user/CreateSignature.vue';
    map.AddRefMethod(r1);

    const r3 = new RefMethod();
    r3.Title = '上传签名';
    r3.RefMethodType = RefMethodType.TabOpen;
    r3.ClassMethod = '/src/views/sys/user/UploadSignature.vue';
    map.AddRefMethod(r3);
    // const r3 = new RefMethod();
    // r3.Title = '签字板';
    // r3.ClassMethod = 'SetSigineBody';
    // r3.HisMap.AddMakeImage('f1', '', '设置签名', true, false);
    // map.AddRefMethod(r3);

    //表单风格.
    map.AddRM_GPE(new GPE_MyFrmStyle(), 'icon-drop');

    map.AddRM_GPN(new GPN_WorkShift(), 'icon-login');
    //常用菜单
    map.AddRM_GPN(new GPN_SelfMenu(), 'icon-drop');

    //成都钉钉服务
    // if (!!WebUser.IsAdmin) {
    //   const r3 = new RefMethod();
    //   r3.Title = '钉钉服务设置';
    //   r3.ClassMethod = 'DingDingSetting';
    //   r3.HisMap.AddTBString('EmpNo', null, '选择人员', true, false, 0, 100, 1000, true);
    //   r3.HisMapExts.AddPopList('EmpNo', GloWF.srcEmps, 3, false, 800, 1000);
    //   r3.HisMap.AddTBString('FlowNo', null, '选择流程', true, false, 0, 100, 1000, true);
    //   r3.HisMapExts.AddPopList('FlowNo', GloWF.srcFlows, 3, false, 800, 1000);
    //   map.AddRefMethod(r3);
    // }

    // 设置委托
    this._enMap = map;
    return this._enMap;
  }
  public SetIcon() {
    return '未实现.';
  }
  public SetSigner() {
    return '未实现.';
  }
  public SetSigineBody() {
    return '未实现.';
  }
  public async CPass(p1: string, p2: string, p3: string): Promise<string> {
    if (!p1 || !p2 || !p3) {
      return '新密码或旧密码不能为空,请填写完整.';
    } else {
      let pkVal = WebUser.No;
      if (WebUser.CCBPMRunModel == CCBPMRunModel.SAAS) {
        pkVal = WebUser.OrgNo + '_' + WebUser.No;
      }
      const en = new BSEntity('BP.Port.Emp', pkVal);
      await en.Retrieve();
      //密码敏感信息加密
      const { VITE_GLOB_ENCRYPTION_KEY } = getAppEnvConfig();
      const encryption = new AesEncryption({ key: VITE_GLOB_ENCRYPTION_KEY });
      //不加密就注释掉 p1 p2 p3
      p1 = encryption.encryptByAES(p1);
      p2 = encryption.encryptByAES(p2);
      p3 = encryption.encryptByAES(p3);
      const str = await en.DoMethodReturnString('ChangePass', p1, p2, p3);
      //  message.info(str);
      return str;
    }
  }

  public async DingDingSetting(p1: string, p2: string): Promise<string> {
    if (!p1 || !p2) {
      return '人员或流程不能为空,请选择.';
    } else {
      const handler = new HttpHandler('bp.cdtb.Handler');
      await handler.AddPara('EmpNo', p1);
      await handler.AddPara('FlowNo', p2);
      const gwfs = await handler.DoMethodReturnString('taskCycle');
      return gwfs;
    }
  }
}
