export interface Target {
  name: string;
  regexp?: RegExp;
  url: string;
}

class TargetManager {
  targets: Target[] = [];

  findByName(name: unknown) {
    if (name && typeof name === 'string') {
      name = name.toLowerCase();
      return this.targets.find(target => {
        return (target.name.toLowerCase() === name) || (target.regexp && target.regexp.test(name as string));
      });
    }
  }
}

export const targetManager = new TargetManager();
