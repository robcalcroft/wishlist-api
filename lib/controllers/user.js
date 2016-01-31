/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import db from 'controllers/db';
import User from 'models/User';
import ClientUser from 'models/ClientUser';
import Client from 'models/Client';
import { response } from 'controllers/utils';

function getSearchUsers(req, res) {
    if(!req.query.email_address && !req.query.username) {
        return response(res, {
            status: 400,
            message: 'Email address or username required to search'
        });
    }

    if(
        (req.query.email_address && req.query.email_address.length < 3) ||
        (req.query.username && req.query.username.length < 3)
    ) {
        return response(res, {
            status: 400,
            message: 'Email address or username required to search and must be over 3 characters'
        });
    }

    db.query(
        User
            .select(
                User.userId,
                User.username,
                User.firstName,
                User.lastName
            )
            .where(
                req.query.email_address ? User.emailAddress.equals(req.query.email_address) : User.username.like(`%${req.query.username}%`)
            )
            .toQuery(),
        (err, result) => {
            if(err) {
                return response(res, {
                    status: 500,
                    debug: err,
                    message: 'Something went wrong, try again'
                });
            }

            if(!result.rows.length) {
                return response(res, {
                    status: 404,
                    message: `No user found like ${req.query.email_address || req.query.username}`
                });
            }

            response(res, {
                status: 200,
                result: result.rows,
                message: 'Success, user(s) found'
            });
        }
    );
}

function getAuthenticatedUser(req, res) {
    if(!req.user) {
        response(res, {
            status: 500,
            message: 'No user available, internal error'
        });
    }

    response(res, {
        status: 200,
        result: req.user,
        message: 'Success'
    });
}

function getAuthorisedApps(req, res) {
    if(!req.user) {
        response(res, {
            status: 500,
            message: 'No user available, internal error'
        });
    }

    db.query(
        Client
            .select(
                Client.applicationName,
                ClientUser.dateCreated
            )
            .from(
                ClientUser,
                Client
            )
            .where(
                ClientUser.clientId.equals(Client.clientId)
            )
            .and(
                ClientUser.userId.equals(req.user.userId)
            )
            .toQuery(),
        (err, result) => {
            if(err) {
                return response(res, {
                    status: 500,
                    debug: err,
                    message: 'Internal error'
                });
            }

            response(res, {
                result: result.rows,
                status: 200
            });
        }
    );
}

export {
    getSearchUsers,
    getAuthenticatedUser,
    getAuthorisedApps
};
