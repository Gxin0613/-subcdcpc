import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { windowOpen } from '/@/utils/windowOpen';
import { Direction } from '/@/WF/Admin/Cond2020/Direction';
import { GloComm } from '/@/WF/Comm/GloComm';
import { message } from 'ant-design-vue';

/**
 * 从表重写类使用说明.
 * 1. 该类文件位于 datauser下，开发人员可以重写该文件，不会对cc的核心代码造成影响.
 * 2. 定义的按钮展现在 /WF/Comm/DtlSearch.vue /WF/Comm/DtlBatch.vue 上,如果用户按下了事件,就调用 BtnClick 方法.
 * 3. 可以通过写方法实现业务逻辑.
 */
export class WF_Comm_Dtl {
  constructor() {}

  /**
   * 重写的按钮事件
   * @param btnName 按钮名字，比如:导出
   * @param mainEnName  调用的实体类，比如：TS.Demo.Student
   * @param pkval  调用实体的类，比如: zhangsan
   * @param dtlEnName 从表的实体类,比如: TS.Demo.Resume
   * @param selectedDtlPKs 选择的从表数据，多个用逗号分开，可以为空, 比如选的简历ID:  xxx,yyy,ddd
   */
  public static async TableTopBtnClick(btnName: string, dtlEnName: string, pkval: string, selectedDtlPKs: string, params = {}) {
    if (btnName == '导入' && dtlEnName == 'TS.CG.CGDtl') {
      const url = GloComm.UrlGPN('GPN_SelectDtls', '&RefPKVal=' + pkval + '&Dtls=' + selectedDtlPKs);
      //const url = GloComm.UrlDtlSearch('TS.CG.PackageEn', '&RefPKVal=' + pkval + '&Dtls=' + selectedDtlPKs);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    }

    if (btnName == '导入' && dtlEnName == 'TS.Demo.Resume') {
      alert('请在这写入事件:DataUser/OverrieFiles/WF_Comm_Dtl.ts  主键值:' + pkval + '  选择的值:' + selectedDtlPKs);
      //  const url = GloComm.UrlGenerList('GL_CYGuideSelectOneFrm', '&WorkID=' + pkval);
      const url = GloComm.UrlGPN('GPN_Emp', '&DeptNo=1001&No=' + pkval + '&Dtls=' + selectedDtlPKs);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer90, url);
    }

    if (btnName === '导入' && dtlEnName === 'TS.PM.ZhuanYe') {
      // todo
      return;
    }

    if (btnName === '导入' && dtlEnName === 'TS.ZH.Pos') {
      const prjNo = pkval;
      alert('执行导入.' + prjNo);
      return;
    }

    if (btnName === '导出' && dtlEnName === 'TS.ZH.Pos') {
      const prjNo = pkval;
      alert('执行导出： ' + prjNo);
      return;
    }

    if (btnName === '新建子流程') {
      const url = '';
      windowOpen(url);
      //set
    }

    //检查条件的正确性.
    if (dtlEnName === 'TS.WF.Cond' && btnName.indexOf('检查') >= 0) {
      try {
        const dir = new Direction();
        dir.MyPK = pkval;
        await dir.RetrieveFromDBSources();

        const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_Cond2020');
        handler.AddPara('ToNodeID', dir.ToNode);
        handler.AddPara('FK_Node', dir.Node);
        handler.AddPara('CondType', 2);
        const data = await handler.DoMethodReturnString('List_DoCheck');
        return new GPNReturnObj(GPNReturnType.Message, data);
      } catch (error: any) {
        message.error(error);
      }
    }
    //提交审核
    if (dtlEnName === 'TS.CCBill.WorkOpt.SelfCheckWorker' && btnName.indexOf('提交审核') >= 0) {
      try {
        const handler = new HttpHandler('BP.CCBill.WF_CCBill');
        handler.AddPara('FrmID', params?.FrmID);
        handler.AddPara('WorkID', params.WorkID);
        handler.AddPara('Msg', params.Msg);
        await handler.DoMethodReturnString('MyBill_CheckerInit');
        return new GPNReturnObj(GPNReturnType.CloseAndReload);
      } catch (error: any) {
        message.error(error);
      }
    }
  }
}
