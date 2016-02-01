/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

 import db from 'controllers/db';
 import Client from 'models/Client';
 import bcrypt from 'bcrypt';
 import {
     response,
     uuid,
     tokenOrSecret
} from 'controllers/utils';

 function postClientCreate(req, res) {
     let missingFields = [];
     let clientId, clientSecret;

     if(!req.body.application_name) {
         missingFields.push('application_name');
     }

     if(!req.body.application_uri) {
         missingFields.push('application_uri');
     }

     if(!req.body.redirect_uri) {
         missingFields.push('redirect_uri');
     }

     if(missingFields.length > 0) {
         return response(res, {
            status: 400,
            message: `Required fields ${missingFields.join(', ')} missing`
         });
     }

     clientId = uuid();

     clientSecret = tokenOrSecret();

     let hashPassword = new Promise((resolve, reject) => {
         bcrypt.hash(clientSecret, 8, (err, hash) => {
             if(err) {
                 reject(err);
             } else {
                 resolve(hash);
             }
         });
     });

     hashPassword.then((hashedSecret) => {
         db.query(
             Client
                .insert({
                    applicationName: req.body.application_name,
                    applicationURI: req.body.application_uri,
                    redirectURI: req.body.redirect_uri,
                    clientId,
                    clientSecret: hashedSecret,
                    userId: req.user.userId
                })
                .toQuery(),
            (err, results) => {
                if(err) {
                    return response(res, {
                        status: 500,
                        message: 'Internal error',
                        debug: err
                    });
                }

                response(res, {
                    status: 200,
                    message: 'Client created successfully, ensure client Id and client password are treated as sensitive credentials',
                    result: {
                        clientId,
                        clientSecret
                    }
                });
            }
         );
     });

     hashPassword.catch((err) => {
        response(res, {
            status: 500,
            message: 'Internal error',
            debug: err
        });
     });
 }

 function getClient(req, res) {
     if(!req.user && req.user.userId) {
         return response(res, {
             status: 500,
             message: 'Internal error - no user available'
         });
     }

     db.query(
         Client
            .select(
                Client.applicationName,
                Client.applicationURI,
                Client.redirectURI,
                Client.clientId,
                Client.dateCreated
            )
            .where(
                Client.userId.equals(req.user.userId)
            )
            .toQuery(),
        (err, result) => {
            if(err) {
                return response(res, {
                    status: 500,
                    message: 'Internal error'
                });
            }

            if(!result.rows.length) {
                return response(res, {
                    status: 404,
                    message: `No clients created under user id ${req.user.userId}`
                });
            }

            response(res, {
                status: 200,
                result: result.rows,
                message: 'Success'
            });
        }
     );
 }

 export {
     postClientCreate,
     getClient
 };
