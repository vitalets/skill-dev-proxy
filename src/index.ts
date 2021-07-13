import { Target, targetManager } from './targets';
import { handler } from './handler';

export function getHandler(targets: Target[]) {
  targetManager.targets = targets;
  return handler;
}
