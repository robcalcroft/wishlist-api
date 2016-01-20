/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import { response } from 'controllers/utils';
import express from 'express';
import md5 from 'md5';

let router = express.Router();

router.get(
    '/auth/me',
    (req, res) => {
        res.render('me', {
            md5,
            selectedLink: {},
            apiVersion: process.env.API_VERSION
        });
    }
);

export default router;
