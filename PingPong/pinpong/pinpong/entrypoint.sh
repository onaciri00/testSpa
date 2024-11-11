#!/bin/bash

# set -e

# host="postgreDB"  # Set this to your PostgreSQL host name

# until pg_isready -h "$host"; do
#   >&2 echo "Postgres is unavailable - sleeping"
#   sleep 1
# done

# >&2 echo "Postgres is up - executing command"

python3 manage.py makemigrations --noinput

python3 manage.py migrate --noinput

python3 manage.py runserver 0.0.0.0:8002