import { Attr } from '/@/bp/en/Map/Attr';

// 字段查询
export class SearchNumAttr {
  public label = '';
  public placeholder = '';
  public startVal = '';
  public endVal = '';
  public uiWidth = 120;
  public searchKey = '';
  constructor() {}
}

// 字段查询集合
export class SearchNumAttrs extends Array<SearchNumAttr> {
  constructor() {
    super();
  }
  public Add(attr: Attr, width = 120, min = '', max = '') {
    const en = new SearchNumAttr();
    en.searchKey = attr.Key;
    en.label = attr.Desc;
    en.placeholder = attr.Desc;
    en.startVal = min;
    en.endVal = max;
    en.uiWidth = width; //宽度.
    this.push(en);
  }
}
