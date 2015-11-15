/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import passport from "passport";
import bcrypt from "bcrypt";
import { Strategy as BearerStrategy } from "passport-http-bearer";
import { Strategy as ClientPasswordStrategy } from "passport-oauth2-client-password";
import { Strategy as LocalStrategy } from "passport-local";
import UserM from "models/User";
import AccessTokenM from "models/AccessToken";
import ClientM from "models/Client";


// User Serialize
passport.serializeUser((user, done) => done(null, user.userId));

// User Deserialize
passport.deserializeUser((id, done) => {
    Wishlist.db.query(
        UserM
            .select()
            .where(
                UserM.userId.equals(id)
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
passport.use(new BearerStrategy(function(accessToken, done) {
    Wishlist.db.query(
        AccessTokenM
            .select(
                AccessTokenM.userId
            )
            .where(
                AccessTokenM.accessToken.equals(accessToken)
            )
            .toQuery(),
        function(err, result) {
            if(err) {
                return done(err);
            }

            if(!result.rows.length) {
                return done(null, false);
            }

            if(((Math.round(Date.now() / 1000)) - Wishlist.config.tokenExpiry) > result.rows[0].created) {
                return done(null, false, {
                    error: "Token expired"
                });
            }

            Wishlist.db.query(
                UserM
                    .select()
                    .where(
                        UserM.userId.equals(result.rows[0].userId)
                    )
                    .toQuery(),
                function(err, result) {
                    if(err) {
                        return done(err);
                    }

                    if(!result.rows.length) {
                        return done(null, false);
                    }

                    done(null, result.rows[0], {
                        scope: "*"
                    });
                }
            );
        }
    );
}));


// Client Password Strategy
passport.use(new ClientPasswordStrategy(function(clientId, clientSecret, done) {
    Wishlist.db.query(
        ClientM
            .select()
            .where(
                ClientM.clientId.equals(clientId)
            )
            .toQuery(),
        function(err, result) {
            if(err) {
                return done(err);
            }

            if(!result.rows.length) {
                return done(null, false);
            }

            bcrypt.compare(clientSecret, result.rows[0].clientSecret, function(err, response) {
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
passport.use(new LocalStrategy(function(username, password, done) {
    Wishlist.db.query(
        UserM
            .select()
            .where(
                UserM.username.equals(username)
            )
            .toQuery(),
        function(err, result) {
            if(err) {
                return done(err);
            }

            if(!result.rows.length) {
                return done(null, false, {
                    message: "No username found"
                });
            }

            bcrypt.compare(password, result.rows[0].password, function(err, response) {
                if(response) {
                    done(null, result.rows[0]);
                } else {
                    done(null, false, {
                        message: "Incorrect password"
                    });
                }
            });
        }
    );
}));
