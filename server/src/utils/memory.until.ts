class Memory {
  private memory: any = {};

  public get<T>(key: string): T {
    return this.memory[key];
  }

  public set<T>(key: string, value: T): void {
    this.memory[key] = value;
  }
}

export default new Memory();
