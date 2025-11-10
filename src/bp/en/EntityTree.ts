import { Entity } from '/@/bp/en/Entity';
import { Entities } from '/@/bp/en/Entities';
import { assign } from 'lodash-es';

export class EntityTreeAttr {
  /// <summary>
  /// 编号
  /// </summary>
  public static readonly No = 'No';
  public static readonly Name = 'Name';
  public static readonly ParentNo = 'ParentNo';
  public static readonly Idx = 'Idx';
}
export abstract class EntityTree extends Entity {
  protected constructor(clsId: string, refEnName?: string) {
    super(clsId, refEnName);
  }

  override get PK() {
    return 'No';
  }

  override get PKVal() {
    return this.No;
  }

  get No() {
    return this.GetValStringByKey(EntityTreeAttr.No);
  }

  set No(value: any) {
    this.SetValByKey(EntityTreeAttr.No, value);
  }

  get Name() {
    return this.GetValStringByKey(EntityTreeAttr.Name);
  }

  set Name(value: any) {
    this.SetValByKey(EntityTreeAttr.Name, value);
  }

  get ParentNo() {
    return this.GetValStringByKey('ParentNo');
  }

  set ParentNo(value: string) {
    this.SetValByKey('ParentNo', value);
  }
}

/**
 * 树实体s
 */
export abstract class EntitiesTree extends Entities {
  //转成树结构可以识别的json.
  public ToTreeJson(rootNo: string) {
    function convert(pid: string, arr: any[]) {
      const children = arr.filter((item) => item.ParentNo === pid);
      if (children.length === 0) {
        return [];
      }
      // 剪枝
      const remainsArr: any[] = arr.filter((arrItem) => {
        return children.every((childItem) => {
          return childItem.No !== arrItem.No;
        });
      });
      children.map((child) => {
        return assign(child, { children: convert(child.No, remainsArr) });
      });
      return children;
    }
    try {
      const neededArr = this.slice(0, this.length).map((item) => Object.fromEntries(item.Row));
      return convert(rootNo, neededArr);
    } catch (e: any) {
      return [];
    }
  }
}
