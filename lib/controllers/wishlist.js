/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

 import db from 'controllers/db';
 import Wishlist from 'models/Wishlist';
 import WishlistItem from 'models/WishlistItem';
 import { response } from 'controllers/utils';

function getWishlist(req, res) {
    let isAuthenticatedUser = false;

    if(!req.query.wishlist_id && !req.query.user_id) {
        return response(res, {
            status: 400,
            message: 'Wishlist ID or User ID required for request'
        });
    }

    let authPromise = new Promise((resolve, reject) => {
        if(req.query.user_id && (req.query.user_id === String(req.user.userId))) {
            isAuthenticatedUser = true;
            resolve();
        } else if(req.query.wishlist_id) {
            db.query(
                Wishlist
                    .select(Wishlist.userId)
                    .where(
                        Wishlist.userId.equals(req.user.userId)
                    )
                    .and(
                        Wishlist.wishlistId.equals(req.query.wishlist_id)
                    )
                    .toQuery(),
                (err, result) => {
                    if(err) {
                        return response(res, {
                            status: 500,
                            debug: err,
                            message: 'Something went wrong, try again'
                        });
                    }

                    if(result.rows.length > 0) {
                        isAuthenticatedUser = true;
                    }
                    resolve();
                }
            );
        } else {
            resolve();
        }
    });

    authPromise.then(() => {
        db.query(
            Wishlist
                .select(
                    Wishlist.star(),
                    WishlistItem.count().as('wishlistItemCount')
                )
                .from(
                    Wishlist
                        .leftJoin(
                            WishlistItem
                        )
                        .on(
                            WishlistItem.wishlistId.equals(Wishlist.wishlistId)
                        )
                )
                .where(
                    Wishlist.wishlistId.equals(req.query.wishlist_id || null)
                )
                .or(
                    Wishlist.userId.equals(req.query.user_id || null )
                )
                .and(
                    !isAuthenticatedUser ? Wishlist.privacy.equals('public') : Wishlist.literal('1=1')
                )
                .group(
                    Wishlist.wishlistId
                )
                .order(
                    (/^asc$/i.test(req.query.order) ? Wishlist.dateCreated : Wishlist.dateCreated.descending)
                )
                .toQuery(),
            (err, result) => {
                if(err) {
                    return response(res, {
                        status: 500,
                        debug: err,
                        message: 'Something went wrong, try again'
                    });
                }

                if(!result.rows.length) {
                    return response(res, {
                        status: 404,
                        message: `Wishlist with ID ${req.query.wishlist_id || req.query.user_id} was not found`
                    });
                }

                response(res, {
                    status: 200,
                    result: result.rows
                });
            }
        );
    });
}

function postWishlist(req, res) {
    if(!req.body.title) {
        return response(res, {
            status: 400,
            message: 'Required field \'title\' missing'
        });
    }

    db.query(
        Wishlist
            .insert({
                title: req.body.title,
                isDefault: req.body.is_default || 'false',
                imageURI: req.body.image_uri || null,
                userId: req.user.userId,
                privacy: req.body.privacy || 'public'
            })
            .toQuery(),
        (err, result) => {
            if(err) {
                return response(res, {
                    status: 500,
                    debug: err,
                    message: 'Something went wrong, try again'
                });
            }

            response(res, {
                status: 200,
                message: 'Wishlist created successfully'
            });
        }
    );
}

function putWishlist(req, res) {
    if(!req.body.title && !req.body.is_default && !req.body.image_uri && !req.body.privacy) {
        return response(res, {
            status: 400,
            messageId: 'nofieldschanged',
            message: 'No fields were changed'
        });
    }

    if(!req.body.wishlist_id) {
        return response(res, {
            status: 400,
            messageId: 'missingfield:wishlist_id',
            message: 'Missing field wishlist_id'
        });
    }

    let updatedFields = {
        title: req.body.title,
        isDefault: req.body.is_default,
        imageURI: req.body.image_uri,
        privacy: req.body.privacy
    };

    // Remove anything undefined or null
    let length = Object.keys(updatedFields).length;
    while(length--) {
        let prop = Object.keys(updatedFields)[length];
        if(updatedFields[prop] === undefined || updatedFields[prop] === null) {
            delete updatedFields[prop];
        }
    }

    // Check the wishlist item is owned by the authorised user
    let updateWishlistPromise = new Promise((resolve, reject) => {
        db.query(
            Wishlist
                .select(Wishlist.userId)
                .where(Wishlist.wishlistId.equals(req.body.wishlist_id))
                .toQuery(),
            (err, result) => {
                if(err) {
                    return reject(err);
                }

                if(!result.rows.length) {
                    return reject(null, true);
                }

                resolve(result.rows[0].userId);
            }
        );
    });

    updateWishlistPromise.catch((err, notFound) => {
        if(err) {
            return response(res, {
                status: 500,
                message: 'Internal error',
                debug: err
            });
        }
        return response(res, {
            status: 404,
            message: 'Wishlist ID not found'
        });
    });

    updateWishlistPromise.then((userId) => {
        if(userId !== req.user.userId) {
            return response(res, {
                status: 403,
                message: 'The wishlist given does not belong to the authorised user'
            });
        }

        db.query(
            Wishlist
                .update(updatedFields)
                .where(Wishlist.wishlistId.equals(req.body.wishlist_id))
                .toQuery(),
            (err, result) => {
                if(err) {
                    return response(res, {
                        debug: err,
                        messageId: 'updateerror',
                        message: 'Error when updating wishlist',
                        status: 500
                    });
                }

                response(res, {
                    status: 200,
                    messageId: 'updatesuccess',
                    message: 'Successfully updated wishlist'
                });
            }
        );
    });
}

function deleteWishlist(req, res) {
    let missingFields = [];

    if(!req.user.userId) {
        return response(res, {
            status: 500,
            message: 'Internal error - no user available'
        });
    }

    if(!req.query.wishlist_id) {
        missingFields.push('wishlist_id');
    }

    if(missingFields.length > 0) {
        return response(res, {
            status: 400,
            message: `Required field(s) ${missingFields.join(', ')} must be present`
        });
    }

    let deleteWishlistPromise = new Promise((resolve, reject) => {
        db.query(
            Wishlist
                .select(
                    Wishlist.userId
                )
                .where(
                    Wishlist.wishlistId.equals(req.query.wishlist_id)
                )
                .toQuery(),
            (err, result) => {
                if(err) {
                    return reject(err);
                }

                if(!result.rows.length) {
                    return reject(null, true);
                }

                resolve(result.rows[0].userId);
            }
        );
    });

    deleteWishlistPromise.catch((err, notFound) => {
        if(err) {
            return response(res, {
                status: 500,
                message: 'Internal error',
                debug: err
            });
        }
        return response(res, {
            status: 404,
            message: 'Wishlist ID not found'
        });
    });

    deleteWishlistPromise.then((userId) => {
        if(userId !== req.user.userId) {
            return response(res, {
                status: 403,
                message: 'The wishlist given does not belong to the authorised user'
            });
        }

        let deleteInnerWishlistItems = new Promise((resolve, reject) => {
            db.query(
                WishlistItem
                    .delete()
                    .where(
                        WishlistItem.wishlistId.equals(req.query.wishlist_id)
                    )
                    .toQuery(),
                (err, result) => {
                    if(err) {
                        reject(err);
                    }

                    resolve();
                }
            );
        });

        deleteInnerWishlistItems.then(() => {
            db.query(
                Wishlist
                    .delete()
                    .where(
                        Wishlist.wishlistId.equals(req.query.wishlist_id)
                    )
                    .toQuery(),
                (err, result) => {
                    if(err) {
                        return response(res, {
                            status: 500,
                            message: 'Internal error',
                            debug: err
                        });
                    }

                    response(res, {
                        status: 200,
                        message: `Wishlist ${req.query.wishlist_id} successfully deleted`
                    });
                }
            );
        });

        deleteInnerWishlistItems.catch((err) => {
            return response(res, {
                status: 500,
                message: 'Internal error'
            });
        });
    });

}

function getWishlistItem(req, res) {
    let missingFields = [];

    if(!req.query.wishlist_item_id) {
        missingFields.push('wishlist_item_id');
    }

    if(!req.query.wishlist_id) {
        missingFields.push('wishlist_id');
    }

    if(missingFields.length > 1) {
        return response(res, {
            status: 400,
            message: `Required fields ${missingFields.join(', ')} must be present`
        });
    }

    db.query(
        WishlistItem
            .select()
            .where(
                (req.query.wishlist_id ? WishlistItem.wishlistId.equals(req.query.wishlist_id) : WishlistItem.wishlistItemId.equals(req.query.wishlist_item_id))
            )
            // Using literals to act as a 'do nothing' to the where clause
            .and(
                (req.query.price_low && req.query.price_high ? WishlistItem.price.between(req.query.price_low,req.query.price_high) : WishlistItem.literal('1=1'))
            )
            .and(
                (req.query.priority ? WishlistItem.userPriority.in(req.query.priority.split(',')) : WishlistItem.literal('1=1'))
            )
            .order(
                (/^asc$/i.test(req.query.order) ? WishlistItem.dateCreated : WishlistItem.dateCreated.descending)
            )
            .toQuery(),
        (err, result) => {
            if(err) {
                return response(res, {
                    status: 500,
                    debug: err,
                    message: 'Something went wrong, try again'
                });
            }

            if(!result.rows.length) {
                return response(res, {
                    status: 404,
                    message: `Wishlist items with ID ${req.query.wishlist_id} was not found`
                });
            }

            response(res, {
                status: 200,
                result: result.rows
            });
        }
    );
}

function postWishlistItem(req, res) {
    let missingFields = [];

    if(!req.user.userId) {
        return response(res, {
            status: 500,
            message: 'Internal error: no user available'
        });
    }

    if(!req.body.wishlist_id) {
        missingFields.push('wishlist_id');
    }

    if(!req.body.title) {
        missingFields.push('title');
    }

    if(!req.body.source_uri) {
        missingFields.push('source_uri');
    }

    if(missingFields.length > 0) {
        return response(res, {
            status: 400,
            message: `Required fields ${missingFields.join(', ')} must be present`
        });
    }

    // Need all price parts
    if(req.body.price) {
        if(!req.body.price_currency_symbol) {
            return response(res, {
                status: 400,
                message: 'If price is specified, price_currency_symbol must be present'
            });
        }
    }

    db.query(
        WishlistItem
            .insert({
                userId: req.user.userId,
                wishlistId: req.body.wishlist_id,
                title: req.body.title,
                description: req.body.description,
                sourceURI: req.body.source_uri,
                sourceName: req.body.source_name,
                imageURI: req.body.image_uri,
                price: req.body.price,
                priceCurrencySymbol: req.body.price_currency_symbol,
                userPriority: req.body.user_priority
            })
            .toQuery(),
        (err, result) => {
            if(err) {
                return response(res, {
                    status: 500,
                    message: 'Internal error',
                    debug: err
                });
            }

            response(res, {
                status: 200,
                message: 'Success'
            });
        }
    );
}

function putWishlistItem(req, res) {
    if(
        !req.body.title &&
        !req.body.description &&
        !req.body.image_uri &&
        !req.body.source_name &&
        !req.body.source_uri &&
        !req.body.price &&
        !req.body.price_currency_symbol &&
        !req.body.user_priority
    ) {
        return response(res, {
            status: 400,
            messageId: 'nofieldschanged',
            message: 'No fields were changed'
        });
    }

    if(!req.body.wishlist_item_id) {
        return response(res, {
            status: 400,
            messageId: 'missingfield:wishlist_item_id',
            message: 'Missing field wishlist_item_id'
        });
    }

    // Need all price parts
    if(req.body.price) {
        if(!req.body.price_currency_symbol) {
            return response(res, {
                status: 400,
                message: 'If price is specified, price_currency_symbol must be present'
            });
        }
    }

    let updatedFields = {
        title: req.body.title,
        description: req.body.description,
        sourceURI: req.body.source_uri,
        sourceName: req.body.source_name,
        imageURI: req.body.image_uri,
        price: req.body.price,
        priceCurrencySymbol: req.body.price_currency_symbol
    };

    // Remove anything undefined or null
    let length = Object.keys(updatedFields).length;
    while(length--) {
        let prop = Object.keys(updatedFields)[length];
        if(updatedFields[prop] === undefined || updatedFields[prop] === null) {
            delete updatedFields[prop];
        }
    }

    // Check the wishlist item is owned by the authorised user
    let updateWishlistItemPromise = new Promise((resolve, reject) => {
        db.query(
            WishlistItem
                .select(
                    WishlistItem.userId
                )
                .where(
                    WishlistItem.wishlistItemId.equals(req.body.wishlist_item_id)
                )
                .toQuery(),
            (err, result) => {
                if(err) {
                    return reject(err);
                }

                if(!result.rows.length) {
                    return reject(null, true);
                }

                resolve(result.rows[0].userId);
            }
        );
    });

    updateWishlistItemPromise.catch((err, notFound) => {
        if(err) {
            return response(res, {
                status: 500,
                message: 'Internal error',
                debug: err
            });
        }
        return response(res, {
            status: 404,
            message: 'Wishlist item ID not found'
        });
    });

    updateWishlistItemPromise.then((userId) => {
        if(userId !== req.user.userId) {
            return response(res, {
                status: 403,
                message: 'The wishlist item given does not belong to the authorised user'
            });
        }

        db.query(
            WishlistItem
                .update(updatedFields)
                .where(WishlistItem.wishlistItemId.equals(req.body.wishlist_item_id))
                .toQuery(),
            (err, result) => {
                if(err) {
                    return response(res, {
                        debug: err,
                        messageId: 'updateerror',
                        message: 'Error when updating wishlist item',
                        status: 500
                    });
                }

                response(res, {
                    status: 200,
                    messageId: 'updatesuccess',
                    message: 'Successfully updated wishlist item'
                });
            }
        );
    });
}

function deleteWishlistItem(req, res) {
    let missingFields = [];

    if(!req.user.userId) {
        return response(res, {
            status: 500,
            message: 'Internal error: no user available'
        });
    }

    if(!req.query.wishlist_item_id) {
        missingFields.push('wishlist_item_id');
    }

    if(missingFields.length > 0) {
        return response(res, {
            status: 400,
            message: `Required field(s) ${missingFields.join(', ')} must be present`
        });
    }

    // Check the wishlist item is owned by the authorised user
    let deleteWishlistItemPromise = new Promise((resolve, reject) => {
        db.query(
            WishlistItem
                .select(
                    WishlistItem.userId
                )
                .where(
                    WishlistItem.wishlistItemId.equals(req.query.wishlist_item_id)
                )
                .toQuery(),
            (err, result) => {
                if(err) {
                    return reject(err);
                }

                if(!result.rows.length) {
                    return reject(null, true);
                }

                resolve(result.rows[0].userId);
            }
        );
    });

    deleteWishlistItemPromise.catch((err, notFound) => {
        if(err) {
            return response(res, {
                status: 500,
                message: 'Internal error',
                debug: err
            });
        }
        return response(res, {
            status: 404,
            message: 'Wishlist item ID not found'
        });
    });

    deleteWishlistItemPromise.then((userId) => {
        if(userId !== req.user.userId) {
            return response(res, {
                status: 403,
                message: 'The wishlist item given does not belong to the authorised user'
            });
        }

        db.query(
            WishlistItem
                .delete()
                .where(
                    WishlistItem.wishlistItemId.equals(req.query.wishlist_item_id)
                )
                .toQuery(),
            (err, result) => {
                if(err) {
                    return response(res, {
                        status: 500,
                        message: 'Internal error',
                        debug: err
                    });
                }

                response(res, {
                    status: 200,
                    message: `Wishlist item ${req.query.wishlist_item_id} successfully deleted`
                });
            }
        );
    });

}

export {
    getWishlist,
    postWishlist,
    putWishlist,
    deleteWishlist,
    getWishlistItem,
    postWishlistItem,
    putWishlistItem,
    deleteWishlistItem
};
