import { Entity } from '/@/bp/en/Entity';
import { Entities } from '/@/bp/en/Entities';

export abstract class EntityNodeID extends Entity {
  protected constructor(clsId: string, refEnName?: string) {
    super(clsId, refEnName);
  }

  override get PK() {
    return 'NodeID';
  }

  override get PKVal() {
    return this.NodeID;
  }

  get NodeID() {
    return this.GetValIntByKey('NodeID');
  }

  set NodeID(value: number) {
    this.SetValByKey('NodeID', value);
  }
}

export abstract class EntitiesNodeID extends Entities {}
