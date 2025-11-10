import { MessageTypeEnum } from '/@/enums/messageTypeEnum';

declare namespace ccbpm {
  declare class UAC {
    IsInsert: boolean;
    IsUpdate: boolean;
    IsDelete: boolean;
    IsView: boolean;
    IsExp: boolean;
    IsImp: boolean;
    OpenAll: () => void;
    Readonly: () => void;
    OpenForAdmin: () => UAC;
    OpenForAppAdmin: () => UAC;
    OpenForSysAdmin: () => UAC;
  }
  declare class Map {}
  declare class Row {}
  declare abstract class Entity {
    protected constructor(clsId?: string, refEnName?: string);
    [x: string]: any;
    _tmpEnMap: Nullable<Map>;
    get _enMap();
    set _enMap(value: any): void;
    abstract get EnMap(): Map;
    _row: Nullable<Row>;
    get Row(): Row;
    set Row(value: Row): void;
    abstract get EnMap(): Map;
    abstract get PK(): string;
    abstract get PKVal(): any;
    abstract get HisUAC(): UAC;
    abstract get IsBlank(): boolean;
    setPKVal: (val: any) => void;
    mountProperty: () => void;
    collectProperty: () => void;
    GetValByKey: (attrKey: string) => any;
    SetValByKey: (key: string, val: unknown) => void;

    get atPara();
    SetPara: (key: string, obj: any) => void;
    GetParaString: (key: string, isNullAsVal: string) => string;
    GetParaInt: (key: string, isNullAsVal: number) => number;
    GetParaFloat: (key: string, isNullAsVal: number) => number;
    GetParaBoolean: (key: string, isNullAsVal: boolean) => boolean;

    Init: (updateMap?: boolean) => Promise<void>;
    UpdateMapCache: () => Promise<void>;
    RetrieveFromDBSources: () => Promise<number>;
    Retrieve: (...args: string[]) => Promise<void>;

    beforeInsert: () => Promise<number>;
    Insert: () => Promise<number>;
    afterInsert: () => Promise<number>;
    DirectInsert: () => Promise<number>;

    beforeUpdate: () => Promise<number>;
    Update: () => Promise<number>;
    afterUpdate: () => Promise<number>;
    DirectUpdate: () => Promise<number>;

    beforeDelete: () => Promise<number>;
    Delete: () => Promise<number>;
    afterDelete: () => Promise<number>;
    DirectDelete: () => Promise<number>;
  }
  declare abstract class EntityNoName extends Entity {}
  declare abstract class EntityMyPK extends Entity {}
  declare abstract class EntityOID extends Entity {}
  declare abstract class EntityNodeID extends Entity {}
  declare abstract class EntityTree extends Entity {}
  declare abstract class EntityWorkID extends Entity {}

  declare abstract class Entities extends Array<Entity> {
    protected constructor();
    readyState: number;
    abstract get GetNewEntity(): Entity;
    Init: (updateMap?: boolean) => Promise<void>;
    RetrieveAllFromDBSource: (orderBy: string) => Promise<number>;
    RetrieveAll: (orderBy: string) => Promise<number>;
    Retrieve: (orderBy: string) => Promise<number>;
    RetrieveLikeKey: (searchKey: string, attrScope: string, condAttr: string | null = '', condVal: any | null = '', orderBy: string | null = '') => Promise<number>;
    Delete: (...args: any[]) => Promise<void>;
  }

  declare abstract class EntitiesNoName extends Entities {
    protected constructor();
    override RetrieveAll: (orderBy: string) => Promise<number>;
  }
  declare abstract class EntitiesMyPK extends Entities {}
  declare abstract class EntitiesNodeID extends Entities {}
  declare abstract class EntitiesOID extends Entities {}
  declare abstract class EntitiesTree extends Entities {}
  declare abstract class EntitiesWorkID extends Entities {}

  // 定义post的消息类型
  declare interface PostMessageInfo {
    type: MessageTypeEnum;
    [x: string]: any;
  }
}
