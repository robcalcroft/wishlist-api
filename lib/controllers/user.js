/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import db from './db';
import User from '../models/User';
import ClientUser from '../models/ClientUser';
import Client from '../models/Client';
import { response } from './utils';

function getSearchUsers(req, res) {
  if (!req.query.email_address && !req.query.username) {
    return response(res, {
      status: 400,
      message: 'Email address or username required to search',
    });
  }

  if (
    (req.query.email_address && req.query.email_address.length < 3) ||
        (req.query.username && req.query.username.length < 3)
  ) {
    return response(res, {
      status: 400,
      message: 'Email address or username required to search and must be over 3 characters',
    });
  }

  const nonAuthUserSelect = [
    User.userId,
    User.username,
    User.firstName,
    User.lastName,
    User.dateCreated,
  ];

  const authUserSelect = [
    User.userId,
    User.username,
    User.firstName,
    User.lastName,
    User.emailAddress,
    User.dateCreated,
  ];

  const userFieldsSelect = (
    req.query.username === req.user.username || req.query.emailAddress === req.user.emailAddress
  ) ? authUserSelect : nonAuthUserSelect;

  const userQuery = User
    .select(...userFieldsSelect)
    .where(req.query.email_address ? User.emailAddress.equals(req.query.email_address) : User.username.like(`%${req.query.username}%`))
    .toQuery();
  return db.all(
    userQuery.text,
    userQuery.values,
    (err, result) => {
      if (err) {
        return response(res, {
          status: 500,
          debug: err,
          message: 'Something went wrong, try again',
        });
      }

      if (!result.length) {
        return response(res, {
          status: 404,
          message: `No user found like ${req.query.email_address || req.query.username}`,
        });
      }

      return response(res, {
        status: 200,
        result,
        message: 'Success, user(s) found',
      });
    },
  );
}

function getAuthenticatedUser(req, res) {
  if (!req.user) {
    response(res, {
      status: 500,
      message: 'No user available, internal error',
    });
  }

  response(res, {
    status: 200,
    result: req.user,
    message: 'Success',
  });
}

function getAuthorisedApps(req, res) {
  if (!req.user) {
    response(res, {
      status: 500,
      message: 'No user available, internal error',
    });
  }

  const clientQuery = Client
    .select(
      Client.applicationName,
      ClientUser.dateCreated,
    )
    .from(
      ClientUser,
      Client,
    )
    .where(ClientUser.clientId.equals(Client.clientId))
    .and(ClientUser.userId.equals(req.user.userId))
    .toQuery();
  db.all(
    clientQuery.text,
    clientQuery.values,
    (err, result) => {
      if (err) {
        return response(res, {
          status: 500,
          debug: err,
          message: 'Internal error',
        });
      }

      return response(res, {
        result,
        status: 200,
      });
    },
  );
}

export {
  getSearchUsers,
  getAuthenticatedUser,
  getAuthorisedApps,
};
