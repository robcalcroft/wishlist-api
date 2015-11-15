import request from "request";
import assert from "assert";
import pg from "pg";
import jshint from "mocha-jshint";
import path from "path";
import { tokenOrSecret, uuid, i18n } from "controllers/utils";

global.Wishlist = {};
Wishlist.appRoot = path.resolve(".");
Wishlist.config = require(`${Wishlist.appRoot}/config.json`);


// Database Wishlist.config
Wishlist.config.db.database = "wishlist-test";
let db = new pg.Client(Wishlist.config.db);

// JSHint
jshint({
    title: "Wishlist JSHint"
});


// Unit testing
describe("Utilities testing", function() {

    describe("Token generation", function() {

        it("should generate a token", function() {
            assert(tokenOrSecret());
        });

        it("should generate a token of length 75 when no parameters are provided", function() {
            assert.equal(tokenOrSecret().length, 75);
        });

        it("should generate a token of a specified length when provided to the function", function() {
            assert.equal(tokenOrSecret(100).length, 100);
        });

        it("should generate a URL safe token", () => {
            var token = tokenOrSecret();
            assert.equal(encodeURIComponent(token), token);
        });

    });

    describe("UUID generation", function() {

        it("should generate a uuid", function() {
            assert(uuid());
        });

    });

    describe("I18N", () => {

        it("should map a string code to it's region based string", () => {
            let locCode = "errors.404";
            assert.equal(i18n(locCode), require("../lib/I18N/en.json")["errors.404"]);
        });

    });

});


// Main API Testing
describe("Wishlist API", function() {

    it("should connect to the database", function(done) {
        db.connect(function(err) {
            assert(!err);
            done();
        });
    });

    describe("OAuth2", function() {

        var client = {
            id: "f6effb0a6eaf48daf2e9588d76733592",
            secret: "Broqka1mzxtrwigGA-98hBk0v7ABsQozV.TvyrKtm3nOnpUCm0RMqj9pRf.ctC8X81ac5PLLbszIp4cD5Jeua066c2UfQq665kL6",
            redirect_uri: "http://localhost:"+Wishlist.config.port+"/callback"
        };

        var user = {
            username: "jimbojones",
            password: "j1mb0"
        };

        // Maintains state
        var cookieJar = request.jar();

        var authCode, refreshToken, accessToken;

        it("should redirect to the login screen when client opens /auth/authorize if the user isn't logged in", function(done) {
            request("http://127.0.0.1:"+Wishlist.config.port+"/auth/authorize?client_id=" + client.id + "&redirect_uri=" + client.redirect_uri + "&response_type=code", function(err, res, body) {
                assert.equal(res.client._httpMessage.path, "/auth/login");
                done();
            });
        });

        it("should present the user with the decision screen if they're logged in", function(done) {

            request(
                {
                    method: "POST",
                    url: "http://127.0.0.1:"+Wishlist.config.port+"/auth/login",
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
                                url: "http://127.0.0.1:"+Wishlist.config.port+"/auth/authorize?client_id=" + client.id + "&redirect_uri=" + client.redirect_uri + "&response_type=code",
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
                    url: "http://127.0.0.1:"+Wishlist.config.port+"/auth/authorize?client_id=" + client.id + "&redirect_uri=" + client.redirect_uri + "&response_type=code",
                    jar: cookieJar
                },
                function(err, res, body) {
                    var transId = body.match(/\w+(?="><input type="submit" value="Allow")/)[0];

                    request(
                        {
                            method: "POST",
                            url: "http://127.0.0.1:"+Wishlist.config.port+"/auth/decision",
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
                    url: "http://127.0.0.1:"+Wishlist.config.port+"/auth/authorize?client_id=" + client.id + "&redirect_uri=" + client.redirect_uri + "&response_type=code",
                    jar: cookieJar
                },
                function(err, res, body) {
                    var transId = body.match(/\w+(?="><input type="submit" value="Allow")/)[0];

                    request(
                        {
                            method: "POST",
                            url: "http://127.0.0.1:"+Wishlist.config.port+"/auth/decision",
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
                    url: "http://127.0.0.1:"+Wishlist.config.port+"/auth/token",
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
                    url: "http://127.0.0.1:"+Wishlist.config.port+"/auth/token",
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
                    url: "http://127.0.0.1:"+Wishlist.config.port+"/auth/token",
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
                    url: "http://127.0.0.1:"+Wishlist.config.port+"/auth/token",
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

                    refreshToken = result.refresh_token;
                    accessToken = result.access_token;

                    done();
                }
            );

        });

        it("should allow the access token to access protected resources", function(done) {

            request(
                {
                    url: "http://127.0.0.1:"+Wishlist.config.port+"/auth/protected",
                    method: "GET",
                    headers: {
                        "Authorization": "Bearer " + accessToken
                    }
                },
                function(err, res, body) {
                    assert.notEqual(res.statusCode, 401);
                    assert(JSON.parse(body).success);
                    done();
                }
            );

        });

        it("should allow the refresh token to request a new access token", function(done) {

            request(
                {
                    url: "http://127.0.0.1:"+Wishlist.config.port+"/auth/token",
                    method: "POST",
                    form: {
                        "client_id": client.id,
                        "client_secret": client.secret,
                        "grant_type": "refresh_token",
                        "redirect_uri": client.redirect_uri,
                        "refresh_token": refreshToken
                    }
                },
                function(err, res, body) {
                    var result = JSON.parse(body);
                    assert(result.access_token);
                    assert.notEqual(accessToken, result.access_token);

                    done();
                }
            );

        });

    });

});
