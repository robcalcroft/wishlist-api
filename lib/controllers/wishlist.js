/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

// Server setup
// ---------------------

var express = require("express"),
    app = express(),

    log = require("morgan"),
    session = require("express-session"),
    flash = require("connect-flash");

// Globals
$passport = require("passport");
$bp = require("body-parser");
$pg = require("pg");
$sql = require("sql");
$bcrypt = require("bcrypt");
$ensureLoggedIn = require("connect-ensure-login").ensureLoggedIn;
$config = require($appRoot + "/config.json");
$meta = require($appRoot + "/package.json");
$db = new $pg.Client($config.db); // Database init - see docs


// Database setup
$db.connect(function(err) {
	if(err) {
		throw new Error("Could not connect to database");
	}
});


// Express vars
app.set("port", $config.port || process.env.PORT || 8000);
app.set("version", $meta.version);
app.set("description", $meta.description);
app.set("author", $meta.author);


// View
app.set('view engine', 'jade');
app.set("views", $appRoot + "/lib/views");


// Flash messages
app.use(flash());


// Sessions
app.use(session({
    secret: "wishlist",
    resave: false,
    saveUninitialized: false
}));


// Passport setup
app.use($passport.initialize());
app.use($passport.session());


// Logging setup
app.use(log(":remote-addr - :method :url (:status) - :date"));


// JSON Parser
app.use($bp.json({ type: "application/json" }));


// URL Encoded / Form Data parser
app.use($bp.urlencoded({ extended: false }));


// Port config, server motd
app.listen(app.get("port"), function() {
	console.log(
		"\n** wishlist API **" +
		"\n------------------------------------------------------------------" +
		"\nAuthor:      " + app.get("author") +
		"\nDescription: " + app.get("description") +
		"\nVersion:     " + app.get("version") +
		"\nPort:        " + app.get("port") +
		"\n------------------------------------------------------------------\n"
	);
});

// Loading modules
// ---------------------

// Models
require($appRoot + "/lib/models")();

// Controllers
require($appRoot + "/lib/controllers")(app);

// Routes
require($appRoot + "/lib/routes")(app);
