/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import passport from 'passport';
import express from 'express';
import { ensureLoggedIn } from 'connect-ensure-login';

const router = express.Router();

router.get(
  '/login',
  (req, res) => {
    res.render('login', {
      error: req.flash('error'),
      user_create_success: req.flash('user_create_success'),
      title: 'Log in to Wishlist',
      apiVersion: process.env.API_VERSION,
      selectedLink: {
        login: 'active',
      },
    });
  },
);

router.post(
  '/login',
  passport.authenticate(
    'local',
    {
      failureRedirect: '/login',
      failureFlash: true,
    },
  ),
  (req, res) => {
    res.redirect(req.session.returnTo || '/profile'); // MAIN CLIENT LOGIN WILL BE HERE
  },
);

router.get(
  '/logout',
  ensureLoggedIn('/login'),
  (req, res) => {
    req.session.destroy();
    res.redirect('/login');
  },
);

export default router;
