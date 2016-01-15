/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import passport from 'passport';
import express from 'express';
import { ensureLoggedIn } from 'connect-ensure-login';

let router = express.Router();

router.get(
    '/auth/login',
    (req, res) => {
        res.render('login', {
            message: req.flash('error'),
        });
    }
);

router.post(
    '/auth/login',
    passport.authenticate('local',
    {
        failureRedirect: `/api/${process.env.API_VERSION}/auth/login`,
        failureFlash: true
    }),
    (req, res) => {
        res.redirect(req.session.returnTo || 'http://google.com'); // MAIN CLIENT LOGIN WILL BE HERE
    }
);

router.get(
    '/auth/logout',
    ensureLoggedIn(`/api/${process.env.API_VERSION}/auth/login`),
    (req, res) => {
        req.session.destroy();
        res.render('logout');
    }
);

export default router;
