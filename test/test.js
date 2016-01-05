import request from 'request';
import assert from 'assert';
import pg from 'pg';
import jshint from 'mocha-jshint';
import path from 'path';
import { tokenOrSecret, uuid, i18n } from 'controllers/utils';
import dotenv from 'dotenv';

dotenv.load();

// ***************************************
//    Code taken from lib/controllers/db
//         For testing purposes
// ***************************************

// Test config
if(process.env.WISHLIST_TEST) {
    process.env.DB_NAME = 'wishlist-test';
}

let db = new pg.Client({
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

// ***************************************

// JSHint
jshint({
    title: 'Wishlist JSHint'
});


// Unit testing
describe('Utilities testing', () => {

    describe('Token generation', () => {

        it('should generate a token', () => {
            assert(tokenOrSecret());
        });

        it('should generate a token of length 75 when no parameters are provided', () => {
            assert.equal(tokenOrSecret().length, 75);
        });

        it('should generate a token of a specified length when provided to the function', () => {
            assert.equal(tokenOrSecret(100).length, 100);
        });

        it('should generate a URL safe token', () => {
            var token = tokenOrSecret();
            assert.equal(encodeURIComponent(token), token);
        });

    });

    describe('UUID generation', () => {

        it('should generate a uuid', () => {
            assert(uuid());
        });

    });

    describe('I18N', () => {

        it('should map a string code to it\'s region based string', () => {
            let locCode = 'errors.404';
            assert.equal(i18n(locCode), require('../lib/I18N/en.json')['errors.404']);
        });

    });

});


// Main API Testing
describe('Wishlist API', () => {

    it('should connect to the database', (done) => {
        db.connect((err) => {
            assert(!err);
            done();
        });
    });

    // describe('Abuse Prevention', () => {
    //
    //     it('should throw a 429 error after too many request', () => {
    //
    //         request(
    //             {
    //                 url: ''
    //             }
    //         )
    //
    //     });
    //
    // });

    describe('OAuth2', () => {

        const client = {
            id: 'f6effb0a6eaf48daf2e9588d76733592',
            secret: 'Broqka1mzxtrwigGA-98hBk0v7ABsQozV.TvyrKtm3nOnpUCm0RMqj9pRf.ctC8X81ac5PLLbszIp4cD5Jeua066c2UfQq665kL6',
            redirect_uri: `http://localhost:${process.env.PORT}/callback`
        };

        const user = {
            username: 'jimbojones',
            password: 'j1mb0'
        };

        // Maintains state
        let cookieJar = request.jar();

        let authCode, refreshToken, accessToken;

        it('should redirect to the login screen when client opens /auth/authorize if the user isn\'t logged in', (done) => {
            request(`http://127.0.0.1:${process.env.PORT}/auth/authorize?client_id=${client.id}&redirect_uri=${client.redirect_uri}&response_type=code`, (err, res, body) => {
                assert.equal(res.client._httpMessage.path, '/auth/login');
                done();
            });
        });

        it('should present the user with the decision screen if they\'re logged in', (done) => {

            request(
                {
                    method: 'POST',
                    url: `http://127.0.0.1:${process.env.PORT}/auth/login`,
                    // This data is included in the SQL dummy data
                    form: {
                        'username': user.username,
                        'password': user.password
                    },
                    jar: cookieJar
                },
                (err, res, body) => {
                    if(body !== 'Found. Redirecting to /auth/login') {
                        request(
                            {
                                url: `http://127.0.0.1:${process.env.PORT}/auth/authorize?client_id=${client.id}&redirect_uri=${client.redirect_uri}&response_type=code`,
                                jar: cookieJar
                            },
                            (err, res, body) => {
                                assert.equal(res.client._httpMessage.path, `/auth/authorize?client_id=${client.id}&redirect_uri=${client.redirect_uri}&response_type=code`);
                                done();
                            }
                        );
                    } else {
                        assert.fail(body, 'Found. Redirecting to /auth/login', 'Expects not to redirect to /auth/login', '!=');
                    }
                }
            );

        });

        it('should call the callback with error=access_denied when user\'s decision is \'deny\'', (done) => {

            request(
                {
                    url: `http://127.0.0.1:${process.env.PORT}/auth/authorize?client_id=${client.id}&redirect_uri=${client.redirect_uri}&response_type=code`,
                    jar: cookieJar
                },
                (err, res, body) => {
                    const transId = body.match(/\w+(?="><input type="submit" value="Allow")/)[0];

                    request(
                        {
                            method: 'POST',
                            url: 'http://127.0.0.1:'+process.env.PORT+'/auth/decision',
                            jar: cookieJar,
                            form: {
                                'transaction_id': transId,
                                'cancel': 'Deny'
                            }
                        },
                        (err, res, body) => {
                            assert.equal(/error=access_denied/.test(body), true);
                            done();
                        }
                    );
                }
            );

        });

        it('should call the callback with the authorization code when the user\'s decsion is \'allow\'', (done) => {

            request(
                {
                    url: `http://127.0.0.1:${process.env.PORT}/auth/authorize?client_id=${client.id}&redirect_uri=${client.redirect_uri}&response_type=code`,
                    jar: cookieJar
                },
                (err, res, body) => {
                    const transId = body.match(/\w+(?="><input type="submit" value="Allow")/)[0];

                    request(
                        {
                            method: 'POST',
                            url: `http://127.0.0.1:${process.env.PORT}/auth/decision`,
                            jar: cookieJar,
                            form: {
                                'transaction_id': transId
                            }
                        },
                        (err, res, body) => {
                            assert.equal(/code=/.test(body), true);
                            authCode = body.match(/code=\w+/)[0].split('=')[1];
                            done();
                        }
                    );
                }
            );

        });

        it('should return a 401 status when no client id or secret is incorrect', (done) => {

            request(
                {
                    url: `http://127.0.0.1:${process.env.PORT}/auth/token`,
                    method: 'POST',
                    form: {
                        'client_id': 'wrong',
                        'client_secret': 'wrong'
                    }
                },
                (err, res, body) => {
                    assert.equal(res.statusCode, 401);
                    done();
                }
            );

        });

        it('should throw a grant_type error when incorrect grant type is specified', (done) => {

            request(
                {
                    url: `http://127.0.0.1:${process.env.PORT}/auth/token`,
                    method: 'POST',
                    form: {
                        'client_id': client.id,
                        'client_secret': client.secret,
                        'grant_type': 'wrong grant type',
                        'redirect_uri': client.redirect_uri,
                        'code': 'wrong code'
                    }
                },
                (err, res, body) => {
                    assert.equal(JSON.parse(body).error, 'unsupported_grant_type');
                    done();
                }
            );

        });

        it('should throw an error when the auth code is missing', (done) => {

            request(
                {
                    url: `http://127.0.0.1:${process.env.PORT}/auth/token`,
                    method: 'POST',
                    form: {
                        'client_id': client.id,
                        'client_secret': client.secret,
                        'grant_type': 'authorization_code',
                        'redirect_uri': client.redirect_uri
                    }
                },
                (err, res, body) => {
                    assert.equal(JSON.parse(body).error_description, 'Missing required parameter: code');
                    done();
                }
            );

        });

        it('should return a refresh token and an access token on success', (done) => {

            request(
                {
                    url: `http://127.0.0.1:${process.env.PORT}/auth/token`,
                    method: 'POST',
                    form: {
                        'client_id': client.id,
                        'client_secret': client.secret,
                        'grant_type': 'authorization_code',
                        'redirect_uri': client.redirect_uri,
                        'code': authCode
                    }
                },
                (err, res, body) => {
                    var result = JSON.parse(body);
                    assert(result.access_token);
                    assert(result.refresh_token);

                    refreshToken = result.refresh_token;
                    accessToken = result.access_token;

                    done();
                }
            );

        });

        it('should allow the access token to access protected resources', (done) => {

            request(
                {
                    url: `http://127.0.0.1:${process.env.PORT}/auth/protected`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                },
                (err, res, body) => {
                    assert.notEqual(res.statusCode, 401);
                    assert(JSON.parse(body).success);
                    done();
                }
            );

        });

        it('should allow the refresh token to request a new access token', (done) => {

            request(
                {
                    url: `http://127.0.0.1:${process.env.PORT}/auth/token`,
                    method: 'POST',
                    form: {
                        'client_id': client.id,
                        'client_secret': client.secret,
                        'grant_type': 'refresh_token',
                        'redirect_uri': client.redirect_uri,
                        'refresh_token': refreshToken
                    }
                },
                (err, res, body) => {
                    const result = JSON.parse(body);
                    assert(result.access_token);
                    assert.notEqual(accessToken, result.access_token);

                    done();
                }
            );

        });

    });

});

describe('Docs', () => {

    it('should present the user with the docs page', (done) => {

        request(`http://127.0.0.1:${process.env.PORT}/docs`, (err, res, body) => {
            assert.equal(res.statusCode, 200);
            done();
        });

    });

});
