import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

@Injectable()
export class SocketStateService {
  private socketState = new Map<string, Socket[]>();

  public remove(userId: string, socket: Socket): boolean {
    const existingSockets = this.socketState.get(userId);
    if (!existingSockets) {
      return true;
    }

    const sockets = existingSockets.filter((s) => s.id !== socket.id);
    if (!sockets.length) {
      this.socketState.delete(userId);
    } else {
      this.socketState.set(userId, sockets);
    }
    return true;
  }

  public add(userId: string, socket: Socket): boolean {
    const existingSockets = this.socketState.get(userId) || [];
    let sockets = [...existingSockets, socket];
    // 过滤一下 防止重复
    sockets = Array.from(new Set(sockets));
    this.socketState.set(userId, sockets);
    return true;
  }

  public get(userId: string): Socket[] {
    return this.socketState.get(userId) || [];
  }

  // 获取所有已登录用户 注意需要两层循环
  public getAll(): Socket[] {
    const all = [];
    this.socketState.forEach((sockets) => {
      sockets.forEach((socket) => all.push(socket));
    });
    return all;
  }
}
