#!/bin/bash

echo "-- SEED DATA --"

psql -w -U wishlist --dbname ${1-wishlist} -h 127.0.0.1 -a -f ../test/user-data.sql > /dev/null
echo "> User data inserted"

psql -w -U wishlist --dbname ${1-wishlist} -h 127.0.0.1 -a -f ../test/client-data.sql > /dev/null
echo "> Client data inserted"

psql -w -U wishlist --dbname ${1-wishlist} -h 127.0.0.1 -a -f ../test/wishlist-data.sql > /dev/null
echo "> Wishlist data inserted"

echo "> Data seeded from tests/*.sql"
