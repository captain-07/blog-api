#!/usr/bin/env bash
set -euo pipefail

pip install -r requirements.txt

cd backend
python manage.py migrate
python manage.py collectstatic --no-input

# Create superuser only when required env vars are provided.
if [[ -n "${DJANGO_SUPERUSER_USERNAME:-}" && -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]]; then
  python manage.py createsuperuser --noinput || true
fi