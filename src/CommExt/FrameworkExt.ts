import { Entity } from '../bp/en/Entity';
import { BaseEntityExt } from '../bp/UIEntity/BaseEntityExt';

export class FrameworkExt extends BaseEntityExt {
  constructor(refEntity: Entity) {
    super(refEntity);
    this.EnOption = {
      isFramework: true,
    };
  }
}
