/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import express from 'express';
import postUserSignUp from '../controllers/sign-up';

const router = express.Router();

router.get(
  '/sign-up',
  (req, res) => {
    res.render('sign-up', {
      title: 'Sign Up to Wishlist',
      fieldPrefill: req.flash('fieldPrefill'),
      error: req.flash('error'),
      apiVersion: process.env.API_VERSION,
      selectedLink: {
        signup: 'active',
      },
    });
  },
);

router.post(
  '/sign-up',
  postUserSignUp,
);

export default router;
