/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import express from 'express';
import path from 'path';

const router = express.Router();

router.use('/docs', express.static(`${path.resolve('.')}/docs/apidoc`));

export default router;
