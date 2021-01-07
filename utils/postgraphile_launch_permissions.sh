#TO-DO: Replace string with variable for DB name

# Note `graphile_user` instead of postgres
npx postgraphile -c "postgres://graphile_user@localhost/tmf_app_manager" -C postgres --watch