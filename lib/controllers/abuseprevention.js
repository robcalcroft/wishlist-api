/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import { response } from 'controllers/utils';

const errorHandler = (req, res, limit, ipLimitData) => {
    response(res, {
        headers: {
            'Retry-After': (ipLimitData.expire - Math.round(new Date() / 1000))
        },
        status: 429,
        message: `A limit of ${limit.request_count} requests in ${limit.request_period} seconds has been reached. Request aborted.`
    });
};

// List of routes that have abuse
// prevention applied to them
//
// 2 is the request count, 1 is the period in seconds
const limitedRoutes = [
    ['/auth/token', 'GET', 2, 1]
];

export {
    limitedRoutes,
    errorHandler
};
