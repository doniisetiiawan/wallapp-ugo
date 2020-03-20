import errTo from 'errto';
import niceErr from 'nice-error';

export function index(req, res, next) {
  const opts = {};

  if (req.query.partial) {
    opts.older = req.query.older;
  }

  req.Post.getWith(
    opts,
    errTo(next, (posts) => {
      res.send({
        posts,
        user: req.user,
        successMsg: req.flash('success')[0],
        errorMsg: req.flash('error')[0],
      });
    }),
  );
}

export function create(req, res, next) {
  const post = new req.Post({
    content: req.body.content,
    author: req.user._id,
  });

  post.save((err) => {
    if (err) {
      if (err.name === 'ValidationError') {
        req.flash(
          'error',
          'Could not publish the post, please make sure it has a length of 2-255 chars',
        );
      } else {
        return next(err);
      }
    } else {
      req.flash(
        'success',
        'Successfully published the post',
      );
      const _post = {
        _id: post._id,
        content: post.content,
        createdAt: post.createdAt,
        author: {
          username: req.user.username,
          email: req.user.email,
        },
      };

      res.send(
        {
          posts: [_post],
        },
        (err, content) => {
          if (!err) {
            return req.broadcast(content);
          }
          console.error(niceErr(err, true));
        },
      );
    }

    res.redirect('/');
  });
}
