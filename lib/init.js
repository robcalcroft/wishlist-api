/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

var express = require("express"),
    app = express(),

    log = require("morgan");

// Globals
$passport = require("passport");
$pg = require("pg");
$sql = require("sql");
$bcrypt = require("bcrypt");
$config = require("../config.json");
$meta = require("../package.json");
$db = new $pg.Client($config.db); // Database init - see docs


// Server setup
// ---------------------

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

// Logging setup
app.use(log(":remote-addr - :method :url (:status) - :date"));

// JSON Parser
app.use(require("body-parser").json({ type: "application/json" }));

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
