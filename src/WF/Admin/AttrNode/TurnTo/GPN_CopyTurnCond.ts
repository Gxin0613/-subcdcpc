import { message } from 'ant-design-vue';
import { GPNReturnObj, GPNReturnType, PageBaseGroupNew } from '/@/bp/UIEntity/PageBaseGroupNew';
import { ClassFactory } from '/@/bp/da/ClassFactory';
import BSEntities from '/@/utils/gener/BSEntities';
import { Conds } from '../../Cond2020/Cond';
import { Directions } from '../../Cond2020/Direction';

export class GPN_CopyTurnCond extends PageBaseGroupNew {
  // 缓存的条件列表
  private condList: Conds = new Conds();
  // 缓存的连接线列表
  private dirList: Directions = new Directions();
  constructor() {
    super('GPN_CopyTurnCond');
    this.PageTitle = '复制转向条件';
  }
  public override async Init() {
    this.AddGroup('CopyTurnCode', '复制转向条件');
    const stcColumns = [
      { title: '#', key: 'No', width: 180 },
      { title: '方向', key: 'Direction', width: 100 },
      { title: '处理方式', key: 'JSFXText', width: 100 },
      { title: '类型', key: 'DataFromText', width: 100 },
      { title: '符号', key: 'FK_Operator', width: 100 },
      { title: '参数', key: 'Name', width: 300 },
    ];
    this.AddTableByOptions({
      no: 'SelectTurnCode',
      name: '选择方向条件',
      columns: stcColumns,
      helpDocs: '选择方向条件(多选)',
      IsMultiSelect: true,
      srcOfList: this.fetchTurnCond,
    });
    const stc_slColumns = [
      { title: '#', key: 'No', width: 100 },
      { title: '连接线方向', key: 'Name', width: 400 },
    ];
    this.AddTableByOptions({
      no: 'SelectTurnCode.SelectLines',
      name: '选择连接线',
      columns: stc_slColumns,
      helpDocs: '选择连接线(多选)',
      IsMultiSelect: true,
      srcOfList: this.fetchFlowLines,
    });
  }

  private async fetchTurnCond(): Promise<string> {
    const ens = (await ClassFactory.GetEns('TS.WF.Cond')) as Conds;
    await ens.Retrieve('RefPKVal', this.params.props.PKVal, 'Idx');
    if (ens.length === 0) return JSON.stringify([]);
    this.condList = ens;
    return JSON.stringify(
      ens.map((en) => {
        let JSFXText = en.JSFXText || '正向计算';
        if (en.Note === en.FK_Operator) {
          JSFXText = '';
        }
        const Name = en.Note === en.FK_Operator ? '' : en.Note;
        return {
          DataFromText: en.DataFromText,
          FK_Operator: en.FK_Operator,
          Name,
          Direction: `${en.FK_Node} -> ${en.ToNodeID}`,
          JSFXText: JSFXText,
          No: en.MyPK,
        };
      }),
    );
  }

  private async fetchFlowLines(): Promise<string> {
    const ens = await ClassFactory.GetEns('TS.WF.Direction');
    await ens.Retrieve('FK_Flow', this.params.props.FlowNo, 'Idx');
    const nodeEns = new BSEntities('BP.WF.Nodes');
    await nodeEns.Retrieve('FK_Flow', this.params.props.FlowNo);
    const nodeMap = new Map(nodeEns.getData().map((node) => [node.NodeID, node.Name]));
    for (const en of ens) {
      en.FromNodeName = nodeMap.get(en.Node) || '';
      en.ToNodeName = nodeMap.get(en.ToNode) || '';
    }
    if (ens.length === 0) return JSON.stringify([]);
    this.dirList = ens.filter((en) => en.MyPK != this.params.props.PKVal) as Directions;
    return JSON.stringify(this.dirList.map((en) => ({ Name: `${en.Node}(${en.FromNodeName}) -> ${en.ToNode} (${en.ToNodeName})`, No: en.MyPK })));
  }

  override GenerSorts(): Promise<any[]> {
    return Promise.resolve([]);
  }
  override async Save_TextBox_X(pageNo?: string | undefined, sortNo?: string | undefined, tb1?: string | undefined, tb2?: string | undefined, _tb3?: string | undefined) {
    if (pageNo === 'SelectTurnCode') {
      return;
    }
    if (pageNo === 'SelectTurnCode.SelectLines') {
      if (!tb1 || !tb2) {
        message.error('请选择转向条件和连接线');
        return;
      }
      if (window.confirm('此操作将会删除所选连接线的已有条件，确定要复制转向条件吗？') === false) return;

      // 删除现有
      const delList: Promise<any>[] = [];
      const targetDirIds = tb1.split(',') || [];
      for (const id of targetDirIds) {
        const ens = await ClassFactory.GetEns('TS.WF.Cond');
        delList.push(ens.Delete('RefPKVal', id));
      }
      await Promise.all(delList);
      // end
      const selectedCondIds = this.RequestVal('tb1', 'SelectTurnCode')?.split(',') || [];

      const targetDirList = this.dirList.filter((d) => targetDirIds.includes(d.MyPK));

      const targetCondList = this.condList.filter((c) => selectedCondIds.includes(c.MyPK));

      const sortedCondList = targetCondList.sort((a, b) => a.Sort - b.Sort);

      for (const dir of targetDirList) {
        for (let i = 0; i < sortedCondList.length; i++) {
          const cond = sortedCondList[i];
          cond.MyPK = '';
          cond.RefPKVal = dir.MyPK;
          cond.FK_Node = dir.Node;
          cond.ToNodeID = dir.ToNode;
          cond.ToNodeName = dir.ToNodeName;
          cond.Idx = (dir.Node + dir.ToNode) * 100 + i + 1;
          await cond.Insert();
        }
      }
      return new GPNReturnObj(GPNReturnType.Message, '应用条件到连接线成功');
    }
  }
}
