import fs from 'fs';
import stackTrace from 'stack-trace';
import asyncEach from 'async-each';
import errTo from 'errto';
import niceErr from 'nice-error';

// eslint-disable-next-line no-unused-vars
function handleErrors(err, req, res, next) {
  const stack = stackTrace.parse(err);

  console.error(niceErr(err, true));

  asyncEach(
    stack,
    (item, cb) => {
      // exclude core node modules and node modules
      if (
        /\//.test(item.fileName)
        && !/node_modules/.test(item.fileName)
      ) {
        fs.readFile(
          item.fileName,
          'utf-8',
          errTo(cb, (content) => {
            let start = item.lineNumber - 5;
            if (start < 0) {
              start = 0;
            }
            const end = item.lineNumber + 4;
            const snippet = content
              .split('\n')
              .slice(start, end);
            // decorate the error line
            snippet[snippet.length - 5] = `<strong>${
              snippet[snippet.length - 5]
            }</strong>`;
            item.content = snippet.join('\n');

            cb(null, item);
          }),
        );
      } else {
        cb();
      }
    },
    (e, items) => {
      items = items.filter((item) => !!item);

      // if something bad happened while processing the stacktrace
      // make sure to return something useful
      if (e) {
        console.error(e);

        return res.send(err.stack);
      }

      let html = `<h1>${err.message}</h1><ul>`;

      items.forEach((item) => {
        html
          += `<li>at ${item.functionName}` || 'anonymous';
        html += ` (${item.fileName}:${item.lineNumber}:${item.columnNumber})`;
        html += `<p><pre><code>${item.content}</code></pre><p>`;
        html += '</li>';
      });

      html += '</ul>';

      res.send(html);
    },
  );
}

export default handleErrors;
