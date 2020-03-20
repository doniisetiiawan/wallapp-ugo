import passport from 'passport';
import User from '../models/user';

// eslint-disable-next-line no-unused-vars
export function newx(req, res, next) {
  res.send('register');
}

export function create(req, res, next) {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
  });

  User.register(newUser, req.body.password, (err, user) => {
    console.log(user);
    let errMessage;

    if (err) {
      if (
        err.name === 'BadRequestError'
        || err.name === 'ValidationError'
        || err.name === 'MongoError'
      ) {
        if (
          err.name === 'MongoError'
          && err.code === 11000
        ) {
          errMessage = 'username/email already exists';
        } else if (err.name === 'ValidationError') {
          errMessage = `Validation failed for the following fields: ${Object.keys(
            err.errors,
          ).join(', ')}`;
        }

        return res.send({
          error: errMessage || err.message,
        });
      }
      return next(err);
    }

    // auto-login the newly created user
    passport.authenticate('local')(req, res, () => {
      res.redirect('/');
    });
  });
}

export function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }

  res.redirect('/login');
}
