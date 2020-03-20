import Primus from 'primus';

export default function startPrimus(server, opts = {}) {
  const primus = new Primus(server, {
    transformer: opts.transformer || 'websockets',
    parser: opts.parser || 'json',
    pathname: opts.pathname || '/primus',
  });

  return function broadcast(msg) {
    primus.write(msg);
  };
}
