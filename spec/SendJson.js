describe('SendJson component', () => {
  let c = null;
  let ins = null;
  let json = null;
  let out = null;
  let error = null;
  before(function () {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('strings/SendJson')
      .then((instance) => {
        c = instance;
        ins = noflo.internalSocket.createSocket();
        c.inPorts.in.attach(ins);
        json = noflo.internalSocket.createSocket();
        c.inPorts.json.attach(json);
        return c.start();
      });
  });
  beforeEach(() => {
    out = noflo.internalSocket.createSocket();
    c.outPorts.out.attach(out);
    error = noflo.internalSocket.createSocket();
    c.outPorts.error.attach(error);
  });
  afterEach(() => {
    c.outPorts.out.detach(out);
    out = null;
    c.outPorts.error.detach(error);
    error = null;
  });

  describe('when receiving a bang and valid JSON', () => it('should send the parsed JSON out with banged brackets', (done) => {
    const expected = [
      '< a',
      'DATA [1,2,3]',
      '>',
    ];
    const received = [];

    error.on('data', done);
    out.on('begingroup', (group) => received.push(`< ${group}`));
    out.on('data', (data) => received.push(`DATA ${JSON.stringify(data)}`));
    out.on('endgroup', () => received.push('>'));
    out.on('disconnect', () => {
      chai.expect(received).to.eql(expected);
      done();
    });

    json.send('[1,2,3]');
    ins.connect();
    ins.beginGroup('a');
    ins.send(true);
    ins.endGroup();
    ins.disconnect();
  }));

  describe('when receiving a bang and invalid JSON', () => it('should send the error out with banged brackets', (done) => {
    const expected = [
      '< a',
      'DATA',
      '>',
    ];
    const received = [];

    out.on('ip', (ip) => done(new Error(`Received unexpected ${ip.type} ${ip.data}`)));
    error.on('begingroup', (group) => received.push(`< ${group}`));
    error.on('data', () => received.push('DATA'));
    error.on('endgroup', () => received.push('>'));
    error.on('disconnect', () => {
      chai.expect(received).to.eql(expected);
      done();
    });

    json.send('{1,2,3]');
    ins.connect();
    ins.beginGroup('a');
    ins.send(true);
    ins.endGroup();
    ins.disconnect();
  }));
});
