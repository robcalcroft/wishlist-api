/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import db from './db';
import Wishlist from '../models/Wishlist';
import WishlistItem from '../models/WishlistItem';
import { response } from './utils';

function getWishlist(req, res) {
  let isAuthenticatedUser = false;

  if (!req.query.wishlist_id && !req.query.user_id) {
    return response(res, {
      status: 400,
      message: 'Wishlist ID or User ID required for request',
    });
  }

  const authPromise = new Promise((resolve) => {
    if (req.query.user_id && (req.query.user_id === String(req.user.userId))) {
      isAuthenticatedUser = true;
      resolve();
    } else if (req.query.wishlist_id) {
      const wishlistQuery = Wishlist
        .select(Wishlist.userId)
        .where(Wishlist.userId.equals(req.user.userId))
        .and(Wishlist.wishlistId.equals(req.query.wishlist_id))
        .toQuery();
      db.all(
        wishlistQuery.text,
        wishlistQuery.values,
        (err, result) => {
          if (err) {
            return response(res, {
              status: 500,
              debug: err,
              message: 'Something went wrong, try again',
            });
          }

          if (result.length > 0) {
            isAuthenticatedUser = true;
          }

          return resolve();
        },
      );
    } else {
      resolve();
    }
  });

  return authPromise.then(() => {
    const wishlistQuery = Wishlist
      .select(
        Wishlist.star(),
        WishlistItem.count().as('wishlistItemCount'),
      )
      .from(Wishlist
        .leftJoin(WishlistItem)
        .on(WishlistItem.wishlistId.equals(Wishlist.wishlistId)))
      .where(Wishlist.wishlistId.equals(req.query.wishlist_id || null))
      .or(Wishlist.userId.equals(req.query.user_id || null))
      .and(!isAuthenticatedUser ? Wishlist.privacy.equals('public') : Wishlist.literal('1=1'))
      .group(Wishlist.wishlistId)
      .order((/^asc$/i.test(req.query.order) ? Wishlist.dateCreated : Wishlist.dateCreated.descending))
      .toQuery();
    db.all(
      wishlistQuery.text,
      wishlistQuery.values,
      (err, result) => {
        if (err) {
          return response(res, {
            status: 500,
            debug: err,
            message: 'Something went wrong, try again',
          });
        }

        if (!result.length) {
          return response(res, {
            status: 404,
            message: `Wishlist with ID ${req.query.wishlist_id || req.query.user_id} was not found`,
          });
        }

        return response(res, {
          status: 200,
          result,
        });
      },
    );
  });
}

function postWishlist(req, res) {
  if (!req.body.title) {
    return response(res, {
      status: 400,
      message: 'Required field \'title\' missing',
    });
  }

  const wishlistQuery = Wishlist
    .insert({
      title: req.body.title,
      isDefault: req.body.is_default || 'false',
      imageURI: req.body.image_uri || null,
      userId: req.user.userId,
      privacy: req.body.privacy || 'public',
    })
    .toQuery();
  return db.all(
    wishlistQuery.text,
    wishlistQuery.values,
    (err) => {
      if (err) {
        return response(res, {
          status: 500,
          debug: err,
          message: 'Something went wrong, try again',
        });
      }

      return response(res, {
        status: 200,
        message: 'Wishlist created successfully',
      });
    },
  );
}

function putWishlist(req, res) {
  if (!req.body.title && !req.body.is_default && !req.body.image_uri && !req.body.privacy) {
    return response(res, {
      status: 400,
      messageId: 'nofieldschanged',
      message: 'No fields were changed',
    });
  }

  if (!req.body.wishlist_id) {
    return response(res, {
      status: 400,
      messageId: 'missingfield:wishlist_id',
      message: 'Missing field wishlist_id',
    });
  }

  const updatedFields = {
    title: req.body.title,
    isDefault: req.body.is_default,
    imageURI: req.body.image_uri,
    privacy: req.body.privacy,
  };

    // Remove anything undefined or null
  let { length } = Object.keys(updatedFields);
  while (length--) { // eslint-disable-line no-plusplus
    const prop = Object.keys(updatedFields)[length];
    if (updatedFields[prop] === undefined || updatedFields[prop] === null) {
      delete updatedFields[prop];
    }
  }

  // Check the wishlist item is owned by the authorised user
  const updateWishlistPromise = new Promise((resolve, reject) => {
    const wishlistQuery = Wishlist
      .select(Wishlist.userId)
      .where(Wishlist.wishlistId.equals(req.body.wishlist_id))
      .toQuery();
    db.all(
      wishlistQuery.text,
      wishlistQuery.values,
      (err, result) => {
        if (err) {
          return reject(err);
        }

        if (!result.length) {
          return reject(null, true); // eslint-disable-line prefer-promise-reject-errors
        }

        return resolve(result[0].userId);
      },
    );
  });

  updateWishlistPromise.catch((err) => {
    if (err) {
      return response(res, {
        status: 500,
        message: 'Internal error',
        debug: err,
      });
    }
    return response(res, {
      status: 404,
      message: 'Wishlist ID not found',
    });
  });

  updateWishlistPromise.then((userId) => {
    if (userId !== req.user.userId) {
      return response(res, {
        status: 403,
        message: 'The wishlist given does not belong to the authorised user',
      });
    }

    const wishlistQuery = Wishlist
      .update(updatedFields)
      .where(Wishlist.wishlistId.equals(req.body.wishlist_id))
      .toQuery();
    return db.all(
      wishlistQuery.text,
      wishlistQuery.values,
      (err) => {
        if (err) {
          return response(res, {
            debug: err,
            messageId: 'updateerror',
            message: 'Error when updating wishlist',
            status: 500,
          });
        }

        return response(res, {
          status: 200,
          messageId: 'updatesuccess',
          message: 'Successfully updated wishlist',
        });
      },
    );
  });

  return true;
}

function deleteWishlist(req, res) {
  const missingFields = [];

  if (!req.user.userId) {
    return response(res, {
      status: 500,
      message: 'Internal error - no user available',
    });
  }

  if (!req.query.wishlist_id) {
    missingFields.push('wishlist_id');
  }

  if (missingFields.length > 0) {
    return response(res, {
      status: 400,
      message: `Required field(s) ${missingFields.join(', ')} must be present`,
    });
  }

  const deleteWishlistPromise = new Promise((resolve, reject) => {
    const deleteWishlistQuery = Wishlist
      .select(Wishlist.userId)
      .where(Wishlist.wishlistId.equals(req.query.wishlist_id))
      .toQuery();
    db.all(
      deleteWishlistQuery.text,
      deleteWishlistQuery.values,
      (err, result) => {
        if (err) {
          return reject(err);
        }

        if (!result.length) {
          return reject(null, true); // eslint-disable-line prefer-promise-reject-errors
        }

        return resolve(result[0].userId);
      },
    );
  });

  deleteWishlistPromise.catch((err) => {
    if (err) {
      return response(res, {
        status: 500,
        message: 'Internal error',
        debug: err,
      });
    }
    return response(res, {
      status: 404,
      message: 'Wishlist ID not found',
    });
  });

  deleteWishlistPromise.then((userId) => {
    if (userId !== req.user.userId) {
      return response(res, {
        status: 403,
        message: 'The wishlist given does not belong to the authorised user',
      });
    }

    const deleteInnerWishlistItems = new Promise((resolve, reject) => {
      const deleteInnerWishlistQuery = WishlistItem
        .delete()
        .where(WishlistItem.wishlistId.equals(req.query.wishlist_id))
        .toQuery();
      db.all(
        deleteInnerWishlistQuery.text,
        deleteInnerWishlistQuery.values,
        (err) => {
          if (err) {
            reject(err);
          }

          return resolve();
        },
      );
    });

    deleteInnerWishlistItems.then(() => {
      const deleteInnerWishlistQuery = Wishlist
        .delete()
        .where(Wishlist.wishlistId.equals(req.query.wishlist_id))
        .toQuery();
      db.all(
        deleteInnerWishlistQuery.text,
        deleteInnerWishlistQuery.values,
        (err) => {
          if (err) {
            return response(res, {
              status: 500,
              message: 'Internal error',
              debug: err,
            });
          }

          return response(res, {
            status: 200,
            message: `Wishlist ${req.query.wishlist_id} successfully deleted`,
          });
        },
      );
    });

    return deleteInnerWishlistItems.catch(() => response(res, {
      status: 500,
      message: 'Internal error',
    }));
  });

  return true;
}

function getWishlistItem(req, res) {
  const missingFields = [];

  if (!req.query.wishlist_item_id) {
    missingFields.push('wishlist_item_id');
  }

  if (!req.query.wishlist_id) {
    missingFields.push('wishlist_id');
  }

  if (missingFields.length > 1) {
    return response(res, {
      status: 400,
      message: `Required fields ${missingFields.join(', ')} must be present`,
    });
  }

  const getWishlistItemQuery = WishlistItem
    .select()
    .where((req.query.wishlist_id ? (
      WishlistItem.wishlistId.equals(req.query.wishlist_id)
    ) : (
      WishlistItem.wishlistItemId.equals(req.query.wishlist_item_id))
    ))
    // Using literals to act as a 'do nothing' to the where clause
    .and((req.query.price_low && req.query.price_high ? WishlistItem.price.between(req.query.price_low, req.query.price_high) : WishlistItem.literal('1=1')))
    .and((req.query.priority ? WishlistItem.userPriority.in(req.query.priority.split(',')) : WishlistItem.literal('1=1')))
    .order((/^asc$/i.test(req.query.order) ? WishlistItem.dateCreated : WishlistItem.dateCreated.descending))
    .toQuery();
  return db.all(
    getWishlistItemQuery.text,
    getWishlistItemQuery.values,
    (err, result) => {
      if (err) {
        return response(res, {
          status: 500,
          debug: err,
          message: 'Something went wrong, try again',
        });
      }

      if (!result.length) {
        return response(res, {
          status: 404,
          message: `Wishlist items with ID ${req.query.wishlist_id} was not found`,
        });
      }

      return response(res, {
        status: 200,
        result,
      });
    },
  );
}

function postWishlistItem(req, res) {
  const missingFields = [];

  if (!req.user.userId) {
    return response(res, {
      status: 500,
      message: 'Internal error: no user available',
    });
  }

  if (!req.body.wishlist_id) {
    missingFields.push('wishlist_id');
  }

  if (!req.body.title) {
    missingFields.push('title');
  }

  if (!req.body.source_uri) {
    missingFields.push('source_uri');
  }

  if (missingFields.length > 0) {
    return response(res, {
      status: 400,
      message: `Required fields ${missingFields.join(', ')} must be present`,
    });
  }

  // Need all price parts
  if (req.body.price) {
    if (!req.body.price_currency_symbol) {
      return response(res, {
        status: 400,
        message: 'If price is specified, price_currency_symbol must be present',
      });
    }
  }

  const wishlistInsertQuery = WishlistItem
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
      userPriority: req.body.user_priority,
    })
    .toQuery();
  return db.all(
    wishlistInsertQuery.text,
    wishlistInsertQuery.values,
    (err) => {
      if (err) {
        return response(res, {
          status: 500,
          message: 'Internal error',
          debug: err,
        });
      }

      return response(res, {
        status: 200,
        message: 'Success',
      });
    },
  );
}

function putWishlistItem(req, res) {
  if (
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
      message: 'No fields were changed',
    });
  }

  if (!req.body.wishlist_item_id) {
    return response(res, {
      status: 400,
      messageId: 'missingfield:wishlist_item_id',
      message: 'Missing field wishlist_item_id',
    });
  }

  // Need all price parts
  if (req.body.price) {
    if (!req.body.price_currency_symbol) {
      return response(res, {
        status: 400,
        message: 'If price is specified, price_currency_symbol must be present',
      });
    }
  }

  const updatedFields = {
    title: req.body.title,
    description: req.body.description,
    sourceURI: req.body.source_uri,
    sourceName: req.body.source_name,
    imageURI: req.body.image_uri,
    price: req.body.price,
    priceCurrencySymbol: req.body.price_currency_symbol,
  };

    // Remove anything undefined or null
  let { length } = Object.keys(updatedFields);
  while (length--) { // eslint-disable-line no-plusplus
    const prop = Object.keys(updatedFields)[length];
    if (updatedFields[prop] === undefined || updatedFields[prop] === null) {
      delete updatedFields[prop];
    }
  }

  // Check the wishlist item is owned by the authorised user
  const updateWishlistItemPromise = new Promise((resolve, reject) => {
    const updateWishlistItemQuery = WishlistItem
      .select(WishlistItem.userId)
      .where(WishlistItem.wishlistItemId.equals(req.body.wishlist_item_id))
      .toQuery();
    db.all(
      updateWishlistItemQuery.text,
      updateWishlistItemQuery.values,
      (err, result) => {
        if (err) {
          return reject(err);
        }

        if (!result.length) {
          return reject(null, true); // eslint-disable-line prefer-promise-reject-errors
        }

        return resolve(result[0].userId);
      },
    );
  });

  updateWishlistItemPromise.catch((err) => {
    if (err) {
      return response(res, {
        status: 500,
        message: 'Internal error',
        debug: err,
      });
    }
    return response(res, {
      status: 404,
      message: 'Wishlist item ID not found',
    });
  });

  updateWishlistItemPromise.then((userId) => {
    if (userId !== req.user.userId) {
      return response(res, {
        status: 403,
        message: 'The wishlist item given does not belong to the authorised user',
      });
    }

    const updateWishlistItem = WishlistItem
      .update(updatedFields)
      .where(WishlistItem.wishlistItemId.equals(req.body.wishlist_item_id))
      .toQuery();
    return db.all(
      updateWishlistItem.text,
      updateWishlistItem.values,
      (err) => {
        if (err) {
          return response(res, {
            debug: err,
            messageId: 'updateerror',
            message: 'Error when updating wishlist item',
            status: 500,
          });
        }

        return response(res, {
          status: 200,
          messageId: 'updatesuccess',
          message: 'Successfully updated wishlist item',
        });
      },
    );
  });

  return true;
}

function deleteWishlistItem(req, res) {
  const missingFields = [];

  if (!req.user.userId) {
    return response(res, {
      status: 500,
      message: 'Internal error: no user available',
    });
  }

  if (!req.query.wishlist_item_id) {
    missingFields.push('wishlist_item_id');
  }

  if (missingFields.length > 0) {
    return response(res, {
      status: 400,
      message: `Required field(s) ${missingFields.join(', ')} must be present`,
    });
  }

  // Check the wishlist item is owned by the authorised user
  const deleteWishlistItemPromise = new Promise((resolve, reject) => {
    const deleteWishlistItem1 = WishlistItem
      .select(WishlistItem.userId)
      .where(WishlistItem.wishlistItemId.equals(req.query.wishlist_item_id))
      .toQuery();
    db.all(
      deleteWishlistItem1.text,
      deleteWishlistItem1.values,
      (err, result) => {
        if (err) {
          return reject(err);
        }

        if (!result.length) {
          return reject(null, true); // eslint-disable-line prefer-promise-reject-errors
        }

        return resolve(result[0].userId);
      },
    );
  });

  deleteWishlistItemPromise.catch((err) => {
    if (err) {
      return response(res, {
        status: 500,
        message: 'Internal error',
        debug: err,
      });
    }
    return response(res, {
      status: 404,
      message: 'Wishlist item ID not found',
    });
  });

  deleteWishlistItemPromise.then((userId) => {
    if (userId !== req.user.userId) {
      return response(res, {
        status: 403,
        message: 'The wishlist item given does not belong to the authorised user',
      });
    }

    const deleteWishlistItem2 = WishlistItem
      .delete()
      .where(WishlistItem.wishlistItemId.equals(req.query.wishlist_item_id))
      .toQuery();
    return db.all(
      deleteWishlistItem2.text,
      deleteWishlistItem2.values,
      (err) => {
        if (err) {
          return response(res, {
            status: 500,
            message: 'Internal error',
            debug: err,
          });
        }

        return response(res, {
          status: 200,
          message: `Wishlist item ${req.query.wishlist_item_id} successfully deleted`,
        });
      },
    );
  });

  return true;
}

export {
  getWishlist,
  postWishlist,
  putWishlist,
  deleteWishlist,
  getWishlistItem,
  postWishlistItem,
  putWishlistItem,
  deleteWishlistItem,
};
