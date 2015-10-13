/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

module.exports = function(app) {

    var oauth2orize = require("oauth2orize"),
        server = oauth2orize.createServer();

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
        $db.query(
            $ClientM
                .select()
                .where(
                    $ClientM.clientId.equals(id)
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
        var code = $utils.uuid();

        // Insert the new auth code
        $db.query(
            $AuthCodeM
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
        $db.query(
            $AuthCodeM
                .select()
                .where(
                    $AuthCodeM.authCode.equals(code)
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
                $db.query(
                    $AuthCodeM
                        .delete()
                        .where(
                            $AuthCodeM.authCode.equals(code)
                        )
                        .toQuery(),
                    function(err, result) {
                        if(err) {
                            return done(err);
                        }

                        var token = $utils.tokenOrSecret(300),
                            expiry = Math.round((new Date().getTime()/1000)+3600);

                        // Insert the access token
                        $db.query(
                            $AccessTokenM
                                .insert({
                                    accessToken: token,
                                    clientId: authCode.clientId,
                                    userId: authCode.userId,
                                    // Expires in one hour
                                    expiry: expiry
                                })
                                .toQuery(),
                            function(err, result) {
                                if(err) {
                                    return done(err);
                                }

                                done(null, token, {
                                    expires: expiry
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
    module.exports.authorize = [
        $ensureLoggedIn("/auth/login"),
        server.authorization(function(clientId, redirectURI, done) {
            $db.query(
                $ClientM
                    .select()
                    .where(
                        $ClientM.clientId.equals(clientId)
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
    module.exports.decison = [
        $ensureLoggedIn("/auth/login"),
        server.decision()
    ];


    /**
     * Handles exchange of authorization grants for
     * access tokens
     */
    module.exports.token = [
        $passport.authenticate('oauth2-client-password', { session: false }),
        server.token(),
        server.errorHandler()
    ];
};
