import niceErr from 'nice-error';

export default (err) => {
  err.timestamp = Date.now();
  console.error(niceErr(err, true));
  process.exit(1);
};
