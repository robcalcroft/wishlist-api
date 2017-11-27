#!/bin/bash

echo "-- SETUP --"

echo "-- APPLICATION --"

# Setup User table
cat ../lib/models/sql/User.sql | sqlite3 ../${1-wishlist}.database
echo "> User table created"

# Setup Client table
cat ../lib/models/sql/Client.sql | sqlite3 ../${1-wishlist}.database
echo "> Client table created"

# Setup Client table
cat ../lib/models/sql/ClientUser.sql | sqlite3 ../${1-wishlist}.database
echo "> ClientUser table created"

echo "-- OAUTH2 --"

# Setup AuthCode table
cat ../lib/models/sql/AuthCode.sql | sqlite3 ../${1-wishlist}.database
echo "> AuthCode table created"

# Setup AccessToken table
cat ../lib/models/sql/AccessToken.sql | sqlite3 ../${1-wishlist}.database
echo "> AccessToken table created"

# Setup RefreshToken table
cat ../lib/models/sql/RefreshToken.sql | sqlite3 ../${1-wishlist}.database
echo "> RefreshToken table created"

# Setup session table
# cat ../lib/models/sql/RefreshToken.sql | sqlite3../${1-wishlist}.database
# psql -w -U wishlist --dbname ../${1-wishlist} -h 127.0.0.1 -a -f ../node_modules/connect-pg-simple/table.sql > /dev/null
# echo "> Session table created"

# Wishlist table
cat ../lib/models/sql/Wishlist.sql | sqlite3 ../${1-wishlist}.database
echo "> Wishlist table created"

# Wishlist item table
cat ../lib/models/sql/WishlistItem.sql | sqlite3 ../${1-wishlist}.database
echo "> Wishlist item table created"
