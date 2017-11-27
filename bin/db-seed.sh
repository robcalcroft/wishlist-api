#!/bin/bash

echo "-- SEED DATA --"

cat ../test/user-data.sql | sqlite3 ../wishlist.database
echo "> User data inserted"

cat ../test/client-data.sql | sqlite3 ../wishlist.database
echo "> Client data inserted"

cat ../test/wishlist-data.sql | sqlite3 ../wishlist.database
echo "> Wishlist data inserted"

cat ../test/wishlist-item-data.sql | sqlite3 ../wishlist.database
echo "> Wishlist item data inserted"

echo "> Data seeded from tests/*.sql"
