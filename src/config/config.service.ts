import defaultConfig, { AppConfigFunctionType } from './modules';

export class AppConfigService {
  #config: AppConfigFunctionType;

  constructor() {
    this.#config = defaultConfig;
  }

  get<K extends keyof AppConfigFunctionType>(
    k: K
  ): ReturnType<AppConfigFunctionType[K]> {
    const currentConfig = this.#config[k];
    return currentConfig() as ReturnType<AppConfigFunctionType[K]>;
  }
}
