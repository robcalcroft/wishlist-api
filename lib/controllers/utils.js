/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

module.exports = function(app) {

    // Create our hat
    var hat = require("hat"),
        token = require("rand-token");

    return {

        // Create a random token
        // Characters used conform to unreserved characters in section 2.3 of RFC3986
        // http://www.ietf.org/rfc/rfc3986.txt
        // TODO Use for client secret gen
        tokenOrSecret: function() {
            return token.generate(100, "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~");
        },

        uuid: function() {
            return hat.rack()();
        }
    };

};
