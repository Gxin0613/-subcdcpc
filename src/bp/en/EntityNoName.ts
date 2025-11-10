import { Entity } from '/@/bp/en/Entity';
import { Entities } from '/@/bp/en/Entities';

export class EntityNoNameAttr {
  // 编号
  public static readonly No = 'No';
  // 名称
  public static readonly Name = 'Name';
}
//实体
export abstract class EntityNoName extends Entity {
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
    return this.GetValStringByKey('No');
  }

  set No(value: any) {
    this.SetValByKey('No', value);
  }

  get Name() {
    return this.GetValStringByKey('Name');
  }

  set Name(value: any) {
    this.SetValByKey('Name', value);
  }
}
//实体集合
export abstract class EntitiesNoName extends Entities {}
