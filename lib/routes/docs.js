/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import express from "express";
import path from "path";

let router = express.Router();

router.use("/docs", express.static(`${path.resolve(".")}/docs/html`));

export default router;
