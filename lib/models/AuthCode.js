/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import sql from 'sql';

sql.setDialect('sqlite');

export default sql.define({
  name: 'AuthCode',
  columns: [
    'authCode',
    'clientId',
    'userId',
    'redirectURI',
  ],
});
