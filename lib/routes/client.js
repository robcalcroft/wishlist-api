/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import passport from 'passport';
import express from 'express';
import { adminDomainCheck } from 'controllers/utils';
import {
    postClientCreate
} from 'controllers/client';

let router = express.Router();

router.post(
    '/client',
    // passport.authenticate('bearer', {
    //     session: false
    // }),
    postClientCreate
);

export default router;
