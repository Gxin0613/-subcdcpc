import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';

/**
 * 缴费单-外挂 文档: https://docs.qq.com/doc/DRFBXYWlQZHV5Ymtl
 * SearchBill.vue, MyBill.vue,
 * SearchEntityNoName.vue, MyEntityNoName.vue,
 * Search.vue,  En.vue
 */
export class WGEntity_Resume extends WaiGuaBaseEntity {
  override Init() {
    throw new Error('Method not implemented.');
  }
  constructor() {
    super('WGEntity_Resume', 'TS.Demo.Resume');
    this.SearchToolbarBtns = '批处理按钮'; //查询工具栏上的按钮.
    this.SearchOptBtns = '按钮1,按钮2'; //列表的操作按钮.
    this.EntityToolbarBtns = 'Btn1'; //单个单据的按钮.
    this.RowFunctions = [
      {
        label: '设为主专业',
        icon: 'icon-user',
        onClick: async (rowData, mainTableClassId, mainTableRow) => {
          // mainTableRow修改后需返回主表数据
          mainTableRow['ResumeNo'] = rowData.MyPK;
          return {
            mainTableRow,
          };
        },
      },
    ];
  }

  /**
   * 按钮事件
   * @param srcEvent 来源:如下三种 SearchToolbar,SearchOpt,EntityToolbar
   * @param btnLab 按钮标签
   * @param _selectedRowIDs 选择数据,如果是MyBill就是OID.
   * @param _row  选择的行数据,对 SearchOptBtns 有效.
   * @returns 执行结果
   */
  public override async BtnClick(_srcEvent: string, _btnLab: string, _selectedRowIDs = '', _row) {
    if (_srcEvent == 'SearchToolbar' && _btnLab === '按钮2') {
      alert('按钮2:' + _selectedRowIDs);
      return;
    }

    if (_btnLab === '批处理按钮') {
      alert('批处理按钮:' + _selectedRowIDs);
      //const token= WebUser.Token;
      return;
    }

    alert('没有判断的按钮标签,按钮标签:' + _btnLab + ',选择的ID:[' + _selectedRowIDs + '],Row:' + _row);
  }
}
