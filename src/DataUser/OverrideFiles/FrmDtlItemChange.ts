import HttpHandler from '/@/utils/gener/HttpHandler';
import { windowOpen } from '/@/utils/windowOpen';
import { Direction } from '/@/WF/Admin/Cond2020/Direction';

/**
 * 从表重写类使用说明.
 * 1. 该类文件位于 datauser下，开发人员可以重写该文件，不会对cc的核心代码造成影响.
 * 2. 定义的按钮展现在 /WF/Comm/DtlSearch.vue /WF/Comm/DtlBatch.vue 上,如果用户按下了事件,就调用 BtnClick 方法.
 * 3. 可以通过写方法实现业务逻辑.
 */
export class FrmDtlBtnClick {
  constructor() {}

  /**
   * 重写的按钮事件
   * @param btnName 按钮名字，比如:新建,删除
   * @param pkval  表单主键值int类型， 比如: 55555
   * @param dtlEnName 从表的实体比较,比如: ND101Dtl1
   * @param selectedDtlPKs 选择的从表数据，多个用逗号分开，可以为空, 比如:  1001,10012,10013
   * @param bodyJson 主表的数据.
   */
  public static async TableTopBtnClick(btnName: string, dtlEnName: string, pkval: number, selectedDtlPKs: string, bodyJson: string) {
    //价格系统新增从表.
    if ((btnName == '新增' || btnName == '新建') && dtlEnName == 'ND101Dtl1') {
      if (bodyJson == null) {
        alert('没有json数据.');
        return false;
      }
      return 'reload'; //标识执行成功，需要刷新数据.
    }

    //展会管理. @wanglu ,
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
      const dir = new Direction();
      //  dir.MyPK = pkval;
      await dir.RetrieveFromDBSources();

      const handler = new HttpHandler('BP.WF.HttpHandler.WF_Admin_Cond2020');
      handler.AddPara('ToNodeID', dir.ToNode);
      handler.AddPara('FK_Node', dir.Node);
      handler.AddPara('CondType', 2); // GetQueryString('CondType');
      const data = await handler.DoMethodReturnString('List_DoCheck');
      alert(data);
      // $('#msg').html(data);
      // 这里的 PKVal 出现错误，不是101， 而是传递过来的，RefPKVal 值. 要从url里面获取.
      // alert('btnName=' + btnName + ',pkval=' + pkval + ',dtlEnName=' + dtlEnName + ',selectedDtlPKs=' + selectedDtlPKs);
      return;
    }
    return;

    //节点工具栏.
    if (dtlEnName === 'TS.Demo.Resume' && btnName === '导出') {
      if (selectedDtlPKs == null) {
        alert('请选择数据指定导入');
        return;
      }
      alert('导出成功.');
      return;
    }

    //没有判断,就提示错误信息.
    const msg = ` WF_Comm_Dtl 没有判断的参数，请检查参数名是否正确？
        按钮名称: btnName ${btnName} 
        从表类名: dtlEnName  ${dtlEnName} 
        主表类: mainEnName ${mainEnName} 
        主表键值:pkval ${pkval} 
        选择的键值:selectedDtlPKs ${selectedDtlPKs} 
        `;
    // alert(msg);
  }
}
