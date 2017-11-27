/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import passport from 'passport';
import express from 'express';
import { postClientCreate, getClient } from '../controllers/client';

const router = express.Router();

router.post(
  '/client',
  passport.authenticate('bearer', {
    session: false,
  }),
  postClientCreate,
);

router.get(
  '/client',
  passport.authenticate('bearer', {
    session: false,
  }),
  getClient,
);

export default router;
