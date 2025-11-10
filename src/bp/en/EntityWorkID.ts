import { Entity } from '/@/bp/en/Entity';
import { Entities } from '/@/bp/en/Entities';

export abstract class EntityWorkID extends Entity {
  protected constructor(clsId: string, refEnName?: string) {
    super(clsId, refEnName);
  }

  override get PK() {
    return 'WorkID';
  }

  override get PKVal() {
    return this.WorkID;
  }

  get WorkID() {
    return this.GetValIntByKey('WorkID');
  }

  set WorkID(value: number) {
    this.SetValByKey('WorkID', value);
  }
}

export abstract class EntitiesWorkID extends Entities {}
