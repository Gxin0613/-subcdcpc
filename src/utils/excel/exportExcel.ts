import { Attrs } from '/@/bp/en/Map/Attrs';
import { aoaToSheetXlsx } from '/@/components/Excel';

export function exportExcel(dataSource: Recordable[], attrs: Attrs, keyName: string, fileName = Math.random().toString().substring(2)) {
  const visibleAttrs = attrs
    .filter((attr) => {
      return attr.UIVisible || attr[keyName].endsWith('Text') || attr[keyName].endsWith('T');
    })
    .filter((attr) => {
      return !attr.IsDDL;
    });
  const data = dataSource.map((item) => {
    return visibleAttrs.map((attr) => {
      if (attr.IsDateField && item[attr[keyName]].length > 18) {
        return item[attr[keyName]].substring(0, 18);
      }
      if (attr.IsBoolean) {
        return item[attr[keyName]] == 1 ? '是' : '否';
      }
      return item[attr[keyName]];
    });
  });
  const header = visibleAttrs.map((attr) => {
    if (attr.Desc == '核查期数名称' || attr.Desc == '是否核查名称') {
      return attr.Desc.replace('名称', '');
    } else {
      return attr.Desc;
    }
  });
  aoaToSheetXlsx({
    data,
    header,
    filename: fileName + '.xlsx',
  });
}
