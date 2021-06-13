export interface Target {
  name: string;
  regexp?: RegExp;
  url: string;
}

class TargetManager {
  targets: Target[] = [];

  findInString(str: string) {
    str = (str || '').toLowerCase();
    return this.targets.find(target => {
      return str.includes(target.name.toLowerCase()) || (target.regexp && target.regexp.test(str));
    });
  }
}

export const targetManager = new TargetManager();
