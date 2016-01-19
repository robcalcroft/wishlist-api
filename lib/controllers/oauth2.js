/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import oauth2orize from 'oauth2orize';
import passport from 'passport';
import md5 from 'md5';
import { ensureLoggedIn } from 'connect-ensure-login';
import AccessToken from 'models/AccessToken';
import Client from 'models/Client';
import AuthCode from 'models/AuthCode';
import RefreshToken from 'models/RefreshToken';
import { tokenOrSecret, uuid } from 'controllers/utils';
import db from 'controllers/db';

let server = oauth2orize.createServer();

/**
 * Serialize the client to obtain clientId
 * @param  {Object} client The client object
 * @param  {Function} done The callback
 */
server.serializeClient((client, done) => done(null, client.clientId));


/**
 * Find the client from the id
 * @param  {Number} id The id of the client
 * @param  {Function} done The callback
 */
server.deserializeClient((id, done) => {
    db.query(
        Client
            .select()
            .where(
                Client.clientId.equals(id)
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


server.grant(oauth2orize.grant.code((client, redirectURI, user, ares, done) => {
    let code = uuid();

    // Insert the new auth code
    db.query(
        AuthCode
            .insert({
                authCode: code,
                clientId: client.clientId,
                redirectURI: redirectURI,
                userId: user.userId
            })
            .toQuery(),
        (err, result) => {
            if(err) {
                return done(err);
            }

            done(null, code);
        }
    );

}));


server.exchange(oauth2orize.exchange.code((client, code, redirectURI, done) => {
    // Grab the auth code details
    db.query(
        AuthCode
            .select()
            .where(
                AuthCode.authCode.equals(code)
            )
            .toQuery(),
        (err, result) => {

            if(err) {
                return done(err);
            }

            // Run some checks to validate
            if(!result.rows.length) {
                return done(null, false);
            }

            if(client.clientId !== result.rows[0].clientId) {
                return done(null, false);
            }

            if(redirectURI !== result.rows[0].redirectURI) {
                return done(null, false);
            }

            let authCode = result.rows[0];

            // Delete the auth code
            db.query(
                AuthCode
                    .delete()
                    .where(
                        AuthCode.authCode.equals(code)
                    )
                    .toQuery(),
                (err, result) => {
                    if(err) {
                        return done(err);
                    }

                    let accessToken = tokenOrSecret(300),
                        refreshToken = tokenOrSecret(300);

                    // Insert the access token
                    db.query(
                        AccessToken
                            .insert({
                                accessToken: accessToken,
                                clientId: authCode.clientId,
                                userId: authCode.userId,
                                created: Math.round(Date.now() / 1000)
                            })
                            .toQuery(),
                        (err, result) => {
                            if(err) {
                                return done(err);
                            }

                            db.query(
                                RefreshToken
                                    .insert({
                                        refreshToken: refreshToken,
                                        clientId: authCode.clientId,
                                        userId: authCode.userId,
                                        created: Math.round(Date.now() / 1000)
                                    })
                                    .toQuery(),
                                (err, result) => {
                                    if(err) {
                                        return done(err);
                                    }

                                    done(null, accessToken, refreshToken, {
                                        expires_in: process.env.ACCESS_TOKEN_EXPIRY
                                    });
                                }
                            );
                        }
                    );
                }
            );
        }
    );
}));


// Exchange refreshToken for an access token.
server.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
    db.query(
        RefreshToken
            .select()
            .where(
                RefreshToken.refreshToken.equals(refreshToken)
            )
            .toQuery(),
        (err, result) => {
            if(err) {
                return done(err);
            }

            if(!result.rows.length) {
                return done(null, false);
            }

            let tokenData = result.rows[0];

            // Remove any existing tokens
            db.query(
                AccessToken
                    .delete()
                    .where(
                        AccessToken.userId.equals(result.rows[0].userId)
                    )
                    .toQuery(),
                (err, result) => {
                    if(err) {
                        return done(err);
                    }

                    let token = tokenOrSecret(300);

                    // Insert the access token
                    db.query(
                        AccessToken
                            .insert({
                                accessToken: token,
                                clientId: tokenData.clientId,
                                userId: tokenData.userId,
                                created: Math.round(Date.now() / 1000)
                            })
                            .toQuery(),
                        (err, result) => {
                            if(err) {
                                return done(err);
                            }

                            done(null, token, {
                                expires_in: process.env.ACCESS_TOKEN_EXPIRY
                            });
                        }
                    );
                }
            );
        }
    );
}));


/**
 * Authorizes the client
 * @param  {String} '/auth/authorize' The route
 * @param  {Function}
 * @param  {Function} Auth function
 */
let authorize = [
    ensureLoggedIn(`/api/${process.env.API_VERSION}/auth/login`),
    server.authorization((clientId, redirectURI, done) => {
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

                if(result.rows[0].redirectURI !== redirectURI) {
                    return done(null, false);
                }

                done(null, result.rows[0], redirectURI);
            }
        );
    }),
    (req, res) => {
        res.render('dialog', {
            transactionId: req.oauth2.transactionID,
            user: req.user,
            client: req.oauth2.client,
            md5,
            title: `${req.oauth2.client.applicationName} requests access`,
            apiVersion: process.env.API_VERSION
        });
    }
];


/**
 * Makes decison on authentication of user
 */
let decison = [
    ensureLoggedIn(`/api/${process.env.API_VERSION}/auth/login`),
    server.decision()
];


/**
 * Handles exchange of authorization grants for
 * access tokens
 */
let token = [
    passport.authenticate('oauth2-client-password', { session: false }),
    server.token(),
    server.errorHandler()
];

export {
    token,
    decison,
    authorize
};
