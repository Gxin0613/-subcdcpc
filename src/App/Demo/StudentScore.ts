import { UAC } from '/@/bp/en/Map/UAC';
import { Map } from '/@/bp/en/Map/Map';
import { EntitiesMyPK } from '/@/bp/en/EntityMyPK';
import { EntityNoName } from '/@/bp/en/EntityNoName';
import Events from '/@/utils/Events';

// 学生成绩表
export class StudentScore extends EntityNoName {
  constructor(pkval?: string) {
    super('TS.Demo.StudentScore');
    if (!!pkval) this.setPKVal(pkval);
  }

  /// 实体的权限控制
  public override get HisUAC() {
    const uac = new UAC();
    uac.IsDelete = true;
    uac.IsUpdate = true;
    uac.IsInsert = true;
    return uac;
  }

  public override get EnMap() {
    const map = new Map('Demo_StudentScore', '成绩表');
    map.AddTBStringPK('No', null, '编号', true, true, 1, 100, 60);
    map.AddTBString('StudentNo', null, '学生编号', false, false, 0, 200, 10);
    map.AddTBInt('PassingScore', 0, '及格分数', true, false);
    map.AddTBInt('ExcellentScore', 0, '优秀分数', true, false);
    map.AddTBInt('FullMarks', 0, '满分', true, false);
    map.AddTBInt('Score1', 0, '成绩', true, false);
    map.AddTBInt('Score2', 0, '成绩', true, false);
    map.AddTBInt('Score3', 0, '成绩', true, false);
    map.AddTBInt('Score4', 0, '成绩', true, false);
    map.AddTBInt('Idx', 0, '显示顺序', true, false);
    map.AddRules({
      Score1: [
        {
          validator(rule, value, callback, rowData) {
            if (value < rowData.PassingScore || value > rowData.FullMarks) {
              return Promise.reject(`成绩需要在${rowData.PassingScore} - ${rowData.FullMarks}之间`);
            }
            return Promise.resolve();
          },
        },
      ],
      Score2: [
        {
          validator(rule, value, callback, rowData) {
            if (value < rowData.PassingScore || value > rowData.FullMarks) {
              return Promise.reject(`成绩需要在${rowData.PassingScore} - ${rowData.FullMarks}之间`);
            }
            return Promise.resolve();
          },
        },
      ],
      Score3: [
        {
          validator(rule, value, callback, rowData) {
            if (value < rowData.PassingScore || value > rowData.FullMarks) {
              return Promise.reject(`成绩需要在${rowData.PassingScore} - ${rowData.FullMarks}之间`);
            }
            return Promise.resolve();
          },
        },
      ],
      Score4: [
        {
          validator(rule, value, callback, rowData) {
            if (value < rowData.PassingScore || value > rowData.FullMarks) {
              return Promise.reject(`成绩需要在${rowData.PassingScore} - ${rowData.FullMarks}之间`);
            }
            return Promise.resolve();
          },
        },
      ],
    });
    /**
      从表更新主表字段
      更新单个列
      Events.emit('update-en-row', {
        key: 'Count',
        val: val,
      });
     */
    const updateMainTable = (val, row, _mapAttrs, tableData: Recordable[] = []) => {
      // 如果要计算总计，使用 reduce 求和并确保类型为数字
      let tableScore = 0;
      if (Array.isArray(tableData)) {
        tableScore = tableData.reduce((sum, item) => {
          const itemCount = Number(item.Score1) + Number(item.Score2) + Number(item.Score3) + Number(item.Score4);
          return sum + itemCount;
        }, 0);
      }
      Events.emit('update-en-row', {
        key: 'Count',
        val: tableScore,
      });
    };
    map.enMapExts.AddFieldChangeListener('Score1', (val, row, attrs, tableData) => updateMainTable(val, row, attrs, tableData));
    map.enMapExts.AddFieldChangeListener('Score2', (val, row, attrs, tableData) => updateMainTable(val, row, attrs, tableData));
    map.enMapExts.AddFieldChangeListener('Score3', (val, row, attrs, tableData) => updateMainTable(val, row, attrs, tableData));
    map.enMapExts.AddFieldChangeListener('Score4', (val, row, attrs, tableData) => updateMainTable(val, row, attrs, tableData));

    map.AddRules({
      PassingScore: [
        {
          validator(rule, value) {
            if (value < 0 || value > 100) {
              return Promise.reject('及格分数需要在0 - 100之间');
            }
            return Promise.resolve();
          },
        },
      ],
    });
    this._enMap = map;
    return this._enMap;
  }
}
export class StudentScores extends EntitiesMyPK {
  get GetNewEntity(): StudentScore {
    return new StudentScore();
  }
  constructor() {
    super();
  }
}
