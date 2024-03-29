/**
 * Target manager (singleton).
 */

export interface Target {
  name: string;
  regexp?: RegExp;
  url: string;
}

type EnvTarget = Omit<Target, 'regexp'> & { regexp?: string };

class TargetManager {
  targets: Target[] = [];

  init(strTargets: string) {
    this.targets = this.parseTargets(strTargets);
  }

  getTarget(name: string) {
    const target = this.targets.find(target => target.name === name);
    if (!target) throw new Error(`Не найден таргет: ${name}`);
    return target;
  }

  matchTarget(userMessage: string) {
    return this.targets.find(target => {
      return userMessage.includes(target.name.toLowerCase())
        || (target.regexp && target.regexp.test(userMessage));
    });
  }

  private parseTargets(strTargets: string) {
    try {
      const items = JSON.parse(strTargets) as EnvTarget[];
      return items.map(({ name, regexp, url }) => {
        const regexpObj = regexp && new RegExp(regexp, 'i');
        return { name, url, regexp: regexpObj } as Target;
      });
    } catch (e) {
      e.message = `Can't parse targets: ${strTargets}. ${e.message}`;
      throw e;
    }
  }
}

export const targetManager = new TargetManager();
export const isLocalhostTarget = (target?: Target | null) => target?.url === 'websocket';
