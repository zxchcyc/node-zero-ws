import { Inject, Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { parse } from 'dotenv';
import { ENV_OPTIONS } from './constants';
import { EnvConfig, EnvOptions } from './interface';

@Injectable()
export class EnvService {
  private envConfig: EnvConfig;

  constructor(@Inject(ENV_OPTIONS) options: EnvOptions) {
    // if (process.env.NODE_ENV === 'dev') {
    // 配置文件路径
    const filePath = `.env.${
      process.env.NODE_ENV ? process.env.NODE_ENV : 'dev'
    }`;
    const envFile = resolve(__dirname, '../../', options.folder, filePath);
    this.envConfig = parse(readFileSync(envFile));
    // } else {
    // this.envConfig = process.env;
    // }
  }

  // 热加载
  set(config: any) {
    this.envConfig = config;
  }

  /**
   * 获取配置
   * @param key
   * @param byEnv 是否由 node 的环境变量中获取
   * @param defaultVal 默认值
   */
  get(key: string, byNodeEnv = false, defaultVal?: any): string {
    return (byNodeEnv ? process.env[key] : this.envConfig[key]) || defaultVal;
  }

  /**
   * 生产环境
   */
  isProd(): boolean {
    return process.env.NODE_ENV === 'prod';
  }
}
