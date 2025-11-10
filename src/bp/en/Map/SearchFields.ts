import { Attr } from '/@/bp/en/Map/Attr';

// 字段查询
export class SearchField {
  public label = '';
  public placeholder = '';
  public value: string | number | undefined = '';
  public valueT = '';
  public uiWidth = 120;
  public searchKey = '';
  public mapExt = [];
  constructor() {}
}

// 字段查询集合
export class SearchFields extends Array<SearchField> {
  constructor() {
    super();
  }
  public Add(attr: Attr, placeholder = '', width = 120) {
    const en = new SearchField();
    en.searchKey = attr.Key;
    en.label = attr.Desc;
    en.placeholder = placeholder != '' ? placeholder : attr.Desc;
    en.value = '';
    en.uiWidth = width; //宽度.
    this.push(en);
  }
}
