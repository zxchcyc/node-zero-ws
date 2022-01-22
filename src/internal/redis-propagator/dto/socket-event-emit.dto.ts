interface AnyObjcet {
  [propName: string]: any;
}

export class RedisSocketEventEmitDTO {
  // WS 事件名
  public readonly event: string;
  // WS 发送的数据
  public readonly data: AnyObjcet;
}
