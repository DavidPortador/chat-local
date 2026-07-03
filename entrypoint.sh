#!/bin/sh

# The process ends if any command fails.
set -e 

# Clear astro cache
rm -rf /app/.astro

# Replace the shell process with the main process
exec "$@"