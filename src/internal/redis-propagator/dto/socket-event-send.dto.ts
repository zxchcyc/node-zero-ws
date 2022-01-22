import { RedisSocketEventEmitDTO } from "./socket-event-emit.dto";

export class RedisSocketEventSendDTO extends RedisSocketEventEmitDTO {
  // WS 指定发送给谁
  public readonly sendTo: string;
  // WS 发送人
  public readonly userId: string;
  // WS SID
  public readonly socketId: string;
}
