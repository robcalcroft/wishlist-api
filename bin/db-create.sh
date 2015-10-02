#!/bin/bash

# Create DB
psql -w -U postgres -h 127.0.0.1 -c "CREATE DATABASE \"wishlist\" WITH OWNER robcalcroft;" > /dev/null
echo "> Database created"

# Setup PostGIS
psql -w -U postgres --dbname wishlist -h 127.0.0.1 -c "CREATE EXTENSION postgis;CREATE EXTENSION postgis_topology;CREATE EXTENSION fuzzystrmatch;CREATE EXTENSION postgis_tiger_geocoder;" > /dev/null
echo "> PostGIS configured"
