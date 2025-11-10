import { Entity } from '/@/bp/en/Entity';
import { Entities } from '/@/bp/en/Entities';

export abstract class EntityMyPK extends Entity {
  protected constructor(clsId: string, refEnName?: string) {
    super(clsId, refEnName);
  }

  override get PK() {
    return 'MyPK';
  }

  override get PKVal() {
    return this.MyPK;
  }

  get MyPK() {
    return this.GetValStringByKey('MyPK');
  }

  set MyPK(value: string) {
    this.SetValByKey('MyPK', value);
  }
}

export abstract class EntitiesMyPK extends Entities {}
