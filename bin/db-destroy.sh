#!/bin/bash

# Destroy DB
psql -w -U postgres -h 127.0.0.1 -c "DROP DATABASE \"${1-wishlist}\";" > /dev/null
echo "> Database destroyed";
