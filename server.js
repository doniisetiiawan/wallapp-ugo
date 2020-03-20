import express from 'express';
import serveStatic from 'serve-static';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import session from 'cookie-session';
import passport from 'passport';
import flash from 'connect-flash';
import { Strategy as LocalStrategy } from 'passport-local';
import niceErr from 'nice-error';
import mongoose from 'mongoose';
import serverx from 'http';

import User from './models/user';
import Post from './models/post';
import handleErrors from './lib/errorHandler';
import die from './lib/die';
import Primus from './lib/primus';
import {
  index as postsindex,
  create as postscreate,
} from './routes/posts';
import {
  newx as sessionnewx,
  create as sessioncreate,
  destroy as sessiondestroy,
} from './routes/session';
import {
  newx as usersnewx,
  create as userscreate,
  ensureAuthenticated,
} from './routes/users';

const app = express();
const port = 3000;

const ENV = process.env.NODE_ENV || 'development';

app.use(serveStatic(`${__dirname}/public`));
if (ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(
  session({
    keys: ['a', 'b'],
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

const server = serverx.createServer(app);
const broadcast = Primus(server);

app.use((req, res, next) => {
  req.User = User;
  req.Post = Post;
  // function used to broadcast a msg to all connected peers
  req.broadcast = broadcast;

  next();
});

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', postsindex);
app.get('/login', sessionnewx);
app.post(
  '/login',
  passport.authenticate('local', {
    failureRedirect: '/login?unsuccessful=1',
  }),
  sessioncreate,
);
app.delete('/logout', sessiondestroy);
app.get('/register', usersnewx);
app.post('/register', userscreate);
app.post('/posts', ensureAuthenticated, postscreate);

if (ENV === 'development') {
  app.use(handleErrors);
} else if (ENV === 'production') {
  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => {
    err.timestamp = Date.now();
    console.error(niceErr(err, true));

    res.status(500).send('500 - Internal Server Error');
  });
}

mongoose.connect(
  'mongodb://localhost/wallapp-ugo',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
  (err) => {
    if (err) {
      err.message = `Failed to connect to MongoDB database \n${err.message}`;
      die(err);
    }
  },
);

process.on('uncaughtException', die);

server.listen(port, () => console.log(`Example app listening on port ${port}!`));
