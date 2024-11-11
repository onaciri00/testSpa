#!/bin/sh

# Make migrations without user input

# rm -rf django/oauth/migrations/0001_initial.py

# python manage.py migrate oauth zero  # Reset oauth app migrations
# find . -path "*/migrations/*.py" -not -name "__init__.py" -delete  # Delete all migration files

# python3 manage.py makemigrations --noinput
# python3 manage.py migrate --noinput
# python3 manage.py runserver 0.0.0.0:8000


# -------------------------------------------------------

#!/bin/sh

set -e

host="postgreDB"  # Set this to your PostgreSQL host name

until pg_isready -h "$host"; do
  >&2 echo "Postgres is unavailable - sleeping"
  sleep 1
done

>&2 echo "Postgres is up - executing command"

# Make migrations without user input
# rm -rf django/oauth/migrations/0001_initial.py

# python manage.py migrate oauth zero  # Reset oauth app migrations
# find . -path "*/migrations/*.py" -not -name "__init__.py" -delete  # Delete all migration files

python3 manage.py makemigrations --noinput

python3 manage.py migrate --noinput

python3 manage.py runserver 0.0.0.0:8000
