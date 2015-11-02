#!/bin/bash

echo "-- SETUP --"

# Create DB
psql -w -U postgres -h 127.0.0.1 -c "CREATE DATABASE \"${1-wishlist}\" WITH OWNER wishlist;" > /dev/null
echo "> Database created"

echo "-- APPLICATION --"

# Setup User table
psql -w -U wishlist --dbname ${1-wishlist} -h 127.0.0.1 -a -f ../lib/models/sql/User.sql > /dev/null
echo "> User table created"
psql -w -U wishlist --dbname ${1-wishlist} -h 127.0.0.1 -a -f ../test/user-data.sql > /dev/null
echo "> User data inserted"

# Setup Client table
psql -w -U wishlist --dbname ${1-wishlist} -h 127.0.0.1 -a -f ../lib/models/sql/Client.sql > /dev/null
echo "> Client table created"
psql -w -U wishlist --dbname ${1-wishlist} -h 127.0.0.1 -a -f ../test/client-data.sql > /dev/null
echo "> Client data inserted"

echo "-- OAUTH2 --"

# Setup AuthCode table
psql -w -U wishlist --dbname ${1-wishlist} -h 127.0.0.1 -a -f ../lib/models/sql/AuthCode.sql > /dev/null
echo "> AuthCode table created"

# Setup AccessToken table
psql -w -U wishlist --dbname ${1-wishlist} -h 127.0.0.1 -a -f ../lib/models/sql/AccessToken.sql > /dev/null
echo "> AccessToken table created"

# Setup RefreshToken table
psql -w -U wishlist --dbname ${1-wishlist} -h 127.0.0.1 -a -f ../lib/models/sql/RefreshToken.sql > /dev/null
echo "> RefreshToken table created"
