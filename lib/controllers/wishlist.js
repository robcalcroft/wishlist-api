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
import pg from "pg";
import flash from "connect-flash";
import path from "path";
import meta from "../../package.json";

global.Wishlist = {};
Wishlist.appRoot = path.resolve(".");
Wishlist.config = require(`${Wishlist.appRoot}/config.json`);
Wishlist.app = express();

// Test config
if(process.env.WISHLIST_TEST) {
    Wishlist.config.db.database = "wishlist-test";
}

// Database setup
Wishlist.db = new pg.Client(Wishlist.config.db); // Database init - see docs
Wishlist.db.connect(function(err) {
	if(err) {
		throw new Error("Could not connect to database");
	}
});


// Express vars
Wishlist.app.set("port", process.env.PORT || 8000);
Wishlist.app.set("version", meta.version);
Wishlist.app.set("description", meta.description);
Wishlist.app.set("author", meta.author);
Wishlist.app.set("express", express);

// View
Wishlist.app.set('view engine', 'jade');
Wishlist.app.set("views", Wishlist.appRoot + "/lib/views");


// Flash messages
Wishlist.app.use(flash());


// Sessions
Wishlist.app.use(session({
    secret: "wishlist",
    resave: false,
    saveUninitialized: false
}));


// Passport setup
Wishlist.app.use(passport.initialize());
Wishlist.app.use(passport.session());


// Logging setup
Wishlist.app.use(log(":remote-addr - :method :url (:status) - :date"));


// JSON Parser
Wishlist.app.use(bp.json({ type: "application/json" }));


// URL Encoded / Form Data parser
Wishlist.app.use(bp.urlencoded({ extended: false }));


// Port config, server motd
Wishlist.app.listen(Wishlist.app.get("port"), function() {
	console.log(
        "> Ready\n" +
		"\n** wishlist API **" +
		"\n------------------------------------------------------------------" +
		"\nAuthor:      " + Wishlist.app.get("author") +
		"\nDescription: " + Wishlist.app.get("description") +
		"\nVersion:     " + Wishlist.app.get("version") +
		"\nPort:        " + Wishlist.app.get("port") +
		"\n------------------------------------------------------------------\n"
	);
});

// Loading modules
// ---------------------
//
// These are requires not imports as imports get hoisted
// to the top of the file and as such app wasn't a vars
// so needed to use require to ensure variable flow was correct

// Controllers
require("controllers/auth");
require("controllers/oauth2");

// Routes
require("routes/docs");
require("routes/login");
require("routes/oauth2");
require("routes/error");
