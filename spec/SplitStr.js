/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
describe('SplitStr component', () => {
  let c = null;
  let ins = null;
  let delimiter = null;
  let out = null;

  before(function (done) {
    this.timeout(4000);
    const loader = new noflo.ComponentLoader(baseDir);
    return loader.load('strings/SplitStr', (err, instance) => {
      if (err) { return done(err); }
      c = instance;
      ins = noflo.internalSocket.createSocket();
      delimiter = noflo.internalSocket.createSocket();
      c.inPorts.in.attach(ins);
      c.inPorts.delimiter.attach(delimiter);
      return done();
    });
  });
  beforeEach(() => {
    out = noflo.internalSocket.createSocket();
    return c.outPorts.out.attach(out);
  });

  afterEach(() => {
    c.outPorts.out.detach(out);
    return out = null;
  });

  describe('when instantiated', () => {
    it('should have an input port', () => {
      chai.expect(c.inPorts.in).to.be.an('object');
      return chai.expect(c.inPorts.delimiter).to.be.an('object');
    });
    return it('should have an output port', () => chai.expect(c.outPorts.out).to.be.an('object'));
  });

  return describe('splitting a string', () => {
    it('test split with default delimiteriter', (done) => {
      const packets = ['abc', '123'];

      out.on('data', (data) => {
        chai.expect(packets.shift()).to.deep.equal(data);
        if (!packets.length) { return done(); }
      });

      ins.connect();
      ins.send('abc\n123');
      return ins.disconnect();
    });

    it('test split with string delimiteriter', (done) => {
      const packets = ['abc', '123'];

      out.on('data', (data) => {
        chai.expect(packets.shift()).to.deep.equal(data);
        if (!packets.length) { return done(); }
      });

      delimiter.send(',');

      ins.connect();
      ins.send('abc,123');
      return ins.disconnect();
    });

    return it('test split with RegExp delimiteriter', (done) => {
      const packets = ['abc', '123'];

      out.on('data', (data) => {
        chai.expect(packets.shift()).to.deep.equal(data);
        if (!packets.length) { return done(); }
      });

      delimiter.send('/[\n]*[-]{3}[\n]/');

      ins.connect();
      ins.send('abc\n---\n123');
      return ins.disconnect();
    });
  });
});
