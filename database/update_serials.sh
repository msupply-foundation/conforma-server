#!/bin/bash
# Reset serial numbers
echo "\nUpdating serials..."

psql -U postgres  -Atq  -d tmf_app_manager -f './database/reset_serial.sql' -o './database/temp.sql'
psql -U postgres -d tmf_app_manager -f './database/temp.sql' >&/dev/null
rm './database/temp.sql'

