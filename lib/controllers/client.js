/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import bcrypt from 'bcrypt';
import db from './db';
import Client from '../models/Client';
import { response, uuid, tokenOrSecret } from './utils';

function postClientCreate(req, res) {
  const missingFields = [];

  if (!req.body.application_name) {
    missingFields.push('application_name');
  }

  if (!req.body.application_uri) {
    missingFields.push('application_uri');
  }

  if (!req.body.redirect_uri) {
    missingFields.push('redirect_uri');
  }

  if (missingFields.length > 0) {
    return response(res, {
      status: 400,
      message: `Required fields ${missingFields.join(', ')} missing`,
    });
  }

  const clientId = uuid();
  const clientSecret = tokenOrSecret();

  const hashPassword = new Promise((resolve, reject) => {
    bcrypt.hash(clientSecret, 8, (err, hash) => {
      if (err) {
        reject(err);
      } else {
        resolve(hash);
      }
    });
  });

  hashPassword.then((hashedSecret) => {
    const query = Client
      .insert({
        applicationName: req.body.application_name,
        applicationURI: req.body.application_uri,
        redirectURI: req.body.redirect_uri,
        clientId,
        clientSecret: hashedSecret,
        userId: 1,
      })
      .toQuery();
    db.all(
      query.text,
      query.values,
      (err) => {
        if (err) {
          return response(res, {
            status: 500,
            message: 'Internal error',
            debug: err,
          });
        }

        return response(res, {
          status: 200,
          message: 'Client created successfully, ensure client Id and client password are treated as sensitive credentials',
          result: {
            clientId,
            clientSecret,
          },
        });
      },
    );
  });

  hashPassword.catch((err) => {
    response(res, {
      status: 500,
      message: 'Internal error',
      debug: err,
    });
  });

  return true;
}

function getClient(req, res) {
  if (!req.user && req.user.userId) {
    return response(res, {
      status: 500,
      message: 'Internal error - no user available',
    });
  }

  const query = Client
    .select(
      Client.applicationName,
      Client.applicationURI,
      Client.redirectURI,
      Client.clientId,
      Client.dateCreated,
    )
    .where(Client.userId.equals(req.user.userId))
    .toQuery();

  return db.all(
    query.text,
    query.values,
    (err, result) => {
      if (err) {
        return response(res, {
          status: 500,
          message: 'Internal error',
        });
      }

      if (!result.length) {
        return response(res, {
          status: 404,
          message: `No clients created under user id ${req.user.userId}`,
        });
      }

      return response(res, {
        status: 200,
        result,
        message: 'Success',
      });
    },
  );
}

export {
  postClientCreate,
  getClient,
};
