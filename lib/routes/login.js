/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import passport from "passport";
import { ensureLoggedIn } from "connect-ensure-login";

// REMOVE
Wishlist.app.get(
    "/me",
    ensureLoggedIn("/auth/login"),
    function(req, res) {
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
Wishlist.app.get(
    "/auth/protected",
    passport.authenticate("bearer", {
        session: false
    }),
    function(req, res) {
        res.status(200).json({
            success: true
        });
    }
);

Wishlist.app.get(
    "/auth/login",
    function(req, res) {
        res.render("login", {
            message: req.flash("error"),
        });
    }
);

Wishlist.app.post(
    "/auth/login",
    passport.authenticate("local",
    {
        failureRedirect: "/auth/login",
        failureFlash: true
    }),
    function(req, res) {
        res.redirect(req.session.returnTo || "/me"); // MAIN CLIENT LOGIN WILL BE HERE
    }
);

Wishlist.app.get(
    "/auth/logout",
    ensureLoggedIn("/auth/login"),
    function(req, res) {
        req.session.destroy();
        res.render("logout");
    }
);
