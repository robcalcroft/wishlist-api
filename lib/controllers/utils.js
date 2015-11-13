/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

module.exports = function() {

    // Create our hat
    var hat = require("hat"),
        token = require("rand-token"),
        rack = hat.rack();

    return {

        // Create a random token
        // Characters used conform to unreserved characters in section 2.3 of RFC3986
        // http://www.ietf.org/rfc/rfc3986.txt
        // TODO Use for client secret gen
        tokenOrSecret: function(len) {
            return token.generate(len || 75, "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~");
        },

        uuid: function() {
            return rack();
        },

        /**
         * Main response function; standardises all responses
         * from the API to the client / user.
         * @param res The express response object.
         * @param packet An object containing response data
         *
         * packet.status {Integer} Status code of the response (404)
         * packet.result {Object, Array} The dataset to send ([])
         * packet.resultName {String} An different "result" propery name for the response ("")
         * packet.cleanMessage {String} A nicely written error/info message (Default maps to lib/I18N/en.json)
         * packet.dirtyMessage {String} Could be the raw response from an error in PostgreSQL ("")
         * packet.debug {*} Debugging information, only shows when process.env.PROD !== true ("")
         */
        response: function(res, packet) {
            if(!res || !packet) {
                throw new Error("No response object or response data provided");
            }

            var responseData = {};

            responseData.statusCode = parseInt(packet.status);

            if(packet.result) {
                responseData[packet.resultName || "result"] = packet.result;
            }

            if(packet.message || responseData.statusCode) {
                responseData.message = (packet.message === undefined ? $utils.i18n("errors." + responseData.statusCode) : encodeURIComponent(packet.message));
            }

            if(packet.dirtyMessage) {
                responseData.dirtyMessage = encodeURIComponent(packet.dirtyMessage);
            }

            if(process.env.PROD !== true) {
                responseData.debug = packet.debug;
            }

            return res.status(responseData.statusCode).json(responseData);

        },

        i18n: function(code) {
            return require($appRoot + "/lib/I18N/" + ($config.region || "en") + ".json")[code] || false;
        }
    };

};
