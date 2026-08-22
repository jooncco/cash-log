#!/usr/bin/env bash
#
# One-off migration of the legacy MySQL data into the embedded H2 database.
#
# Usage:
#   infrastructure/scripts/mysql-to-h2.sh <mysql-data-dump.sql> [h2-volume]
#
# The dump is expected to come from:
#   mysqldump --no-create-info --complete-insert --skip-extended-insert \
#             --ignore-table=<db>.flyway_schema_history <db>
#
# The script converts that dump to H2 syntax, then runs it against the H2
# database on the given Docker volume (default: cashlog-data). The backend
# container must be stopped first: H2 file mode takes an exclusive lock.
#
# The conversion is deliberately conservative — it only strips MySQL identifier
# quoting and reorders statements so foreign keys are satisfied. It aborts if
# the dump contains backslash escapes, which MySQL and H2 interpret differently.
set -euo pipefail

DUMP=${1:?"usage: $0 <mysql-data-dump.sql> [h2-volume]"}
VOLUME=${2:-cashlog-data}
H2_JAR=$(ls "$HOME"/.m2/repository/com/h2database/h2/*/h2-*.jar 2>/dev/null | tail -1)
DB_USER=${DB_USER:-cashlog}
DB_PASSWORD=${DB_PASSWORD:-}
WORKDIR=$(mktemp -d)
trap 'rm -rf "$WORKDIR"' EXIT

if [[ -z "$H2_JAR" ]]; then
  echo "H2 jar not found under ~/.m2; run 'mvn -f apps/backend/pom.xml dependency:go-offline' first" >&2
  exit 1
fi

if grep -q '\\' "$DUMP"; then
  echo "Dump contains backslash escapes; convert them manually before importing." >&2
  exit 1
fi

SCRIPT="$WORKDIR/import-h2.sql"
{
  echo "-- Generated from $(basename "$DUMP") on $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "SET REFERENTIAL_INTEGRITY FALSE;"
  # Start from a clean slate so the import is repeatable (the seeded default
  # categories from V2 are replaced by the imported ones).
  for table in transaction_tag transaction session_preferences category tag; do
    echo "DELETE FROM $table;"
  done

  # Parents before children so the data satisfies the foreign keys.
  for table in category tag transaction transaction_tag session_preferences; do
    if grep -q "^INSERT INTO \`$table\`" "$DUMP"; then
      echo "-- $table"
      grep "^INSERT INTO \`$table\`" "$DUMP" | tr -d '`'
    fi
  done

  echo "SET REFERENTIAL_INTEGRITY TRUE;"
  # Identity columns were fed explicit ids; move the sequences past them.
  for table in category tag transaction session_preferences; do
    echo "ALTER TABLE $table ALTER COLUMN id RESTART WITH (SELECT COALESCE(MAX(id), 0) + 1 FROM $table);"
  done
} > "$SCRIPT"

echo "Converted $(grep -c '^INSERT INTO' "$SCRIPT") INSERT statements"

docker run --rm \
  -v "$VOLUME":/data \
  -v "$H2_JAR":/h2.jar:ro \
  -v "$WORKDIR":/work:ro \
  eclipse-temurin:21-jre-alpine \
  java -cp /h2.jar org.h2.tools.RunScript \
  -url "jdbc:h2:file:/data/cashlog" \
  -user "$DB_USER" -password "$DB_PASSWORD" \
  -script /work/import-h2.sql

echo "Import finished into volume '$VOLUME'"
