/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import passport from 'passport';
import bcrypt from 'bcrypt';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { Strategy as ClientPasswordStrategy } from 'passport-oauth2-client-password';
import { Strategy as LocalStrategy } from 'passport-local';
import User from '../models/User';
import AccessToken from '../models/AccessToken';
import Client from '../models/Client';
import db from './db';
import { i18n } from './utils';

// Passport setup
passport.initialize();
passport.session();

// User Serialize
passport.serializeUser((user, done) => done(null, user.userId));

// User Deserialize
passport.deserializeUser((id, done) => {
  const query = User
    .select()
    .where(User.userId.equals(id))
    .toQuery();
  db.all(
    query.text,
    query.values,
    (err, result) => {
      if (err) {
        return done(err);
      }

      if (!result.length) {
        return done(null, false);
      }

      return done(null, result[0]);
    },
  );
});

// Bearer Strategy
passport.use(new BearerStrategy((accessToken, done) => {
  const query = AccessToken
    .select(
      AccessToken.userId,
      AccessToken.created,
    )
    .where(AccessToken.accessToken.equals(accessToken))
    .toQuery();
  db.all(
    query.text,
    query.values,
    (err, result) => {
      if (err) {
        return done(err);
      }

      if (!result.length) {
        return done(null, false);
      }

      if (((Math.round(Date.now() / 1000)) - process.env.ACCESS_TOKEN_EXPIRY) > result[0].created) {
        return done(null, false, {
          error: i18n('errors.tokenExpired'),
        });
      }

      const userQuery = User
        .select(
          User.userId,
          User.firstName,
          User.lastName,
          User.emailAddress,
          User.username,
          User.dateCreated,
        )
        .where(User.userId.equals(result[0].userId))
        .toQuery();
      return db.all(
        userQuery.text,
        userQuery.values,
        (userError, userResults) => {
          if (userError) {
            return done(userError);
          }

          if (!userResults.length) {
            return done(null, false);
          }

          return done(null, userResults[0], {
            scope: '*',
          });
        },
      );
    },
  );
}));


// Client Password Strategy
passport.use(new ClientPasswordStrategy((clientId, clientSecret, done) => {
  const query = Client
    .select()
    .where(Client.clientId.equals(clientId))
    .toQuery();
  db.all(
    query.text,
    query.values,
    (err, result) => {
      if (err) {
        return done(err);
      }

      if (!result.length) {
        return done(null, false);
      }

      return bcrypt.compare(clientSecret, result[0].clientSecret, (passwordError, response) => {
        if (response) {
          done(null, result[0]);
        } else {
          done(null, false);
        }
      });
    },
  );
}));


// Local Strategy
passport.use(new LocalStrategy((username, password, done) => {
  const query = User
    .select()
    .where(User.username.equals(username))
    .toQuery();
  db.all(
    query.text,
    query.values,
    (err, result) => {
      if (err) {
        return done(err);
      }

      if (!result.length) {
        return done(null, false, {
          message: 'Username or password incorrect',
        });
      }

      return bcrypt.compare(password, result[0].password, (passwordError, response) => {
        if (response) {
          done(null, result[0]);
        } else {
          done(null, false, {
            message: 'Username or password incorrect',
          });
        }
      });
    },
  );
}));
