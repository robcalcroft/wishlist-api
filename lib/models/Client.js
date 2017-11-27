/*!
 * wishlist-api
 *
 * Copyright (c) Rob Calcroft 2015
 */

import sql from 'sql';

sql.setDialect('sqlite');

export default sql.define({
  name: 'Client',
  columns: [
    'applicationName',
    'applicationURI',
    'redirectURI',
    'clientId',
    'clientSecret',
    'userId',
  ],
});
