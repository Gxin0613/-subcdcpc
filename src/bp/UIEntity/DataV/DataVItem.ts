// 明细
export class ItemDV {
  public Icon = 'icon-people';
  public Name = '我的方块';
  public Docs = '中间内容';
  public EndTextLeft = '左侧文字';
  public EndTextRight = '右侧文字';
}

// 方块集合
export class ItemDVs extends Array<ItemDV> {
  // 增加分组.
  public Add(Blockage: ItemDV) {
    this.push(Blockage);
  }
  public AddHtmlValDtl(icon: string, name: string, docs: string, endTextLeft: string, endTextRight: string) {
    const en = new ItemDV();
    en.Icon = icon;
    en.Name = name;
    en.Docs = docs;
    en.EndTextLeft = endTextLeft;
    en.EndTextRight = endTextRight;
    this.push(en);
  }
}
