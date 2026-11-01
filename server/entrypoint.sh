#!/bin/sh
set -e
node server/migrate.js
exec "$@"
