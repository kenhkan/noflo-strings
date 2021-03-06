const noflo = require('noflo');
const _ = require('underscore');

exports.getComponent = function () {
  const c = new noflo.Component();
  c.description = 'Replace string packets using a dictionary';

  c.inPorts.add('in',
    { datatype: 'string' });
  c.inPorts.add('match', {
    datatype: 'object',
    description: 'Dictionary object with key matching the input object and value being the replacement item',
    control: true,
    required: true,
  });
  c.outPorts.add('out',
    { datatype: 'string' });

  return c.process((input, output) => {
    if (!input.has('in', 'match')) { return; }
    const match = input.getData('match');
    if (!match) { return; }
    if (!_.isObject(match)) { return; }

    let string = input.getData('in');
    if (!string) { return; }

    const matches = {};
    let matchKeys = [];
    Object.keys(match).forEach((fromMatch) => {
      const toMatch = match[fromMatch];
      matches[fromMatch.toString()] = toMatch.toString();
    });
    matchKeys = _.keys(matches);

    const matchKeyIndex = matchKeys.indexOf(string.toString());

    if (matchKeyIndex > -1) {
      string = matches[matchKeys[matchKeyIndex]];
    }

    output.sendDone({ out: string });
  });
};
