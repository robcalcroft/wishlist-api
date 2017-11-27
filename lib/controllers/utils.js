/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import hat from 'hat';
import token from 'rand-token';
import path from 'path';
import request from 'request';

const rack = hat.rack();

// Create a random token
// Characters used conform to unreserved characters in section 2.3 of RFC3986
// http://www.ietf.org/rfc/rfc3986.txt
// TODO Use for client secret gen
function tokenOrSecret(len) {
  return token.generate(len || 75, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~');
}

function uuid() {
  return rack();
}

function i18n(code) {
  return require(`${path.resolve('.')}/lib/I18N/${process.env.REGION}.json`)[code] || false; // eslint-disable-line
}

/**
 * Main response function; standardises all responses
 * from the API to the client / user.
 * @param res The express response object.
 * @param packet An object containing response data
 *
 * packet.status {Integer} Status code of the response (404)
 * packet.result {Object, Array} The dataset to send ([])
 * packet.resultName {String} An different 'result' propery name for the response ('')
 * packet.message {String} A nicely written error/info message (Default maps to lib/I18N/en.json)
 * packet.dirtyMessage {String} Could be the raw response from an error in PostgreSQL ('')
 * packet.debug {*} Debugging information, only shows when process.env.PROD !== true ('')
 */
function response(res, packet) {
  if (!res || !packet) {
    throw new Error('No response object or response data provided');
  }

  // Headers
  res.set(packet.headers);

  const responseData = {};

  responseData.statusCode = parseInt(packet.status, 10);

  if (packet.result) {
    responseData[packet.resultName || 'result'] = packet.result;
  }

  if (packet.message || responseData.statusCode) {
    responseData.message = (packet.message === undefined ? i18n(`errors.${responseData.statusCode}`) : packet.message);
  }

  if (packet.dirtyMessage) {
    responseData.dirtyMessage = packet.dirtyMessage;
  }

  if (process.env.PROD !== true) {
    responseData.debug = packet.debug;
  }

  return res.status(responseData.statusCode).json(responseData);
}

function uriMetadata(req, res) {
  if (!req.query.uri) {
    return response(res, {
      status: 400,
      message: 'Missing field URI',
    });
  }

  return request(
    {
      uri: 'http://api.embed.ly/1/extract',
      method: 'GET',
      qs: {
        url: req.query.uri,
        key: process.env.EMBEDLY_KEY,
      },
    },
    (err, resp, body) => {
      if (err) {
        return response(res, {
          debug: err,
          status: resp.statusCode,
          message: 'Error',
        });
      }

      body = JSON.parse(body); // eslint-disable-line no-param-reassign

      if (body.error_code === 400) {
        return response(res, {
          debug: err,
          status: 404,
          message: 'No results found for URI',
        });
      }

      return response(res, {
        status: 200,
        result: {
          title: body.title,
          image: body.images,
          description: body.description,
          uri: body.url,
          provider_name: body.provider_name,
        },
        message: 'Success',
      });
    },
  );
}

export {
  tokenOrSecret,
  response,
  uuid,
  i18n,
  uriMetadata,
};
