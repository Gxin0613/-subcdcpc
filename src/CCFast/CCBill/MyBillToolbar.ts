import { BillState, GenerBill } from './GenerBill';
import { FrmBill } from './FrmBill';
import WebUser from '/@/bp/web/WebUser';
import HttpHandler from '/@/utils/gener/HttpHandler';
import { message } from 'ant-design-vue';
import { SystemConfig } from '/@/bp/difference/SystemConfig';

export enum EventType {
  New = 'New',
  Save = 'Save',
  SaveAndNew = 'SaveAndNew', //保存新建.
  Delete = 'Delete',
  Archive = 'Archive', //归档.
  ArchiveUn = 'ArchiveUn', //撤销归档.
  Draft = 'Draft', //设置草稿.
  Cancel = 'Cancel',
  ReturnSta = 'ReturnSta', //退回
  UnSend = 'UnSend', //撤销审核
  Reback = 'Reback', //回滚流程

  Track = 'Track', //日志.
  SubmitCheck = 'SubmitCheck', //提交审核.
  CheckEmps = 'CheckEmps', //审核人员.
  Approve = 'Approve', //通过.
  PrintPDF = 'PrintPDF',
  PrintHtml = 'PrintHtml',
  PrintTemplate = 'PrintTemplate',
  PrintCCWord = 'PrintCCWord',
  ExpZip = 'ExpZip',

  WaiGua = 'WaiGua',

  RecJuggle = 'RecJuggle',
  RecDead = 'RecDead',

  FlowView = 'FlowView',
}

export class MyBillToolbar {
  //定义的按钮.
  public static btns: Array<{ BtnID: string; BtnLab: string }> = [];
  //默认可以编辑.
  public static frmIsReadonly = false;

  public static async BySettingSelfChecks(btns: Array<{ BtnID: EventType; BtnLab: string }>, gb: GenerBill, frmBill: FrmBill, frm: string) {
    //如果是空白
    if (gb.BillState == 0) {
      // btns = '/保存/删除/归档/提交审核/';
      btns.push({
        BtnID: EventType.Save,
        BtnLab: '保存',
      });
      btns.push({
        BtnID: EventType.Delete,
        BtnLab: '删除',
      });
      btns.push({
        BtnID: EventType.Draft,
        BtnLab: '设置草稿',
      });
      btns.push({
        BtnID: EventType.SubmitCheck,
        BtnLab: '提交审核',
      });
    }

    //草稿编辑状态,并且是当前处理人的单据.
    if ((gb.BillState == BillState.Draft || gb.BillState == BillState.Editing) && gb.Starter == WebUser.No) {
      // btns = '/保存/删除/归档/提交审核/';
      btns.push({
        BtnID: EventType.Save,
        BtnLab: '保存',
      });
      btns.push({
        BtnID: EventType.Delete,
        BtnLab: '删除',
      });
      //检查是否是审核
      btns.push({
        BtnID: EventType.SubmitCheck,
        BtnLab: '提交审核',
      });
    }
    if ((gb.BillState == BillState.Draft || gb.BillState == BillState.Editing) && gb.Starter != WebUser.No) {
      this.frmIsReadonly = true; //这里应该阻滞查看，其他人不应该有查看的权限了.
    }

    //如果是审核中：是当前人发起的.
    if (gb.BillState == BillState.Checking && gb.Starter == WebUser.No && gb.CurrCheckerNos.includes(WebUser.No) == false) {
      MyBillToolbar.frmIsReadonly = true;
      btns.push({
        BtnID: EventType.UnSend,
        BtnLab: '撤销审核',
      });
    }
    //如果是审核中：是当前人发起的.
    if ((gb.BillState == BillState.Checking || gb.BillState == BillState.ReturnSta) && gb.Starter == WebUser.No && gb.CurrCheckerNos.includes(WebUser.No) == true) {
      MyBillToolbar.frmIsReadonly = true;
      //检查是否是审核
      btns.push({
        BtnID: EventType.SubmitCheck,
        BtnLab: '提交审核',
      });
      btns.push({
        BtnID: EventType.CheckEmps,
        BtnLab: '审核路径',
      });
    }

    //如果是审核中：不是当前人发起的，具有审核的能力.
    if ((gb.BillState == BillState.Checking || gb.BillState == BillState.ReturnSta) && gb.Starter != WebUser.No && gb.CurrCheckerNos.includes(WebUser.No)) {
      MyBillToolbar.frmIsReadonly = true;
      if (gb.BillState == BillState.ReturnSta) {
        //如果是退回.
        alert(gb.Msg);
      }
      //判断当前人员是否可以审核?
      if (gb.Starter != WebUser.No) {
        btns.push({
          BtnID: EventType.Approve,
          BtnLab: '审核通过',
        });
        btns.push({
          BtnID: EventType.ReturnSta,
          BtnLab: '不同意退回',
        });
        if (frmBill.BillCheckModel === 'SelfCheck1')
          btns.push({
            BtnID: EventType.Archive,
            BtnLab: '归档',
          });

        btns.push({
          BtnID: EventType.CheckEmps,
          BtnLab: '审核路径',
        });
      }
    }
    //如果是在途工作,
    // alert(gb.CurrCheckerNos.includes(WebUser.No));
    if ((gb.BillState == BillState.Checking || gb.BillState == BillState.ReturnSta) && gb.Emps.includes(WebUser.No) && gb.CurrCheckerNos.includes(WebUser.No) == false) {
      MyBillToolbar.frmIsReadonly = true;

      let isHave = false;
      for (let index = 0; index < btns.length; index++) {
        const element = btns[index];
        if (element.BtnID == EventType.UnSend) isHave = true;
      }
      if (isHave == false) {
        btns.push({
          BtnID: EventType.UnSend,
          BtnLab: '撤销审核',
        });
      }

      btns.push({
        BtnID: EventType.CheckEmps,
        BtnLab: '审核路径',
      });

      const isHaveIt = !!btns.find((btn) => btn.BtnID == EventType.Track);
      if (isHaveIt == false && 1 == 2) {
        btns.push({
          BtnID: EventType.Track,
          BtnLab: '轨迹',
        });
      }
    }

    //如果是归档.
    if (gb.BillState == BillState.FlowOver || gb.BillState == BillState.Checking) {
      // btns = '/保存/删除/归档/';
      MyBillToolbar.frmIsReadonly = true;
    }

    //如果是归档，并且是发起人.
    if (gb.BillState == BillState.FlowOver && gb.Starter == WebUser.No) {
      MyBillToolbar.frmIsReadonly = true;
      btns.push({
        BtnID: EventType.Reback,
        BtnLab: '回滚',
      });
    }

    //如果是归档，并且是发起人.
    if (gb.BillState == BillState.FlowOver && gb.Starter == WebUser.No) {
      const handler = new HttpHandler('BP.CCBill.WF_CCBill');
      handler.AddPara('WorkID', gb.WorkID);
      const msg = await handler.DoMethodReturnString('MyBill_StarterReadOver');
      message.info(msg);
      MyBillToolbar.frmIsReadonly = true;
    }

    if (gb.Starter == WebUser.No) MyBillToolbar.frmIsReadonly = false;
    if (gb.BillState == BillState.FlowOver || gb.BillState == BillState.FrmOver) MyBillToolbar.frmIsReadonly = true;

    if ((gb.BillState == BillState.Checking || gb.BillState == BillState.ReturnSta) && gb.Starter == WebUser.No) {
      MyBillToolbar.deleteBtn(btns, EventType.UnSend); // 撤销审核.
      btns.push({
        BtnID: EventType.UnSend,
        BtnLab: '撤销审核',
      });
    }

    //如果有删除按钮,判断是否可以去掉.
    return btns;
  }
  //按照设置的固定人员审核.
  public static async BySettingEmpNos(btns: Array<{ BtnID: EventType; BtnLab: string }>, gb: GenerBill, frmBill: FrmBill, frm: string) {
    //如果是空白
    if (gb.BillState == 0) {
      // btns = '/保存/删除/归档/提交审核/';
      btns.push({
        BtnID: EventType.Save,
        BtnLab: '保存',
      });
      // btns.push({
      //   BtnID: EventType.SaveAndNew,
      //   BtnLab: '保存&新建',
      // });
      btns.push({
        BtnID: EventType.Delete,
        BtnLab: '删除',
      });
      btns.push({
        BtnID: EventType.Draft,
        BtnLab: '设置草稿',
      });
      btns.push({
        BtnID: EventType.SubmitCheck,
        BtnLab: '提交审核',
      });
    }

    //草稿编辑状态,并且是当前处理人的单据.
    if ((gb.BillState == BillState.Draft || gb.BillState == BillState.Editing) && gb.Starter == WebUser.No) {
      // btns = '/保存/删除/归档/提交审核/';
      btns.push({
        BtnID: EventType.Save,
        BtnLab: '保存',
      });
      btns.push({
        BtnID: EventType.Delete,
        BtnLab: '删除',
      });
      //检查是否是审核
      btns.push({
        BtnID: EventType.SubmitCheck,
        BtnLab: '提交审核',
      });
    }
    if ((gb.BillState == BillState.Draft || gb.BillState == BillState.Editing) && gb.Starter != WebUser.No) {
      this.frmIsReadonly = true; //这里应该阻滞查看，其他人不应该有查看的权限了.
    }

    //如果是审核中：是当前人发起的.
    if (gb.BillState == BillState.Checking && gb.Starter == WebUser.No && gb.CurrCheckerNos.includes(WebUser.No) == false) {
      MyBillToolbar.frmIsReadonly = true;
      btns.push({
        BtnID: EventType.UnSend,
        BtnLab: '撤销审核',
      });
    }
    //如果是审核中：是当前人发起的.
    if ((gb.BillState == BillState.Checking || gb.BillState == BillState.ReturnSta) && gb.Starter == WebUser.No && gb.CurrCheckerNos.includes(WebUser.No) == true) {
      MyBillToolbar.frmIsReadonly = true;
      btns.push({
        BtnID: EventType.UnSend,
        BtnLab: '撤销审核',
      });

      btns.push({
        BtnID: EventType.Approve,
        BtnLab: '审核通过',
      });
      btns.push({
        BtnID: EventType.ReturnSta,
        BtnLab: '不同意退回',
      });
      //检查是否是审核
      btns.push({
        BtnID: EventType.SubmitCheck,
        BtnLab: '提交审核',
      });
      btns.push({
        BtnID: EventType.CheckEmps,
        BtnLab: '审核路径',
      });
    }

    //如果是审核中：不是当前人发起的，具有审核的能力.
    //alert(gb.CurrCheckerNos.includes(WebUser.No));
    if ((gb.BillState == BillState.Checking || gb.BillState == BillState.ReturnSta) && gb.Starter != WebUser.No && gb.CurrCheckerNos.includes(WebUser.No)) {
      // const gb=new GenerBill(workID);
      // alert(gb.CurrCheckerNos.includes(WebUser.No));
      MyBillToolbar.frmIsReadonly = true;
      if (gb.BillState == BillState.ReturnSta) {
        //如果是退回.
        alert(gb.Msg);
      }
      //判断当前人员是否可以审核?
      if (gb.Starter != WebUser.No) {
        btns.push({
          BtnID: EventType.Approve,
          BtnLab: '审核通过',
        });
        btns.push({
          BtnID: EventType.ReturnSta,
          BtnLab: '不同意退回',
        });
        btns.push({
          BtnID: EventType.CheckEmps,
          BtnLab: '审核路径',
        });
      }
    }
    //如果是在途工作,
    // alert(gb.CurrCheckerNos.includes(WebUser.No));
    if ((gb.BillState == BillState.Checking || gb.BillState == BillState.ReturnSta) && gb.Emps.includes(WebUser.No) && gb.CurrCheckerNos.includes(WebUser.No) == false) {
      MyBillToolbar.frmIsReadonly = true;

      let isHave = false;
      for (let index = 0; index < btns.length; index++) {
        const element = btns[index];
        if (element.BtnID == EventType.UnSend) isHave = true;
      }
      if (isHave == false) {
        btns.push({
          BtnID: EventType.UnSend,
          BtnLab: '撤销审核',
        });
      }

      btns.push({
        BtnID: EventType.CheckEmps,
        BtnLab: '审核路径',
      });

      const isHaveIt = !!btns.find((btn) => btn.BtnID == EventType.Track);
      if (isHaveIt == false && 1 == 2) {
        btns.push({
          BtnID: EventType.Track,
          BtnLab: '轨迹',
        });
      }
    }

    //如果是归档.
    if (gb.BillState == BillState.FlowOver || gb.BillState == BillState.Checking) {
      // btns = '/保存/删除/归档/';
      MyBillToolbar.frmIsReadonly = true;
    }

    //如果是归档，并且是发起人.
    if (gb.BillState == BillState.FlowOver && gb.Starter == WebUser.No) {
      MyBillToolbar.frmIsReadonly = true;
      btns.push({
        BtnID: EventType.Reback,
        BtnLab: '回滚',
      });
    }

    //如果是归档，并且是发起人.
    if (gb.BillState == BillState.FlowOver && gb.Starter == WebUser.No) {
      const handler = new HttpHandler('BP.CCBill.WF_CCBill');
      handler.AddPara('WorkID', gb.WorkID);
      const msg = await handler.DoMethodReturnString('MyBill_StarterReadOver');
      message.info(msg);
      MyBillToolbar.frmIsReadonly = true;
    }

    if (gb.Starter == WebUser.No) MyBillToolbar.frmIsReadonly = false;
    if (gb.BillState == BillState.FlowOver || gb.BillState == BillState.FrmOver) MyBillToolbar.frmIsReadonly = true;

    if ((gb.BillState == BillState.Checking || gb.BillState == BillState.ReturnSta) && gb.Starter == WebUser.No) {
      MyBillToolbar.deleteBtn(btns, EventType.UnSend); // 撤销审核.
      btns.push({
        BtnID: EventType.UnSend,
        BtnLab: '撤销审核',
      });
    }

    //如果有删除按钮,判断是否可以去掉.
    return btns;
  }
  public static deleteBtn(btns, btnID) {
    const index = btns.findIndex((btn) => btn.BtnID == btnID);
    if (index != -1) btns.splice(index, 1);
    return btns;
  }
  public static IsExitBtn(btns, btnID) {
    return btns.findIndex((btn) => btn.BtnID == btnID) > -1;
  }
  public static async ToolbarAPI(btns: Array<{ BtnID: EventType; BtnLab: string }>, gb: GenerBill, frmBill: FrmBill, frm: string) {
    // 判断步骤: 1. 是否是发起人.  2.是否有读取的权限.  3.是否有处理的权限.
    let isReadonly = false;
    //如果是空白
    if (gb.BillState == 0) {
      // btns = '/保存/删除/归档/提交审核/';
      btns.push({
        BtnID: EventType.Save,
        BtnLab: '保存',
      });
      btns.push({
        BtnID: EventType.Delete,
        BtnLab: '删除',
      });
      btns.push({
        BtnID: EventType.Draft,
        BtnLab: '设置草稿',
      });
    }

    //草稿编辑状态,并且是当前处理人的单据.
    if (
      (gb.BillState == BillState.Draft || gb.BillState == BillState.Editing || gb.BillState == BillState.Checking || gb.BillState == BillState.ReturnSta) &&
      gb.Starter == WebUser.No
    ) {
      // btns = '/保存/删除/归档/提交审核/';
      btns.push({
        BtnID: EventType.Save,
        BtnLab: '保存',
      });
      btns.push({
        BtnID: EventType.Delete,
        BtnLab: '删除',
      });

      btns.push({
        BtnID: EventType.SubmitCheck,
        BtnLab: '提交审核',
      });
    }
    if ((gb.BillState == BillState.Draft || gb.BillState == BillState.Editing) && gb.Starter != WebUser.No) {
      isReadonly = true; //这里应该阻滞查看，其他人不应该有查看的权限了.
    }

    //如果是审核中：是当前人发起的.
    if (gb.BillState == BillState.Checking && gb.Starter == WebUser.No && gb.CurrCheckerNos.includes(WebUser.No) == false) {
      isReadonly = true;
      btns.push({
        BtnID: EventType.UnSend,
        BtnLab: '撤销审核',
      });
    }
    //如果是审核中：不是当前人发起的，具有审核的能力.
    //alert(gb.CurrCheckerNos.includes(WebUser.No));
    if ((gb.BillState == BillState.Checking || gb.BillState == BillState.ReturnSta) && gb.CurrCheckerNos.includes(WebUser.No)) {
      // const gb=new GenerBill(workID);
      // alert(gb.CurrCheckerNos.includes(WebUser.No));
      MyBillToolbar.frmIsReadonly = true;
      if (gb.BillState == BillState.ReturnSta) {
        message.info(gb.Msg);
      }
      if (gb.Starter == WebUser.No) {
      } else {
        //判断当前人员是否可以审核?
        btns.push({
          BtnID: EventType.Approve,
          BtnLab: '审核通过',
        });
        btns.push({
          BtnID: EventType.ReturnSta,
          BtnLab: '不同意退回',
        });
      }
      btns.push({
        BtnID: EventType.CheckEmps,
        BtnLab: '审核路径',
      });
    }
    //如果是在途工作,
    if ((gb.BillState == BillState.Checking || gb.BillState == BillState.ReturnSta) && gb.Emps.includes(WebUser.No) && gb.CurrCheckerNos.includes(WebUser.No) == false) {
      isReadonly = true;
      btns = this.deleteBtn(btns, EventType.SubmitCheck);

      const isHave = !!btns.find((btn) => btn.BtnID == EventType.UnSend);
      if (isHave == false) {
        btns.push({
          BtnID: EventType.UnSend,
          BtnLab: '撤销审核',
        });
      }

      btns.push({
        BtnID: EventType.CheckEmps,
        BtnLab: '审核路径',
      });

      const isHaveIt = !!btns.find((btn) => btn.BtnID == EventType.Track);
      if (isHaveIt == false && 1 == 2) {
        btns.push({
          BtnID: EventType.Track,
          BtnLab: '轨迹',
        });
      }
    }

    //如果是归档+审核状态.
    if (gb.BillState == BillState.FlowOver || gb.BillState == BillState.Checking) {
      // btns = '/保存/删除/归档/';
      isReadonly = true;
    }

    //如果是归档，并且是发起人.
    if (gb.BillState == BillState.FlowOver && gb.Starter == WebUser.No) {
      isReadonly = true;
      btns.push({
        BtnID: EventType.Reback,
        BtnLab: '回滚',
      });
    }

    //如果是归档,并且是发起人.
    if (gb.BillState == BillState.FlowOver && gb.Starter == WebUser.No && frm == 'Todolist') {
      const handler = new HttpHandler('BP.CCBill.WF_CCBill');
      handler.AddPara('WorkID', gb.WorkID);
      const msg = await handler.DoMethodReturnString('MyBill_StarterReadOver');
      message.info(msg);
      MyBillToolbar.frmIsReadonly = true;
    }

    // if (gb.Starter == WebUser.No) isReadonly = false;
    if (gb.BillState == 200) isReadonly = true; //表单归档.

    //@wanglu.
    if (isReadonly == true) {
      //如果有删除，保存，就移除.
      btns = this.deleteBtn(btns, EventType.Save);
      btns = this.deleteBtn(btns, EventType.Delete);
    }
    MyBillToolbar.frmIsReadonly = isReadonly;
    return btns;
  }
  public static async None(btns: Array<{ BtnID: EventType; BtnLab: string }>, gb: GenerBill, _frmBill: FrmBill, _frm: string, btnRoles) {
    //如果是空白
    if (gb.BillState == 0 || gb.BillState == 1) {
      // btns = '/保存/删除/归档/提交审核/';
      if (parseInt(btnRoles.SaveEnable) == 1)
        btns.push({
          BtnID: EventType.Save,
          BtnLab: '保存',
        });
      /*if (parseInt(btnRoles.NewEnable) == 1)
        btns.push({
          BtnID: EventType.SaveAndNew,
          BtnLab: '保存&新建',
        });*/
      if (parseInt(btnRoles.DeleteEnable) == 1)
        btns.push({
          BtnID: EventType.Delete,
          BtnLab: '删除',
        });
      if (parseInt(btnRoles.SaveEnable) == 1)
        btns.push({
          BtnID: EventType.Draft,
          BtnLab: '设置草稿',
        });
      if (parseInt(btnRoles.FilingDoneEnable) == 1)
        btns.push({
          BtnID: EventType.Archive,
          BtnLab: '归档',
        });
      MyBillToolbar.frmIsReadonly = false;
    }
    //草稿编辑状态,并且是当前处理人的单据.
    if (gb.BillState == BillState.Editing || gb.BillState == 4) {
      MyBillToolbar.frmIsReadonly = false;
      // btns = '/保存/删除/归档/提交审核/';
      if (parseInt(btnRoles.SaveEnable) == 1)
        btns.push({
          BtnID: EventType.Save,
          BtnLab: '保存',
        });
      if (parseInt(btnRoles.DeleteEnable) == 1)
        btns.push({
          BtnID: EventType.Delete,
          BtnLab: '删除',
        });
      if (parseInt(btnRoles.FilingDoneEnable) == 1)
        btns.push({
          BtnID: EventType.Archive,
          BtnLab: '归档',
        });
    }
    if ((gb.BillState == BillState.Draft || gb.BillState == BillState.Editing) && gb.Starter != WebUser.No) {
      MyBillToolbar.frmIsReadonly = true; //这里应该阻滞查看，其他人不应该有查看的权限了.
    }
    //如果是归档.
    if (gb.BillState == BillState.FlowOver || gb.BillState == BillState.FrmOver) {
      // btns = '/保存/删除/归档/';
      MyBillToolbar.frmIsReadonly = true;
      if (parseInt(btnRoles.FilingUnEnable) == 1)
        btns.push({
          BtnID: EventType.ArchiveUn,
          BtnLab: '撤销归档',
        });
      if (SystemConfig.CustomNo === 'ynjt' && WebUser.IsAdmin)
        btns.push({
          BtnID: EventType.Cancel,
          BtnLab: '作废',
        });
    }
    if (gb.BillState == BillState.Cancel && gb.Starter == WebUser.No) {
      // btns = '/保存/删除/归档/';
      MyBillToolbar.frmIsReadonly = false;
      if (parseInt(btnRoles.SaveEnable) == 1)
        btns.push({
          BtnID: EventType.Save,
          BtnLab: '保存',
        });
      if (parseInt(btnRoles.DeleteEnable) == 1)
        btns.push({
          BtnID: EventType.Delete,
          BtnLab: '删除',
        });
      if (parseInt(btnRoles.FilingDoneEnable) == 1)
        btns.push({
          BtnID: EventType.Archive,
          BtnLab: '归档',
        });
    }
    return btns;
  }
}
