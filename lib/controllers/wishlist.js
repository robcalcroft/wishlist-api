/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import express from "express";
import log from "morgan";
import session from "express-session";
import passport from "passport";
import bp from "body-parser";
import flash from "connect-flash";
import path from "path";
import meta from "../../package.json";
import "controllers/db";
import "controllers/auth";
import "controllers/oauth2";
import routes from "routes";

let app = express();

// Express vars
app.set("port", process.env.PORT || 8000);
app.set("version", meta.version);
app.set("description", meta.description);
app.set("author", meta.author);

// View
app.set('view engine', 'jade');
app.set("views", `${path.resolve(".")}/lib/views`);


// Flash messages
app.use(flash());


// Sessions
app.use(session({
    secret: "wishlist",
    resave: false,
    saveUninitialized: false
}));


// Passport setup
app.use(passport.initialize());
app.use(passport.session());


// JSON Parser
app.use(bp.json({ type: "application/json" }));


// URL Encoded / Form Data parser
app.use(bp.urlencoded({ extended: false }));


// Routes
app.use("/", routes);


// Logging setup
app.use(log(":remote-addr - :method :url (:status) - :date"));


// Port config, server motd
app.listen(app.get("port"), function() {
	console.log(
        "> Ready\n" +
		"\n** wishlist API **" +
		"\n------------------------------------------------------------------" +
		"\nAuthor:      " + app.get("author") +
		"\nDescription: " + app.get("description") +
		"\nVersion:     " + app.get("version") +
		"\nPort:        " + app.get("port") +
		"\n------------------------------------------------------------------\n"
	);
});
