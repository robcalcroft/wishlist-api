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
            error: req.flash('error'),
            user_create_success: req.flash('user_create_success'),
            title: 'Log in to Wishlist',
            apiVersion: process.env.API_VERSION
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
        res.redirect('http://google.com');
    }
);

export default router;
