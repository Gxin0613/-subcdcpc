interface CacheObject {
  [propName: string]: any;
}

export class Cache {
  // map 缓存
  static mapCache: CacheObject = {};
  static GetMap(mapName: string) {
    return this.mapCache[mapName];
  }
  static SetMap(mapName: string, mapObj: any) {
    this.mapCache[mapName] = mapObj;
  }
}
