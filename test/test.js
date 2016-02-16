import request from 'request';
import assert from 'assert';
import pg from 'pg';
import jshint from 'mocha-jshint';
import path from 'path';
import { tokenOrSecret, uuid, i18n } from 'controllers/utils';
import dotenv from 'dotenv';

dotenv.load();

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

    describe('Abuse Prevention', () => {

        it('should throw a 429 error after too many request', (done) => {

            let reqCount = 1;

            (function reqCall() {
                request({
                    url: `http://localhost:${process.env.PORT}/sign-up`,
                    method: 'POST'
                },
                (err, res) => {
                    if(err || !res) {
                        return assert.fail();
                    }
                    if(reqCount > 6) {
                        assert.equal(res.statusCode, 429);
                        return done();
                    }
                    reqCount++;
                    reqCall();
                });
            })();

        });

    });

    const client = {
        id: 'f6effb0a6eaf48daf2e9588d76733592',
        secret: 'Broqka1mzxtrwigGA-98hBk0v7ABsQozV.TvyrKtm3nOnpUCm0RMqj9pRf.ctC8X81ac5PLLbszIp4cD5Jeua066c2UfQq665kL6',
        redirect_uri: 'http://localhost:8001/callback'
    };

    const user = {
        username: 'jimbojones',
        password: 'j1mb0',
        userId: 1
    };

    // Maintains state
    let cookieJar = request.jar();

    let authCode, refreshToken, accessToken;

    describe('OAuth2', () => {

        it('should redirect to the login screen when client opens /api/1/auth/authorize if the user isn\'t logged in', (done) => {
            request(`http://127.0.0.1:${process.env.PORT}/api/1/auth/authorize?client_id=${client.id}&redirect_uri=${client.redirect_uri}&response_type=code`, (err, res, body) => {
                assert.equal(res.client._httpMessage.path, '/login');
                done();
            });
        });

        it('should present the user with the decision screen if they\'re logged in', (done) => {

            request(
                {
                    method: 'POST',
                    url: `http://127.0.0.1:${process.env.PORT}/login`,
                    // This data is included in the SQL dummy data
                    form: {
                        'username': user.username,
                        'password': user.password
                    },
                    jar: cookieJar
                },
                (err, res, body) => {
                    if(body !== 'Found. Redirecting to /login') {
                        request(
                            {
                                url: `http://127.0.0.1:${process.env.PORT}/api/1/auth/authorize?client_id=${client.id}&redirect_uri=${client.redirect_uri}&response_type=code`,
                                jar: cookieJar
                            },
                            (err, res, body) => {
                                assert.equal(res.client._httpMessage.path, `/api/1/auth/authorize?client_id=${client.id}&redirect_uri=${client.redirect_uri}&response_type=code`);
                                done();
                            }
                        );
                    } else {
                        assert.fail(body, 'Found. Redirecting to /api/1/auth/login', 'Expects not to redirect to /api/1/auth/login', '!=');
                    }
                }
            );

        });

        it('should call the callback with error=access_denied when user\'s decision is \'deny\'', (done) => {

            request(
                {
                    url: `http://127.0.0.1:${process.env.PORT}/api/1/auth/authorize?client_id=${client.id}&redirect_uri=${client.redirect_uri}&response_type=code`,
                    jar: cookieJar
                },
                (err, res, body) => {
                    const transId = body.match(/\w+(?="><div id="allow_submit")/)[0];

                    request(
                        {
                            method: 'POST',
                            url: `http://127.0.0.1:${process.env.PORT}/api/1/auth/decision`,
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
                    url: `http://127.0.0.1:${process.env.PORT}/api/1/auth/authorize?client_id=${client.id}&redirect_uri=${client.redirect_uri}&response_type=code`,
                    jar: cookieJar
                },
                (err, res, body) => {
                    const transId = body.match(/\w+(?="><div id="allow_submit")/)[0];

                    request(
                        {
                            method: 'POST',
                            url: `http://127.0.0.1:${process.env.PORT}/api/1/auth/decision`,
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
                    url: `http://127.0.0.1:${process.env.PORT}/api/1/auth/token`,
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
                    url: `http://127.0.0.1:${process.env.PORT}/api/1/auth/token`,
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
                    url: `http://127.0.0.1:${process.env.PORT}/api/1/auth/token`,
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
                    url: `http://127.0.0.1:${process.env.PORT}/api/1/auth/token`,
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
                    url: `http://127.0.0.1:${process.env.PORT}/api/1/auth/protected`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                },
                (err, res, body) => {
                    assert.notEqual(res.statusCode, 401);
                    done();
                }
            );

        });

        it('should allow the refresh token to request a new access token', (done) => {

            request(
                {
                    url: `http://127.0.0.1:${process.env.PORT}/api/1/auth/token`,
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

                    accessToken = result.access_token;

                    done();
                }
            );

        });

    });

    describe('REST API', () => {

        describe('Utilities', () => {

            it('should return data about a URI', function(done) {
                this.timeout(5000);
                request(
                    {
                        url: `http://127.0.0.1:${process.env.PORT}/api/1/uri-metadata`,
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        },
                        qs: {
                            uri: 'http://www.asos.com/ASOS/ASOS-2-Pack-Socks-With-Kelloggs-Design/Prod/pgeproduct.aspx?iid=5557972&CTARef=Recently%20Viewed'
                        }
                    },
                    (err, res, body) => {
                        assert(JSON.parse(body).result.title);
                        done();
                    }
                );
            });

        });

        describe('User', () => {

            it('should return user profile data', (done) => {
                request(
                    {
                        url: `http://127.0.0.1:${process.env.PORT}/api/1/user`,
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    },
                    (err, res, body) => {
                        assert.equal(JSON.parse(body).result.userId, 1);
                        done();
                    }
                );
            });

            it('should return a user when a search query is met', (done) => {
                request(
                    {
                        url: `http://127.0.0.1:${process.env.PORT}/api/1/user/search`,
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        },
                        qs: {
                            username: 'jimbo'
                        }
                    },
                    (err, res, body) => {
                        assert(JSON.parse(body).result[0].userId);
                        done();
                    }
                );
            });

            it('should return an error if the length of the query is less than 3 characters', (done) => {
                request(
                    {
                        url: `http://127.0.0.1:${process.env.PORT}/api/1/user/search`,
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        },
                        qs: {
                            username: 'ji'
                        }
                    },
                    (err, res, body) => {
                        assert.equal(res.statusCode, 400);
                        done();
                    }
                );
            });

        });

        describe('Wishlist', () => {

            it('should create a new wishlist', (done) => {
                request(
                    {
                        url: `http://127.0.0.1:${process.env.PORT}/api/1/wishlist`,
                        method: 'POST',
                        form: {
                            title: 'Test',
                            image_uri: 'http://images.google.com/test.png',
                            privacy: 'private'
                        },
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    },
                    (err, res, body) => {
                        assert.equal(res.statusCode, 200);
                        done();
                    }
                );
            });

            it('should return a list of wishlists based on a user_id search', (done) => {
                request(
                    {
                        url: `http://127.0.0.1:${process.env.PORT}/api/1/wishlist`,
                        method: 'GET',
                        qs: {
                            user_id: '1'
                        },
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    },
                    (err, res, body) => {
                        assert(JSON.parse(body).result[0]);
                        done();
                    }
                );
            });

            it('should return a list of wishlists based on a wishlist_id search', (done) => {
                request(
                    {
                        url: `http://127.0.0.1:${process.env.PORT}/api/1/wishlist`,
                        method: 'GET',
                        qs: {
                            wishlist_id: '1'
                        },
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    },
                    (err, res, body) => {
                        assert(JSON.parse(body).result[0]);
                        done();
                    }
                );
            });

            it('should create a wishlist entry in an existing wishlist', (done) => {
                request(
                    {
                        url: `http://127.0.0.1:${process.env.PORT}/api/1/wishlist/item`,
                        method: 'POST',
                        form: {
                            wishlist_id: 1,
                            title: 'Big Hat',
                            source_uri: 'http://hat.com',
                            source_name: 'BigHat',
                            description: 'A big hat just for you',
                            price: 12,
                            price_currency_symbol: '£',
                            user_priority: 4,
                            image_uri: 'http://google.com/image.png'
                        },
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        },
                    },
                    (err, res, body) => {
                        assert.equal(res.statusCode, 200);
                        done();
                    }
                );
            });

            it('should return a 400 status code if there is no wishlist_id', (done) => {
                request(
                    {
                        url: `http://127.0.0.1:${process.env.PORT}/api/1/wishlist/item`,
                        method: 'POST',
                        form: {
                            title: 'Big Hat',
                            source_uri: 'http://hat.com',
                            source_name: 'BigHat',
                            description: 'A big hat just for you',
                            price: 12,
                            price_currency_symbol: '£',
                            user_priority: 4,
                            image_uri: 'http://google.com/image.png'
                        },
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        },
                    },
                    (err, res, body) => {
                        assert.equal(res.statusCode, 400);
                        done();
                    }
                );
            });

            it('should return a 400 status code if there is no price_currency_symbol when price is specified', (done) => {
                request(
                    {
                        url: `http://127.0.0.1:${process.env.PORT}/api/1/wishlist/item`,
                        method: 'POST',
                        form: {
                            wishlist_id: 1,
                            title: 'Big Hat',
                            source_uri: 'http://hat.com',
                            source_name: 'BigHat',
                            description: 'A big hat just for you',
                            price: 12,
                            user_priority: 4,
                            image_uri: 'http://google.com/image.png'
                        },
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    },
                    (err, res, body) => {
                        assert.equal(res.statusCode, 400);
                        done();
                    }
                );
            });

            it('should return the entries of a wishlist', (done) => {
                request(
                    {
                        url: `http://127.0.0.1:${process.env.PORT}/api/1/wishlist/item`,
                        method: 'GET',
                        qs: {
                            wishlist_id: 1
                        },
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    },
                    (err, res, body) => {
                        assert(JSON.parse(body).result[0]);
                        done();
                    }
                );
            });

            it('should filter priorities from results of an entries search', (done) => {
                let priority = 1;
                request(
                    {
                        url: `http://127.0.0.1:${process.env.PORT}/api/1/wishlist/item`,
                        method: 'GET',
                        qs: {
                            wishlist_id: 1,
                            priority: `${priority}`
                        },
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    },
                    (err, res, body) => {
                        body = JSON.parse(body);

                        let len = body.result.length;

                        while(len--) {
                            if(body.result[len].userPriority !== priority) {
                                assert.fail();
                                return done();
                            }
                        }
                        assert(true);
                        done();

                    }
                );
            });

            it('should delete a specified wishlist item', (done) => {
                request(
                    {
                        url: `http://127.0.0.1:${process.env.PORT}/api/1/wishlist/item`,
                        method: 'DELETE',
                        qs: {
                            wishlist_item_id: 5
                        },
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    },
                    (err, res, body) => {
                        assert.equal(res.statusCode, 200);
                        done();
                    }
                );
            });

            it('should delete a specified wishlist', (done) => {
                request(
                    {
                        url: `http://127.0.0.1:${process.env.PORT}/api/1/wishlist`,
                        method: 'DELETE',
                        qs: {
                            wishlist_id: 1
                        },
                        headers: {
                            'Authorization': `Bearer ${accessToken}`
                        }
                    },
                    (err, res, body) => {
                        assert.equal(res.statusCode, 200);
                        done();
                    }
                );
            });

        });

    });

});

describe('Docs', () => {

    it('should present the user with the docs page', (done) => {
        request(`http://127.0.0.1:${process.env.PORT}/api/docs`, (err, res, body) => {
            assert.equal(res.statusCode, 200);
            done();
        });
    });

});
