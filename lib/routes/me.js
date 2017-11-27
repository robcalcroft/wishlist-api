/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import md5 from 'md5';
import express from 'express';
import ClientUser from '../models/ClientUser';
import Client from '../models/Client';
import db from '../controllers/db';

const router = express.Router();

router.get(
  '/auth/me',
  (req, res) => {
    const authApps = new Promise((resolve, reject) => {
      const query = Client
        .select(
          Client.applicationName,
          ClientUser.dateCreated,
        )
        .from(
          Client,
          ClientUser,
        )
        .where(ClientUser.userId.equals(req.user.userId))
        .toQuery();
      db.all(
        query.text,
        query.values,
        (err, result) => {
          if (err) {
            reject(err);
          }

          return resolve(result);
        },
      );
    });

    authApps.then((result) => {
      res.render('me', {
        authorisedApps: result,
        md5,
        selectedLink: {},
        apiVersion: process.env.API_VERSION,
      });
    });

    authApps.catch((err) => {
      res.render('me', {
        authorisedAppsErr: 'Internal error - could not fetch authorised apps',
        debug: err,
        md5,
        selectedLink: {},
        apiVersion: process.env.API_VERSION,
      });
    });
  },
);

export default router;
