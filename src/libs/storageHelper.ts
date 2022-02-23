let dataMemory = {};

export default class MemoryStorage {
  setItem = (key: string, value: any) => {
    dataMemory[key] = value;
    return dataMemory[key];
  };

  getItem = (key: string): any => {
    return Object.prototype.hasOwnProperty.call(dataMemory, key)
      ? dataMemory[key]
      : undefined;
  };

  removeItem = (key: string): Object => {
    return delete dataMemory[key];
  };

  clear = (): {} => {
    dataMemory = {};
    return dataMemory;
  };
}
