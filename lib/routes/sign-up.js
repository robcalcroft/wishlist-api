/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import passport from 'passport';
import express from 'express';
import {
    postUserSignUp
} from 'controllers/sign-up';

let router = express.Router();

router.get(
    '/auth/sign-up',
    (req, res) => {
        res.render('sign-up', {
            title: 'Sign Up to Wishlist',
            fieldPrefill: req.flash('fieldPrefill'),
            error: req.flash('error'),
            apiVersion: process.env.API_VERSION
        });
    }
);

router.post(
    '/auth/sign-up',
    postUserSignUp
);

export default router;
