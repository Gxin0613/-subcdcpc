import { StudentWG } from './SingleRecord/StudentWG';
import { Entity } from '/@/bp/en/Entity';
import { GPNReturnObj, GPNReturnType } from '/@/bp/UIEntity/PageBaseGroupNew';
import { WaiGuaBaseEntity } from '/@/bp/UIEntity/WaiGuaBaseEntity';
import { MapExts } from '/@/WF/Admin/FrmLogic/MapExt';
import Dev2Interface from '/@/WF/TSClass/Dev2Interface';

/**
 * 缴费单-外挂 文档: https://docs.qq.com/doc/DRFBXYWlQZHV5Ymtl
 * SearchBill.vue, MyBill.vue,
 * SearchEntityNoName.vue, MyEntityNoName.vue,
 * Search.vue,  En.vue
 */
export class WGEntity_StudentWG extends WaiGuaBaseEntity {
  constructor(baseEntityRef?: Entity) {
    super('WGEntity_StudentWG', 'TS.Demo.StudentWG');
    this.SearchToolbarBtns = 'WG批处理按钮,发起流程'; //查询工具栏上的按钮.

    //根据行的内容，显示不同的按钮.
    this.SearchOptBtns = (row) => {
      if (row.SG > 102) return '操作1';
      return '操作2';
    }; //列表的操作按钮.

    this.HisEntity = baseEntityRef;
    this.SearchOptBtnsWidth = 260;
    this.EntityToolbarBtns = 'Btn1'; //单个单据的按钮.
    this.CustomColumnsRender = [
      {
        key: 'SG',
        title: '乘车免票（动态列）',
        afterColumn: 'SG', //在身高之后显示.
        align: 'center',
        width: 200,
        render: (row: Recordable) => {
          return row.SG > 102 ? '不免票' : '免票';
        },
      },
    ]; //自定义列渲染.
    this.GetRowProps = (row: Recordable) => {
      const style: Record<string, string> = {};
      if (row.Age < 10) {
        style.backgroundColor = '#129dff';
        style.color = '#fff';
      } else if (row.Age >= 10 && row.Age < 20) {
        style.backgroundColor = '#5824bfff';
        style.color = '#fff';
      } else {
        style.backgroundColor = '#fff';
        style.color = '#000';
      }
      return {
        style,
      };
    };
  }

  public Init() {
    this.HisEntity = new StudentWG();
    this.HisMapExts = new MapExts();

    if (this.HisEntity.ClasID == 'TS.Demo.Steuce') {
    }

    if (this.HisEntity.ClasID == 'TS.Demo.Memer') {
    }

    this.CheckEleRole_RegularExpression('Tel', '身份证号', '^(^d{15}$)|(^d{18}$)|(^d{17}(d|X|x)$)');

    // map.enMapExts.SetFieldStyle('DanJia', {
    //   border: '1px solid red',
    //   backgroundColor: '#f2f5f7 !important',
    // } as StyleValue);

    // this.CheckEleRole_RegularExpression('Tel', '身份证号', '^(^d{15}$)|(^d{18}$)|(^d{17}(d|X|x)$)');
    // this.CheckEleRole_RegularExpression('Tel', '身份证号', '^(^d{15}$)|(^d{18}$)|(^d{17}(d|X|x)$)');

    // // this.MapAttrs.map.add('xxxx');
    // // this.CheckRole_NoteBlank('Addr','请填写地址');
    // //this.CheckRole_NoteBlank('Addr','请填写地址');
    // map.AddRules({
    //   Age: [
    //     {
    //       validator(_rule, value, callback) {
    //         if (value > 15 || value < 5) {
    //           callback('请正确输入年龄');
    //         } else {
    //           callback();
    //         }
    //       },
    //     },
    //   ],
    //   Addr: [
    //     {
    //       required: true,
    //       message: '请填写地址',
    //     },
    //   ],
    //   Tel: [
    //     {
    //       validator(_rule, value, callback) {
    //         callback(/^1[3-9]\d{9}$/.test(value) ? undefined : '请正确输入手机号');
    //       },
    //     },
    //   ],
    //   Email: [
    //     {
    //       validator(rule, value, callback) {
    //         const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    //         // 如果自定义校验，callback必须调用
    //         callback(emailRegex.test(value) ? undefined : '请正确输入邮件地址');
    //       },
    //     },
    //   ],
    // });
  }

  override FrmBodyTextBoxBlur(_attrKey: string, _Val: string): Promise<string | null> {
    return Promise.resolve(null);
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

    if (_btnLab === '操作1') {
      alert('操作1:' + JSON.stringify(_row));
      return;
    }
    if (_btnLab === '操作2') {
      alert('操作2:' + JSON.stringify(_row));
      return;
    }
    if (_btnLab === '操作3') {
      alert('操作3:' + JSON.stringify(_row));
      return;
    }
    if (_btnLab === 'WG批处理按钮') {
      alert('批处理按钮:' + _selectedRowIDs);
      //const token= WebUser.Token;
      return;
    }
    if (_btnLab === '发起流程') {
      alert('发起流程:' + _selectedRowIDs);
      //创建流程实例id  002流程编号
      const workId = await Dev2Interface.Node_CreateBlank('002');
      //组装流程发起页面，url中可以传参，用于新流程中表单字段内容的填充
      const obj = new GPNReturnObj(GPNReturnType.OpenIframeByDrawer75, '/#/WF/MyFlow?FlowNo=002&fileid1=**&fileid2=**&fileid3=**&WorkID=' + workId, '流程');
      return obj;
    }

    alert('没有判断的按钮标签,按钮标签:' + _btnLab + ',选择的ID:[' + _selectedRowIDs + '],Row:' + _row);
  }
}
