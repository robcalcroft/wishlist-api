var request = require("request"),
    assert = require("assert"),
    pg = require("pg"),
    config = require("../config.json"),
    db;

// Database config
config.db.database = "wishlist-test";
db = new pg.Client(config.db);

// JSHint
require("mocha-jshint")({
    title: "Wishlist JSHint"
});

describe("Wishlist API", function() {

    it("should connect to the database", function(done) {
        db.connect(function(err) {
            assert(!err);
            done();
        });
    });

    describe("OAuth2", function() {

        var client = {
            id: "bcb5277f-e6af-4385-9aeb-6523a3bf40f8",
            secret: "Broqka1mzxtrwigGA-98hBk0v7ABsQozV.TvyrKtm3nOnpUCm0RMqj9pRf.ctC8X81ac5PLLbszIp4cD5Jeua066c2UfQq665kL6",
            redirect_uri: "http://localhost:"+config.port+"/callback"
        };

        var user = {
            username: "jimbojones",
            password: "j1mb0"
        };

        // Maintains state
        var cookieJar = request.jar();

        var authCode = null;

        it("should redirect to the login screen when client opens /auth/authorize if the user isn't logged in", function(done) {
            request("http://127.0.0.1:"+config.port+"/auth/authorize?client_id=" + client.id + "&redirect_uri=" + client.redirect_uri + "&response_type=code", function(err, res, body) {
                assert.equal(res.client._httpMessage.path, "/auth/login");
                done();
            });
        });

        it("should present the user with the decision screen if they're logged in", function(done) {

            request(
                {
                    method: "POST",
                    url: "http://127.0.0.1:"+config.port+"/auth/login",
                    // This data is included in the SQL dummy data
                    form: {
                        "username": user.username,
                        "password": user.password
                    },
                    jar: cookieJar
                },
                function(err, res, body) {
                    if(body !== "Found. Redirecting to /auth/login") {
                        request(
                            {
                                url: "http://127.0.0.1:"+config.port+"/auth/authorize?client_id=" + client.id + "&redirect_uri=" + client.redirect_uri + "&response_type=code",
                                jar: cookieJar
                            },
                            function(err, res, body) {
                                assert.equal(res.client._httpMessage.path, "/auth/authorize?client_id=" + client.id + "&redirect_uri=" + client.redirect_uri + "&response_type=code");
                                done();
                            }
                        );
                    } else {
                        assert.fail(body, "Found. Redirecting to /auth/login", "Expects not to redirect to /auth/login", "!=");
                    }
                }
            );

        });

        it("should call the callback with error=access_denied when user's decision is 'deny'", function(done) {

            request(
                {
                    url: "http://127.0.0.1:"+config.port+"/auth/authorize?client_id=" + client.id + "&redirect_uri=" + client.redirect_uri + "&response_type=code",
                    jar: cookieJar
                },
                function(err, res, body) {
                    var transId = body.match(/\w+(?="><input type="submit" value="Allow")/)[0];

                    request(
                        {
                            method: "POST",
                            url: "http://127.0.0.1:"+config.port+"/auth/decision",
                            jar: cookieJar,
                            form: {
                                "transaction_id": transId,
                                "cancel": "Deny"
                            }
                        },
                        function(err, res, body) {
                            assert.equal(/error=access_denied/.test(body), true);
                            done();
                        }
                    );
                }
            );

        });

        it("should call the callback with the authorization code when the user's decsion is 'allow'", function(done) {

            request(
                {
                    url: "http://127.0.0.1:"+config.port+"/auth/authorize?client_id=" + client.id + "&redirect_uri=" + client.redirect_uri + "&response_type=code",
                    jar: cookieJar
                },
                function(err, res, body) {
                    var transId = body.match(/\w+(?="><input type="submit" value="Allow")/)[0];

                    request(
                        {
                            method: "POST",
                            url: "http://127.0.0.1:"+config.port+"/auth/decision",
                            jar: cookieJar,
                            form: {
                                "transaction_id": transId
                            }
                        },
                        function(err, res, body) {
                            assert.equal(/code=/.test(body), true);
                            authCode = body.match(/code=\w+/)[0].split("=")[1];
                            done();
                        }
                    );
                }
            );

        });

        it("should return a 401 status when no client id or secret is incorrect", function(done) {

            request(
                {
                    url: "http://127.0.0.1:"+config.port+"/auth/token",
                    method: "POST",
                    form: {
                        "client_id": "wrong",
                        "client_secret": "wrong"
                    }
                },
                function(err, res, body) {
                    assert.equal(res.statusCode, 401);
                    done();
                }
            );

        });

        it("should throw a grant_type error when incorrect grant type is specified", function(done) {

            request(
                {
                    url: "http://127.0.0.1:"+config.port+"/auth/token",
                    method: "POST",
                    form: {
                        "client_id": client.id,
                        "client_secret": client.secret,
                        "grant_type": "wrong grant type",
                        "redirect_uri": client.redirect_uri,
                        "code": "wrong code"
                    }
                },
                function(err, res, body) {
                    assert.equal(JSON.parse(body).error, "unsupported_grant_type");
                    done();
                }
            );

        });

        it("should throw an error when the auth code is missing", function(done) {

            request(
                {
                    url: "http://127.0.0.1:"+config.port+"/auth/token",
                    method: "POST",
                    form: {
                        "client_id": client.id,
                        "client_secret": client.secret,
                        "grant_type": "authorization_code",
                        "redirect_uri": client.redirect_uri
                    }
                },
                function(err, res, body) {
                    assert.equal(JSON.parse(body).error_description, "Missing required parameter: code");
                    done();
                }
            );

        });

        it("should return a refresh token and an access token on success", function(done) {

            request(
                {
                    url: "http://127.0.0.1:"+config.port+"/auth/token",
                    method: "POST",
                    form: {
                        "client_id": client.id,
                        "client_secret": client.secret,
                        "grant_type": "authorization_code",
                        "redirect_uri": client.redirect_uri,
                        "code": authCode
                    }
                },
                function(err, res, body) {
                    var result = JSON.parse(body);
                    assert(result.access_token);
                    assert(result.refresh_token);
                    done();
                }
            );

        });

    });

});
