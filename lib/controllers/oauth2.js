/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import oauth2orize from "oauth2orize";
import passport from "passport";
import { ensureLoggedIn } from "connect-ensure-login";
import AccessTokenM from "models/AccessToken";
import ClientM from "models/Client";
import AuthCodeM from "models/AuthCode";
import RefreshTokenM from "models/RefreshToken";
import { tokenOrSecret, uuid } from "controllers/utils";
import db from "controllers/db";

let server = oauth2orize.createServer();

/**
 * Serialize the client to obtain clientId
 * @param  {Object} client The client object
 * @param  {Function} done The callback
 */
server.serializeClient(function(client, done) {
    return done(null, client.clientId);
});


/**
 * Find the client from the id
 * @param  {Number} id The id of the client
 * @param  {Function} done The callback
 */
server.deserializeClient(function(id, done) {
    db.query(
        ClientM
            .select()
            .where(
                ClientM.clientId.equals(id)
            )
            .toQuery(),
        function(err, result) {
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


server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, done) {
    var code = uuid();

    // Insert the new auth code
    db.query(
        AuthCodeM
            .insert({
                authCode: code,
                clientId: client.clientId,
                redirectURI: redirectURI,
                userId: user.userId
            })
            .toQuery(),
        function(err, result) {
            if(err) {
                return done(err);
            }

            done(null, code);
        }
    );

}));


server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
    // Grab the auth code details
    db.query(
        AuthCodeM
            .select()
            .where(
                AuthCodeM.authCode.equals(code)
            )
            .toQuery(),
        function(err, result) {

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

            var authCode = result.rows[0];

            // Delete the auth code
            db.query(
                AuthCodeM
                    .delete()
                    .where(
                        AuthCodeM.authCode.equals(code)
                    )
                    .toQuery(),
                function(err, result) {
                    if(err) {
                        return done(err);
                    }

                    var accessToken = tokenOrSecret(300),
                        refreshToken = tokenOrSecret(300);

                    // Insert the access token
                    db.query(
                        AccessTokenM
                            .insert({
                                accessToken: accessToken,
                                clientId: authCode.clientId,
                                userId: authCode.userId,
                                created: Math.round(Date.now() / 1000)
                            })
                            .toQuery(),
                        function(err, result) {
                            if(err) {
                                return done(err);
                            }

                            db.query(
                                RefreshTokenM
                                    .insert({
                                        refreshToken: refreshToken,
                                        clientId: authCode.clientId,
                                        userId: authCode.userId,
                                        created: Math.round(Date.now() / 1000)
                                    })
                                    .toQuery(),
                                function(err, result) {
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
server.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done) {
    db.query(
        RefreshTokenM
            .select()
            .where(
                RefreshTokenM.refreshToken.equals(refreshToken)
            )
            .toQuery(),
        function(err, result) {
            if(err) {
                return done(err);
            }

            if(!result.rows.length) {
                return done(null, false);
            }

            var tokenData = result.rows[0];

            // Remove any existing tokens
            db.query(
                AccessTokenM
                    .delete()
                    .where(
                        AccessTokenM.userId.equals(result.rows[0].userId)
                    )
                    .toQuery(),
                function(err, result) {
                    if(err) {
                        return done(err);
                    }

                    var token = tokenOrSecret(300);

                    // Insert the access token
                    db.query(
                        AccessTokenM
                            .insert({
                                accessToken: token,
                                clientId: tokenData.clientId,
                                userId: tokenData.userId,
                                created: Math.round(Date.now() / 1000)
                            })
                            .toQuery(),
                        function(err, result) {
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
 * @param  {String} "/auth/authorize" The route
 * @param  {Function}
 * @param  {Function} Auth function
 */
let authorize = [
    ensureLoggedIn("/auth/login"),
    server.authorization(function(clientId, redirectURI, done) {
        db.query(
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

                if(result.rows[0].redirectURI !== redirectURI) {
                    return done(null, false);
                }

                done(null, result.rows[0], redirectURI);
            }
        );
    }),
    function(req, res) {
        res.render("dialog", {
            transactionId: req.oauth2.transactionID,
            user: req.user,
            client: req.oauth2.client
        });
    }
];


/**
 * Makes decison on authentication of user
 */
let decison = [
    ensureLoggedIn("/auth/login"),
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
