/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import db from 'controllers/db';
import bcrypt from 'bcrypt';
import User from 'models/User';
import { response } from 'controllers/utils';

function postUserSignUp(req, res) {
    let signUpUri = `/api/${process.env.API_VERSION}/auth/sign-up`;
    let missingFields = [];

    req.flash('fieldPrefill', req.body);

    if(!req.body.firstName) {
        missingFields.push('First name');
    }

    if(!req.body.lastName) {
        missingFields.push('Last name');
    }

    if(!req.body.username) {
        missingFields.push('Username');
    }

    if(!req.body.password) {
        missingFields.push('Password');
    }

    if(!req.body.emailAddress) {
        missingFields.push('Email address');
    }

    if(!req.body.DOB) {
        missingFields.push('Birthday');
    }

    if(missingFields.length > 0) {
        req.flash('error', `${missingFields.length > 1 ? missingFields.join(', ') : missingFields[0]} ${missingFields.length > 1 ? 'are' : 'is'} missing, please ensure ${missingFields.length > 1 ? 'they are' : 'it is'} filled out`);
        return res.redirect(signUpUri);
    }

    if(req.body.username.length > 25) {
        req.flash('error', 'Username cannot be longer than 25 characters');
        return res.redirect(signUpUri);
    }

    if(!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(req.body.password)) {
        req.flash('error', 'Password must contain at least 8 characters and have at least 1 numerical and alphabetic characters');
        return res.redirect(signUpUri);
    }

    if(!/(^(((0[1-9]|[12][0-8])[\-](0[1-9]|1[012]))|((29|30|31)[\-](0[13578]|1[02]))|((29|30)[\-](0[4,6,9]|11)))[\-](19|[2-9][0-9])\d\d$)|(^29[\-]02[\-](19|[2-9][0-9])(00|04|08|12|16|20|24|28|32|36|40|44|48|52|56|60|64|68|72|76|80|84|88|92|96)$)/g.test(req.body.DOB)) {
        req.flash('error', 'Date format must follow dd-mm-yyy, and be a valid date');
        return res.redirect(signUpUri);
    }

    if(!/^(\w|\d)+@(\w|\d)+\.\w+(\.\w+)?$/.test(req.body.emailAddress)) {
        req.flash('error', 'Email address must be valid');
        return res.redirect(signUpUri);
    }

    let usernameEmailCheck = new Promise((resolve, reject) => {
        db.query(
            User
                .select(
                    User.userId
                )
                .where(
                    User.emailAddress.equals(req.body.emailAddress)
                )
                .or(
                    User.username.equals(req.body.username)
                )
                .toQuery(),
            (err, result) => {
                if(err) {
                    req.flash('error', 'Internal error, please try again');
                    return res.redirect(signUpUri);
                }

                if(result.rows.length === 0) {
                    resolve();
                } else {
                    reject();
                }
            }
        );
    });

    usernameEmailCheck.catch(() => {
        req.flash('error', `Username ${req.body.username} or email address ${req.body.emailAddress} already exists`);
        return res.redirect(signUpUri);
    });

    usernameEmailCheck.then(() => {
        let passwordHash = new Promise((resolve, reject) => {
            bcrypt.hash(req.body.password, 8, (err, hash) => {
                if(err) {
                    reject();
                }
                resolve(hash);
            });
        });

        passwordHash.catch(() => {
            req.flash('error', 'Internal error, please try again');
            res.redirect(signUpUri);
        });

        passwordHash.then((hash) => {

            db.query(
                User
                    .insert({
                        firstName: req.body.firstName,
                        lastName: req.body.lastName,
                        emailAddress: req.body.emailAddress,
                        password: hash,
                        username: req.body.username,
                        DOB: req.body.DOB
                    })
                    .toQuery(),
                (err, result) => {
                    if(err) {
                        if(err.code === '22001') {
                            req.flash('error', 'Field too long, please ensure fields are not excessive in length');
                        } else {
                            req.flash('error', 'Internal error, please try again');
                        }
                        return res.redirect(signUpUri);
                    }

                    req.flash('user_create_success', `Thanks for signing up ${req.body.firstName}, now you can login to start creating your wish lists.`);
                    res.redirect(`/api/${process.env.API_VERSION}/auth/login`);
                }
            );
        });
    });

}

export {
    postUserSignUp
};
