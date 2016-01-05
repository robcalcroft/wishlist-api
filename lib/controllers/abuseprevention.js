/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import { response } from 'controllers/utils';

export default (req, res, limit, ipLimitData) => {
    response(res, {
        headers: {
            'Retry-After': (ipLimitData.expire - Math.round(new Date() / 1000))
        },
        status: 429,
        message: `A limit of ${limit.request_count} requests in ${limit.request_period} seconds has been reached. Request aborted.`
    });
};
