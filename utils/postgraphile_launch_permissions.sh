#TO-DO: Replace string with variable for DB name

npx postgraphile -c "postgres://postgres@localhost/tmf_app_manager" -r graphile_user -C postgres --watch 