#!/bin/bash

# Create DB
psql -w -U postgres -h 127.0.0.1 -c "CREATE DATABASE \"wishlist\" WITH OWNER wishlist;" > /dev/null
echo "> Database created"

# Setup PostGIS
psql -w -U wishlist --dbname wishlist -h 127.0.0.1 -c "CREATE EXTENSION postgis;CREATE EXTENSION postgis_topology;CREATE EXTENSION fuzzystrmatch;CREATE EXTENSION postgis_tiger_geocoder;" > /dev/null
echo "> PostGIS configured"

# Setup User table
psql -w -U wishlist --dbname wishlist -h 127.0.0.1 -a -f ../lib/models/sql/User.sql > /dev/null
echo "> User table created"
psql -w -U wishlist --dbname wishlist -h 127.0.0.1 -a -f ../lib/models/sql/dummy/user-data.sql > /dev/null
echo "> User data inserted"

# Setup Client table
psql -w -U wishlist --dbname wishlist -h 127.0.0.1 -a -f ../lib/models/sql/Client.sql > /dev/null
echo "> Client table created"
psql -w -U wishlist --dbname wishlist -h 127.0.0.1 -a -f ../lib/models/sql/dummy/client-data.sql > /dev/null
echo "> Client data inserted"

# Setup AuthCode table
psql -w -U wishlist --dbname wishlist -h 127.0.0.1 -a -f ../lib/models/sql/AuthCode.sql > /dev/null
echo "> AuthCode table created"

# Setup AccessToken table
psql -w -U wishlist --dbname wishlist -h 127.0.0.1 -a -f ../lib/models/sql/AccessToken.sql > /dev/null
echo "> AccessToken table created"
