/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import express from 'express';
import md5 from 'md5';
import { ensureLoggedIn } from 'connect-ensure-login';
import ClientUser from '../models/ClientUser';
import Client from '../models/Client';
import db from '../controllers/db';

const router = express.Router();

router.get(
  '/profile',
  ensureLoggedIn('/login'),
  (req, res) => {
    const authApps = new Promise((resolve, reject) => {
      db.all(
        Client
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
          .toQuery(),
        (err, result) => {
          if (err) {
            reject(err);
          }

          resolve(result);
        },
      );
    });

    authApps.then((result) => {
      res.render('profile', {
        authorisedApps: result,
        user: req.user,
        md5,
        selectedLink: {},
        apiVersion: process.env.API_VERSION,
      });
    });

    authApps.catch((err) => {
      res.render('profile', {
        authorisedAppsErr: 'Internal error - could not fetch authorised apps',
        user: req.user,
        debug: err,
        md5,
        selectedLink: {},
        apiVersion: process.env.API_VERSION,
      });
    });
  },
);

export default router;
