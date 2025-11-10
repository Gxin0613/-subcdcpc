import { SysEvent, SysEvents } from './SysEvent';
import { PageBaseGenerList } from '/@/bp/UIEntity/PageBaseGenerList';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { GenerDBSrcs } from '/@/CCFast/GenerDBSrc/GenerDBSrc';
import { GloComm } from '/@/WF/Comm/GloComm';
import { NodeExt } from '../../../AttrNode/NodeExt';
import { h } from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';
export class GL_Event extends PageBaseGenerList {
  override OnTextBlur(_object: Record<string, any>) {
    throw new Error('Method not implemented.');
  }

  constructor() {
    super('GL_Event');
    this.PageTitle = '事件';
  }
  //重写的构造方法.
  async Init() {
    this.DTFieldOfSearch = ''; // 'RDT'; // 按照日期范围查询的字段，为空就不需要日期段查询.
    this.DTFieldOfLabel = ''; // '发起日期'; //日期字段名.
    this.LinkField = ''; // 'Title';
    this.GroupFields = ''; // 'NodeName,FlowName,StarterName'; //分组字段.
    this.GroupFieldDefault = ''; // 'FlowName'; //分组字段.
    this.Icon = '';
    this.PageSize = 0; // 分页的页面行数, 0不分页.
    this.ShowIdx = true;
    this.BtnOfToolbar = '前后端外挂';
    const refMainEnName = this.RefMainEnName || this.params.RefMainEnName;

    if (refMainEnName == 'TS.WF.Template.NodeExt') {
      this.BtnOfToolbar += ',流程事件';
    }
    // 定义列，这些列用于显示. IsRead,PRI是特殊字段.
    this.Columns = [
      { Key: 'No', Name: 'ID', IsShow: true, DataType: 1, width: 80 },
      { Key: 'Name', Name: '事件名称', IsShow: true, DataType: 1, width: 150 },
      { Key: 'Desc', Name: '说明', IsShow: true, DataType: 1, width: 300 },
      { Key: 'GenerDBSrcMyPK', Name: 'GenerDBSrcMyPK', IsShow: false, DataType: 1, width: 100 },
      { Key: 'FrmEventMyPK', Name: 'FrmEventMyPK', IsShow: false, DataType: 1, width: 100 },
      { Key: 'Btns', Name: '操作', IsShow: false, DataType: 1, width: 100 },
    ];

    const evs = await this.MyGenerSorts(); //获得事件类型 No,Name,Desc
    const dbs = new GenerDBSrcs(); //获得配置内容.
    const frmEvents = new SysEvents(); //获得事件.

    // alert(this.PKVal);
    // alert(this.RefMainEnName);

    if (refMainEnName == 'TS.WF.Template.NodeExt') {
      await dbs.Retrieve('NodeID', this.PKVal);
      await frmEvents.Retrieve('NodeID', this.PKVal);
    } else if (refMainEnName == 'TS.WF.Template.FlowExt') {
      await dbs.Retrieve('FlowNo', this.PKVal);
      await frmEvents.Retrieve('FlowNo', this.PKVal);
    } else {
      await dbs.Retrieve('FrmID', this.PKVal);
      await frmEvents.Retrieve('FrmID', this.PKVal);
    }

    console.log('evs', evs);
    console.log('dbs', dbs);
    console.log('frmEvents', frmEvents);

    evs.forEach((element) => {
      const row: Record<string, any> = {};
      row.No = element.No;
      row.Name = element.Name;
      row.Desc = element.Desc;
      row.GenerDBSrcMyPK = '';
      row.FrmEventMyPK = '';
      row.Btns = '新建事件';
      const event = frmEvents.filter((fe) => fe.EventID === element.No);

      if (event.length > 0) {
        row.FrmEventMyPK = event[0].MyPK;
        row.Btns = '修改事件,删除';
      }
      const db = dbs.filter((d) => d.MarkID === element.No);
      if (db.length > 0) {
        row.GenerDBSrcMyPK = db[0].MyPK;
      }
      this.Data.push(row);
    });
  }

  override async BtnClick(_btnName: string, _record: Record<string, any>, _ids?: string) {
    if (_btnName == '删除') {
      const en = new SysEvent(_record.FrmEventMyPK);
      await en.Delete();
      return new GPNReturnObj(GPNReturnType.Reload);
      // else return new GPNReturnObj(GPNReturnType.DoNothing);
    }
    if (_btnName == '修改事件') {
      const url = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', this.PKVal, '&DBModel=SFProc&MarkID=' + _record.No);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }
    if (_btnName == '前后端外挂' || _btnName == '帮助') {
      const url = 'https://docs.qq.com/doc/DRFBXYWlQZHV5Ymtl';
      return new GPNReturnObj(GPNReturnType.OpenUrlByNewWindow, url);
    }

    if (_btnName == '新建事件') {
      //执行创建.
      const en = new SysEvent();
      en.FK_DBSrc = '无';
      en.EventSource = 1; //节点事件.
      en.RefPKVal = this.PKVal; // 节点ID,表单ID.
      en.EventID = _record.No; // sortNo; //事件ID.SendWhen,SendErr 事件.
      en.EventName = _record.Name; // await this.GetSortName(sortNo); //事件名称.

      const refMainEnName = this.RefMainEnName || this.params.RefMainEnName;
      if (refMainEnName.includes('TS.Frm.MapFrmFool')) en.EventSource = 0;
      if (refMainEnName.includes('TS.WF.Template.Frm')) en.EventSource = 0;
      if (refMainEnName.includes('TS.CCBill.FrmDict')) en.EventSource = 0;
      if (refMainEnName.includes('TS.CCBill.FrmEntityNoName')) en.EventSource = 0;
      if (refMainEnName.includes('TS.CCBill.FrmBill')) en.EventSource = 0;
      if (refMainEnName === 'TS.WF.Template.NodeExt') en.EventSource = 1;
      if (refMainEnName === 'TS.WF.Template.FlowExt') en.EventSource = 2;
      if (refMainEnName === 'TS.Frm.MapDtlExt') en.EventSource = 0;

      en.DoDoc = refMainEnName;
      //表单事件.
      if (en.EventSource == 0) {
        en.FrmID = this.PKVal;
      }

      //是节点的时候.
      if (en.EventSource == 1) {
        const node = new NodeExt(this.PKVal);
        await node.Retrieve();
        // if (node.NodeFrmID === '' || node.NodeFrmID.lastIndexOf('ND') == 0) en.FrmID = 'ND' + parseInt(node.FK_Flow) + 'Rpt';
        // else en.FrmID = node.NodeFrmID;
        en.NodeID = node.NodeID;
        en.FlowNo = node.FK_Flow;
        en.RefFlowNo = node.FK_Flow;
      }
      //流程事件.
      if (en.EventSource == 2) {
        en.FrmID = 'ND' + parseInt(this.PKVal) + 'Rpt';
        en.FK_Flow = this.PKVal;
        en.RefFlowNo = this.PKVal;
        en.FlowNo = this.PKVal;
      }

      //判断改事件，是否存在？如果存在就拒绝执行.
      let mypk = '';
      if (en.EventSource == 0) mypk = en.FrmID + '_' + _record.No;
      if (en.EventSource == 1) mypk = en.NodeID + '_' + _record.No;
      if (en.EventSource == 2) mypk = en.FlowNo + '_' + _record.No;
      en.MyPK = mypk;
      const num = await en.RetrieveFromDBSources();
      if (num == 0) {
        await en.Insert();
      }
      const url = GloComm.UrlGPEExt('GPE_GenerDBSrcSearch', this.PKVal, '&DBModel=SFProc&MarkID=' + _record.No);
      return new GPNReturnObj(GPNReturnType.OpenUrlByDrawer, url);
    }

    throw new Error('Method not implemented.');
  }

  //打开页面.
  async LinkFieldClick(_object: Record<string, any>) {}

  public async MyGenerSorts(): Promise<any[]> {
    const refMainEnName = this.RefMainEnName || this.params.RefMainEnName;
    //流程.
    if (refMainEnName === 'TS.WF.Template.FlowExt') {
      return Promise.resolve([
        {
          No: 'FlowOnCreateWorkID',
          Name: '创建工作ID后',
          Desc: '在流程实例创建并生成唯一WorkID时触发。用于初始化流程变量、设置表单默认值、验证启动条件或预置业务数据，为流程运行做好准备。',
        },
        {
          No: 'FlowOverBefore',
          Name: '流程结束前',
          Desc: '流程即将结束但尚未完成最终状态更新时触发。可进行最终业务校验、数据完整性检查、调用外部系统接口或执行自定义结算逻辑，若校验失败可阻止流程结束。',
        },
        {
          No: 'FlowOverAfter',
          Name: '流程结束后',
          Desc: '流程完全结束且状态已更新后触发。适用于执行后续业务操作，如更新关联业务状态、发送通知消息、生成报表或同步数据到其他系统。',
        },
        {
          No: 'BeforeFlowDel',
          Name: '流程删除前',
          Desc: '流程实例删除操作执行前触发。用于进行权限验证、判断当前状态是否允许删除、检查关联数据引用关系，必要时可抛出异常终止删除操作。',
        },
        {
          No: 'AfterFlowDel',
          Name: '流程删除后',
          Desc: '流程实例及相关数据已被删除后触发。用于清理残余业务数据、释放关联资源、记录审计日志或通知相关系统更新状态，确保数据一致性。',
        },
      ]);
    } //流程.

    //节点.
    if (refMainEnName === 'TS.WF.Template.NodeExt') {
      return [
        {
          No: 'SendWhen',
          Name: '当节点发送前',
          Desc: '任务从当前节点向下流转前触发。可验证处理人操作权限、检查表单数据合规性、自动填充字段或根据业务规则重定向下一步处理路径。',
        },
        {
          No: 'SendSuccess',
          Name: '节点发送成功时',
          Desc: '任务成功发送到下一节点后触发。适用于记录操作日志、更新任务状态、触发消息提醒或启动后续自动化任务，确保流转后业务连贯性。',
        },
        {
          No: 'SendError',
          Name: '节点发送失败时',
          Desc: '任务发送过程中出现异常或失败时触发。用于执行错误处理逻辑，如记录详细错误信息、通知管理员、自动重试或回滚已执行的操作。',
        },
        {
          No: 'ReturnBefore',
          Name: '当节点退回前',
          Desc: '任务即将被退回到上一节点前触发。可验证退回原因是否合规、检查退回后权限变化、自动保存进度或执行退回前的数据备份。',
        },
        {
          No: 'ReturnAfter',
          Name: '退回后',
          Desc: '任务成功退回到上一节点后触发。用于重置当前节点状态、通知原处理人重新处理、更新流程进度或同步业务系统状态回滚。',
        },
        {
          No: 'ReturnThisNode',
          Name: '退回到当前节点后',
          Desc: '任务从后续节点退回到本节点时触发。适用于恢复节点现场数据、重新分配处理人、发送待办提醒或执行特定的重回逻辑处理。',
        },
        {
          No: 'UndoneBefore',
          Name: '当节点撤销发送前',
          Desc: '对已发送任务执行撤销操作前触发。可校验撤销权限、判断业务状态是否允许撤销、检查数据依赖关系，必要时阻止撤销操作。',
        },
        {
          No: 'UndoneAfter',
          Name: '当节点撤销发送后',
          Desc: '任务撤销操作成功完成后触发。用于恢复任务至发送前状态、清除后续节点数据、撤销已触发的业务动作并记录撤销日志。',
        },
        {
          No: 'WhenReadWork',
          Name: '工作打开后',
          Desc: '用户打开任务表单开始处理时触发。可加载个性化数据、显示处理提示信息、记录查阅日志或根据处理人身份动态控制表单权限。',
        },
        {
          No: 'WorkArrive',
          Name: '工作到达',
          Desc: '任务成功到达当前节点并生成待办时触发。适用于自动分配处理人、设置任务时效、触发到达提醒或执行节点专属的初始化业务逻辑。',
        },
      ];
    }
    //从表
    if (refMainEnName === 'TS.Frm.MapDtlExt') {
      return [
        {
          No: 'DtlRowSaveBefore',
          Name: '从表保存前',
          Desc: '从表数据行保存到数据库前触发。用于验证行数据业务规则、计算字段值、补充缺失信息或根据主表状态校验从表数据合法性。',
        },
        {
          No: 'DtlRowSaveAfter',
          Name: '从表保存后',
          Desc: '从表数据行成功保存后触发。可更新关联数据统计、刷新缓存、记录操作痕迹或触发与主表数据相关的联动更新操作。',
        },
        {
          No: 'DtlRowDelBefore',
          Name: '从表删除前',
          Desc: '从表数据行删除操作执行前触发。用于检查数据引用关系、验证删除权限、执行级联删除预处理或备份重要数据以防误删。',
        },
        {
          No: 'DtlRowDelAfter',
          Name: '从表删除后',
          Desc: '从表数据行成功删除后触发。适用于更新主表汇总信息、清理残留关联数据、释放占用资源或记录删除审计日志。',
        },
      ];
    }
    //从表
    //单据.
    if (refMainEnName === 'TS.CCBill.FrmBill') {
      //是一个表单.
      return [
        {
          No: 'OverBefore',
          Name: '归档前',
          Desc: '单据即将完成业务处理并进行归档前触发。可执行最终数据校验、计算归档指标、生成归档编号或检查归档条件是否全部满足。',
        },
        {
          No: 'OverAfter',
          Name: '归档后',
          Desc: '单据成功归档后触发。适用于改变单据状态为只读、生成归档凭证、触发档案管理系统接口调用或通知相关业务方归档完成。',
        },
        {
          No: 'CheckStart',
          Name: '启动审核',
          Desc: '单据提交进入审核流程时触发。用于初始化审核流程参数、根据规则设置审核路径、发送审核通知或执行提交前的最终校验。',
        },
        {
          No: 'CheckOver',
          Name: '审核结束后',
          Desc: '单据完成全部审核流程时触发。可根据审核结果更新业务状态、生成正式编号、触发后续业务动作或通知申请人最终审核结论。',
        },
        {
          No: 'UnSend',
          Name: '撤销审核',
          Desc: '在审核过程中撤销审核请求时触发。用于重置审核状态、收回已发送的审核任务、通知已处理人撤销动作并恢复单据至可编辑状态。',
        },
        {
          No: 'Reback',
          Name: '回滚前',
          Desc: '单据数据即将回滚到之前版本时触发。可验证回滚权限、备份当前数据版本、检查回滚影响范围或执行回滚前的业务规则校验。',
        },
        {
          No: 'FrmLoadBefore',
          Name: '表单载入前',
          Desc: '表单界面渲染前触发。用于根据业务上下文动态设置表单属性、预加载参考数据、控制字段权限或初始化界面显示参数。',
        },
        {
          No: 'FrmLoadAfter',
          Name: '节点表单载入后',
          Desc: '表单完全加载并显示后触发。可自动计算字段值、显示提示信息、设置焦点控件或根据数据处理界面元素的显示状态。',
        },
        {
          No: 'SaveBefore',
          Name: '当表单保存前',
          Desc: '表单数据提交保存前触发。进行全表单级业务规则验证、数据格式转换、补充系统字段值或根据条件自动调整保存策略。',
        },
        {
          No: 'SaveAfter',
          Name: '当表单保存后',
          Desc: '表单数据成功保存后触发。用于更新业务状态、记录版本历史、清除临时数据或触发与保存相关的后续业务处理流程。',
        },
        {
          No: 'DeleteBefore',
          Name: '当表单删除前',
          Desc: '表单删除操作执行前触发。全面检查数据关联性、验证删除权限、执行业务删除前置条件判断，不满足条件时可阻止删除。',
        },
        {
          No: 'DeleteAfter',
          Name: '当表单删除后',
          Desc: '表单数据成功删除后触发。适用于清理关联的附件或评论、更新业务索引、释放相关资源并记录完整的删除操作日志。',
        },
      ];
    }

    //是一个表单.
    return [
      {
        No: 'FrmLoadBefore',
        Name: '表单载入前',
        Desc: '表单界面渲染前触发。用于根据业务上下文动态设置表单属性、预加载参考数据、控制字段权限或初始化界面显示参数。',
      },
      {
        No: 'FrmLoadAfter',
        Name: '节点表单载入后',
        Desc: '表单完全加载并显示后触发。可自动计算字段值、显示提示信息、设置焦点控件或根据数据处理界面元素的显示状态。',
      },
      {
        No: 'SaveBefore',
        Name: '当表单保存前',
        Desc: '表单数据提交保存前触发。进行全表单级业务规则验证、数据格式转换、补充系统字段值或根据条件自动调整保存策略。',
      },
      {
        No: 'SaveAfter',
        Name: '当表单保存后',
        Desc: '表单数据成功保存后触发。用于更新业务状态、记录版本历史、清除临时数据或触发与保存相关的后续业务处理流程。',
      },
      {
        No: 'DeleteBefore',
        Name: '当表单删除前',
        Desc: '表单删除操作执行前触发。全面检查数据关联性、验证删除权限、执行业务删除前置条件判断，不满足条件时可阻止删除。',
      },
      {
        No: 'DeleteAfter',
        Name: '当表单删除后',
        Desc: '表单数据成功删除后触发。适用于清理关联的附件或评论、更新业务索引、释放相关资源并记录完整的删除操作日志。',
      },
    ];
  }
}
