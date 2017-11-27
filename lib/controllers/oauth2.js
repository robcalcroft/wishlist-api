/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import oauth2orize from 'oauth2orize';
import passport from 'passport';
import md5 from 'md5';
import { ensureLoggedIn } from 'connect-ensure-login';
import AccessToken from '../models/AccessToken';
import Client from '../models/Client';
import AuthCode from '../models/AuthCode';
import ClientUser from '../models/ClientUser';
import RefreshToken from '../models/RefreshToken';
import { tokenOrSecret, uuid } from './utils';
import db from './db';

const server = oauth2orize.createServer();

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
  const query = Client
    .select()
    .where(Client.clientId.equals(id))
    .toQuery();
  db.all(
    query.text,
    query.values,
    (err, result) => {
      if (err) {
        return done(err);
      }

      if (!result.length) {
        return done(null, false);
      }

      return done(null, result[0]);
    },
  );
});


server.grant(oauth2orize.grant.code((client, redirectURI, user, ares, done) => {
  const code = uuid();

  // Insert the new auth code
  const query = AuthCode
    .insert({
      authCode: code,
      clientId: client.clientId,
      redirectURI,
      userId: user.userId,
    })
    .toQuery();
  db.all(
    query.text,
    query.values,
    (err) => {
      if (err) {
        return done(err);
      }

      return done(null, code);
    },
  );
}));


server.exchange(oauth2orize.exchange.code((client, code, redirectURI, done) => {
  // Grab the auth code details
  const query = AuthCode
    .select()
    .where(AuthCode.authCode.equals(code))
    .toQuery();
  db.all(
    query.text,
    query.values,
    (err, result) => {
      if (err) {
        return done(err);
      }

      // Run some checks to validate
      if (!result.length) {
        return done(null, false);
      }

      if (client.clientId !== result[0].clientId) {
        return done(null, false);
      }

      if (redirectURI !== result[0].redirectURI) {
        return done(null, false);
      }

      const authCode = result[0];

      // Delete the auth code
      const authCodeQuery = AuthCode
        .delete()
        .where(AuthCode.authCode.equals(code))
        .toQuery();
      return db.all(
        authCodeQuery.text,
        authCodeQuery.values,
        (authCodeError) => {
          if (authCodeError) {
            return done(authCodeError);
          }

          const accessToken = tokenOrSecret(300);
          const refreshToken = tokenOrSecret(300);


          const accessTokenPromise = new Promise((resolve, reject) => {
            const accessTokenQuery = AccessToken
              .insert({
                accessToken,
                clientId: authCode.clientId,
                userId: authCode.userId,
                created: Math.round(Date.now() / 1000),
              })
              .toQuery();
            db.all(
              accessTokenQuery.text,
              accessTokenQuery.values,
              (accessTokenError) => {
                if (accessTokenError) {
                  reject(accessTokenError);
                }
                resolve();
              },
            );
          });

          const refreshTokenPromise = new Promise((resolve, reject) => {
            const refreshTokenQuery = RefreshToken
              .insert({
                refreshToken,
                clientId: authCode.clientId,
                userId: authCode.userId,
                created: Math.round(Date.now() / 1000),
              })
              .toQuery();
            db.all(
              refreshTokenQuery.text,
              refreshTokenQuery.values,
              (refreshTokenError) => {
                if (refreshTokenError) {
                  reject(refreshTokenError);
                }
                resolve();
              },
            );
          });

          const clientUserPromise = new Promise((resolve, reject) => {
            const clientUserQuery = ClientUser
              .select(ClientUser.count())
              .where(ClientUser.clientId.equals(authCode.clientId))
              .and(ClientUser.userId.equals(authCode.userId))
              .toQuery();
            db.all(
              clientUserQuery.text,
              clientUserQuery.values,
              (clientUserError, clientUserResult) => {
                if (clientUserError) {
                  reject(clientUserError);
                }

                if (!clientUserResult.length) {
                  reject(true); // eslint-disable-line prefer-promise-reject-errors
                }

                if (clientUserResult[0].count !== 0) {
                  resolve();
                } else {
                  const clientUserQuery1 = ClientUser
                    .insert({
                      clientId: authCode.clientId,
                      userId: authCode.userId,
                    })
                    .toQuery();
                  db.all(
                    clientUserQuery1.text,
                    clientUserQuery1.values,
                    (clientUserInsertError) => {
                      if (clientUserInsertError) {
                        reject(clientUserInsertError);
                      }
                      resolve();
                    },
                  );
                }
              },
            );
          });

          return Promise.all([accessTokenPromise, refreshTokenPromise, clientUserPromise])
            .then(() => {
              done(null, accessToken, refreshToken, {
                expires_in: process.env.ACCESS_TOKEN_EXPIRY,
              });
            }, allError => done(allError));
        },
      );
    },
  );
}));


// Exchange refreshToken for an access token.
server.exchange(oauth2orize.exchange.refreshToken((client, refreshToken, scope, done) => {
  const refreshTokenQuery = RefreshToken
    .select()
    .where(RefreshToken.refreshToken.equals(refreshToken))
    .toQuery();
  db.all(
    refreshTokenQuery.text,
    refreshTokenQuery.values,
    (err, result) => {
      if (err) {
        return done(err);
      }

      if (!result.length) {
        return done(null, false);
      }

      const tokenData = result[0];

      // Remove any existing tokens
      const accessTokenQuery = AccessToken
        .delete()
        .where(AccessToken.userId.equals(result[0].userId))
        .toQuery();
      return db.all(
        accessTokenQuery.text,
        accessTokenQuery.error,
        (accessTokenError) => {
          if (accessTokenError) {
            return done(accessTokenError);
          }

          const token = tokenOrSecret(300);

          // Insert the access token
          const accessTokenQuery1 = AccessToken
            .insert({
              accessToken: token,
              clientId: tokenData.clientId,
              userId: tokenData.userId,
              created: Math.round(Date.now() / 1000),
            })
            .toQuery();
          return db.all(
            accessTokenQuery1.text,
            accessTokenQuery1.values,
            (accessTokenError1) => {
              if (accessTokenError1) {
                return done(accessTokenError1);
              }

              return done(null, token, {
                expires_in: process.env.ACCESS_TOKEN_EXPIRY,
              });
            },
          );
        },
      );
    },
  );
}));


/**
 * Authorizes the client
 * @param  {String} '/auth/authorize' The route
 * @param  {Function}
 * @param  {Function} Auth function
 */
const authorize = [
  ensureLoggedIn('/login'),
  server.authorization((clientId, redirectURI, done) => {
    const query = Client
      .select()
      .where(Client.clientId.equals(clientId))
      .toQuery();
    db.all(
      query.text,
      query.values,
      (err, result) => {
        if (err) {
          return done(err);
        }

        if (!result.length) {
          return done(null, false);
        }

        if (result[0].redirectURI !== redirectURI) {
          return done(null, false);
        }

        return done(null, result[0], redirectURI);
      },
    );
  }),
  (req, res) => {
    res.render('dialog', {
      transactionId: req.oauth2.transactionID,
      user: req.user,
      client: req.oauth2.client,
      md5,
      title: `${req.oauth2.client.applicationName} requests access`,
      apiVersion: process.env.API_VERSION,
      selectedLink: {},
    });
  },
];


/**
 * Makes decison on authentication of user
 */
const decison = [
  ensureLoggedIn('/login'),
  server.decision(),
];


/**
 * Handles exchange of authorization grants for
 * access tokens
 */
const token = [
  passport.authenticate('oauth2-client-password', { session: false }),
  server.token(),
  server.errorHandler(),
];

export {
  token,
  decison,
  authorize,
};
