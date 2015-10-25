#!/bin/bash

# Build test DB
cd bin
echo "> Building database"
./db-create.sh wishlist-test > /dev/null
cd ..

# Start server and cache PID
export WISHLIST_TEST=1
node index.js > /dev/null &
SERVER_PID=$!

# Start tests
echo "> Testing"
node_modules/.bin/mocha
EXIT_CODE=$?

# Kill server
kill $SERVER_PID

unset WISHLIST_TEST

# Destroy test DB
cd bin
./db-destroy.sh wishlist-test > /dev/null
cd ..

# Exit with the code of the Mocha script
exit $EXIT_CODE
