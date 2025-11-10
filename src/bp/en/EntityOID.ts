import { Entity } from '/@/bp/en/Entity';
import { Entities } from '/@/bp/en/Entities';

export abstract class EntityOID extends Entity {
  protected constructor(clsId: string, refEnName?: string) {
    super(clsId, refEnName);
  }

  override get PK() {
    return 'OID';
  }

  override get PKVal() {
    return this.OID;
  }

  get OID() {
    return this.GetValIntByKey('OID');
  }

  set OID(value: number) {
    this.SetValByKey('OID', value);
  }
}

export abstract class EntitiesOID extends Entities {}
