/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import express from 'express';
import log from 'morgan';
import session from 'express-session';
import passport from 'passport';
import bp from 'body-parser';
import flash from 'connect-flash';
import path from 'path';
import limiter from 'rate-limiter';
import pg from 'pg';
import fs from 'fs';
import fsRotator from 'file-stream-rotator';
import chalk from 'chalk';
import pgSession from 'connect-pg-simple';
import meta from '../../package.json';
import cors from 'cors';
import 'controllers/db';
import 'controllers/auth';
import 'controllers/oauth2';
import errorHandler from 'controllers/abuseprevention';
import limitedRoutes from 'limitedroutes';
import routes from 'routes';
import errorRoutes from 'routes/error';
import docsRoutes from 'routes/docs';
import loginRoutes from 'routes/login';
import profileRoutes from 'routes/profile';
import signUpRoutes from 'routes/sign-up';

let app = express();

// Check env vars are present
if(
    process.env.DB_NAME === undefined ||
    process.env.DB_USERNAME === undefined ||
    process.env.DB_PASSWORD === undefined ||
    process.env.REGION === undefined ||
    process.env.ACCESS_TOKEN_EXPIRY === undefined ||
    process.env.SECRET === undefined
) {
    throw new Error('Required environment variable not present (DB_NAME, DB_USERNAME, DB_PASSWORD, REGION, ACCESS_TOKEN_EXPIRY, SECRET)');
}

// Express vars
app.set('port', process.env.PORT || 8000);
app.set('version', meta.version);
app.set('description', meta.description);
app.set('author', meta.author);

// View
app.set('view engine', 'jade');
app.set('views', `${path.resolve('.')}/lib/views`);


// Public folder
app.use('/public', express.static(`${path.resolve('.')}/public`));


// Flash messages
app.use(flash());


// Abuse prevention
app.use(limiter.expressMiddleware(limitedRoutes, errorHandler));


// Sessions
app.use(session({
    store: new (pgSession(session))({
        conString: {
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        }
    }),
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
}));


// Passport setup
app.use(passport.initialize());
app.use(passport.session());


// JSON Parser
app.use(bp.json({ type: 'application/json' }));


// URL Encoded / Form Data parser
app.use(bp.urlencoded({ extended: false }));


// Logging setup
const logDir = `${path.resolve('.')}/logs`;

if(!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

app.use(log(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {
    stream: fsRotator.getStream({
        filename: `${logDir}/access-%DATE%.log`,
        frequency: 'daily',
        verbose: false
    })
}));

// CORS default
app.use(cors());

// Route injection
app.use('/api/1/', routes);
app.use('/api/', docsRoutes);
app.use('/', loginRoutes, signUpRoutes, profileRoutes);
app.use('/', errorRoutes);


// Port config, server motd
app.listen(app.get('port'), () => {
    require('dns').lookup(require('os').hostname(), (err, addr, fam) => {
      console.log(
          chalk.cyan(`> Running at http://${addr}:${process.env.PORT || 8000}`)
      );
    });
});
