/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import passport from "passport";
import express from "express";
import { ensureLoggedIn } from "connect-ensure-login";

let router = express.Router();

// REMOVE
router.get(
    "/me",
    ensureLoggedIn("/auth/login"),
    (req, res) => {
        res.render("me", {
            user: req.user
        });
    }
);

/**
 * @api {get} /auth/protected Bearer token testing
 * @apiDescription A route to allow clients to test their bearer tokens
 * @apiGroup Authentication
 *
 * @apiHeader {Token} Authorization Your access token
 *
 * @apiHeaderExample {json} Header - Example:
 *     { "Authorization": "Bearer <YOURTOKEN>" }
 *
 * @apiSuccessExample {json} Success - Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": "true"
 *     }
 *
 */
router.get(
    "/auth/protected",
    passport.authenticate("bearer", {
        session: false
    }),
    (req, res) => {
        res.status(200).json({
            success: true
        });
    }
);

router.get(
    "/auth/login",
    (req, res) => {
        res.render("login", {
            message: req.flash("error"),
        });
    }
);

router.post(
    "/auth/login",
    passport.authenticate("local",
    {
        failureRedirect: "/auth/login",
        failureFlash: true
    }),
    (req, res) => {
        res.redirect(req.session.returnTo || "/me"); // MAIN CLIENT LOGIN WILL BE HERE
    }
);

router.get(
    "/auth/logout",
    ensureLoggedIn("/auth/login"),
    (req, res) => {
        req.session.destroy();
        res.render("logout");
    }
);

export default router;
