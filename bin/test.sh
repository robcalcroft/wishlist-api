#!/bin/bash

# Build test DB
cd bin
echo "> Building test database"
./db-build.sh wishlist-test > /dev/null
./db-seed.sh wishlist-test > /dev/null
cd ..

# Start server and cache PID
export WISHLIST_TEST=1
export NODE_PATH=./lib
node index.js > /dev/null &
SERVER_PID=$!

# Start tests
echo "> Testing"
node_modules/.bin/mocha --compilers js:babel-core/register
EXIT_CODE=$?

# Kill server
kill $SERVER_PID

unset WISHLIST_TEST
unset NODE_PATH

# Destroy test DB
echo "> Removing test database"
cd bin
./db-destroy.sh wishlist-test > /dev/null
cd ..

# Exit with the code of the Mocha script
echo "> Exiting with code $EXIT_CODE"
exit $EXIT_CODE
