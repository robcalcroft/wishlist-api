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
import User from 'models/User';
import AccessToken from 'models/AccessToken';
import Client from 'models/Client';
import db from 'controllers/db';
import { i18n } from 'controllers/utils';

// Passport setup
passport.initialize();
passport.session();

// User Serialize
passport.serializeUser((user, done) => done(null, user.userId));

// User Deserialize
passport.deserializeUser((id, done) => {
    db.query(
        User
            .select()
            .where(
                User.userId.equals(id)
            )
            .toQuery(),
        (err, result) => {
            if(err) {
                return done(err);
            }

            if(!result.rows.length) {
                return done(null, false);
            }

            done(null, result.rows[0]);
        }
    );
});

// Bearer Strategy
passport.use(new BearerStrategy((accessToken, done) => {
    db.query(
        AccessToken
            .select(
                AccessToken.userId
            )
            .where(
                AccessToken.accessToken.equals(accessToken)
            )
            .toQuery(),
        (err, result) => {
            if(err) {
                return done(err);
            }

            if(!result.rows.length) {
                return done(null, false);
            }

            if(((Math.round(Date.now() / 1000)) - process.env.ACCESS_TOKEN_EXPIRY) > result.rows[0].created) {
                return done(null, false, {
                    error: i18n('errors.tokenExpired')
                });
            }

            db.query(
                User
                    .select()
                    .where(
                        User.userId.equals(result.rows[0].userId)
                    )
                    .toQuery(),
                (err, result) => {
                    if(err) {
                        return done(err);
                    }

                    if(!result.rows.length) {
                        return done(null, false);
                    }

                    done(null, result.rows[0], {
                        scope: '*'
                    });
                }
            );
        }
    );
}));


// Client Password Strategy
passport.use(new ClientPasswordStrategy((clientId, clientSecret, done) => {
    db.query(
        Client
            .select()
            .where(
                Client.clientId.equals(clientId)
            )
            .toQuery(),
        (err, result) => {
            if(err) {
                return done(err);
            }

            if(!result.rows.length) {
                return done(null, false);
            }

            bcrypt.compare(clientSecret, result.rows[0].clientSecret, (err, response) => {
                if(response) {
                    done(null, result.rows[0]);
                } else {
                    done(null, false);
                }
            });
        }
    );
}));


// Local Strategy
passport.use(new LocalStrategy((username, password, done) => {
    db.query(
        User
            .select()
            .where(
                User.username.equals(username)
            )
            .toQuery(),
        (err, result) => {
            if(err) {
                return done(err);
            }

            if(!result.rows.length) {
                return done(null, false, {
                    message: i18n('errors.noUserFound')
                });
            }

            bcrypt.compare(password, result.rows[0].password, (err, response) => {
                if(response) {
                    done(null, result.rows[0]);
                } else {
                    done(null, false, {
                        message: i18n('errors.incorrectPassword')
                    });
                }
            });
        }
    );
}));
