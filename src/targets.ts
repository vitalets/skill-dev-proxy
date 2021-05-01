export interface Target {
  name: string;
  regexp?: RegExp;
  url: string;
}

class TargetManager {
  targets: Target[] = [];

  findByName(name: string) {
    name = (name || '').toLowerCase();
    return this.targets.find(target => {
      return (target.name.toLowerCase() === name) || (target.regexp && target.regexp.test(name));
    });
  }
}

export const targetManager = new TargetManager();
