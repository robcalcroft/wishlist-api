/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import { response } from 'controllers/utils';
import express from 'express';
import ClientUser from 'models/ClientUser';
import Client from 'models/Client';
import db from 'controllers/db';
import md5 from 'md5';

let router = express.Router();

router.get(
    '/auth/me',
    (req, res) => {
        let authApps = new Promise((resolve, reject) => {
            db.query(
                Client
                    .select(
                        Client.applicationName,
                        ClientUser.dateCreated
                    )
                    .from(
                        Client,
                        ClientUser
                    )
                    .where(
                        ClientUser.userId.equals(req.user.userId)
                    )
                    .toQuery(),
                (err, result) => {
                    if(err) {
                        reject(err);
                    }

                    resolve(result.rows);
                }
            );
        });

        authApps.then((result) => {
            res.render('me', {
                authorisedApps: result,
                md5,
                selectedLink: {},
                apiVersion: process.env.API_VERSION
            });
        });

        authApps.catch((err) => {
            res.render('me', {
                authorisedAppsErr: 'Internal error - could not fetch authorised apps',
                debug: err,
                md5,
                selectedLink: {},
                apiVersion: process.env.API_VERSION
            });
        });
    }
);

export default router;
