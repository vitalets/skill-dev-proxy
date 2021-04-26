const targets = require('./targets');

exports.findTargetByName = targetName => {
  targetName = (targetName || '').toLowerCase();
  return targets.find(target => {
    return (target.name.toLowerCase() === targetName) || (target.match && target.match.test(targetName));
  });
};
