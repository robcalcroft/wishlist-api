/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

// User Serialize
$passport.serializeUser(function(user, done) {
    return done(null, user.userId);
});

// User Deserialize
$passport.deserializeUser(function(id, done) {
    $db.query(
        $UserM
            .select()
            .where(
                $UserM.userId.equals(id)
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

// Bearer Strategy
var BearerStrategy = require("passport-http-bearer").Strategy;
$passport.use(new BearerStrategy(function(accessToken, done) {
    $db.query(
        $AccessTokenM
            .select(
                $AccessTokenM.userId
            )
            .where(
                $AccessTokenM.accessToken.equals(accessToken)
            )
            .toQuery(),
        function(err, result) {
            if(err) {
                return done(err);
            }

            if(!result.rows.length) {
                return done(null, false);
            }

            if(((Math.round(Date.now() / 1000)) - $config.tokenExpiry) > result.rows[0].created) {
                return done(null, false, {
                    error: "Token expired"
                });
            }

            $db.query(
                $UserM
                    .select()
                    .where(
                        $UserM.userId.equals(result.rows[0].userId)
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
var ClientPasswordStrategy = require("passport-oauth2-client-password").Strategy;
$passport.use(new ClientPasswordStrategy(function(clientId, clientSecret, done) {
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

            $bcrypt.compare(clientSecret, result.rows[0].clientSecret, function(err, response) {
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
var LocalStrategy = require("passport-local").Strategy;
$passport.use(new LocalStrategy(function(username, password, done) {
    $db.query(
        $UserM
            .select()
            .where(
                $UserM.username.equals(username)
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

            $bcrypt.compare(password, result.rows[0].password, function(err, response) {
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
