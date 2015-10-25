/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

module.exports = function(app) {

    // REMOVE
    app.get(
        "/me",
        $ensureLoggedIn("/auth/login"),
        function(req, res) {
            res.render("me", {
                user: req.user
            });
        }
    );

    app.get(
        "/protected",
        $passport.authenticate("bearer", {
            session: false
        }),
        function(req, res) {
            res.status(200).json({
                success: true
            });
        }
    );

    app.get(
        "/auth/login",
        function(req, res) {
            res.render("login", {
                message: req.flash("error"),
            });
        }
    );

    app.post(
        "/auth/login",
        $passport.authenticate("local",
        {
            failureRedirect: "/auth/login",
            failureFlash: true
        }),
        function(req, res) {
            res.redirect(req.session.returnTo || "/me"); // MAIN CLIENT LOGIN WILL BE HERE
        }
    );

    app.get(
        "/auth/logout",
        $ensureLoggedIn("/auth/login"),
        function(req, res) {
            req.session.destroy();
            res.render("logout");
        }
    );

};
