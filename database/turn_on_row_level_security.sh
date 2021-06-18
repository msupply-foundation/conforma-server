#!/bin/bash
# Turn on Row-level Security
echo -e "\nEnabling Row-level Security..."
psql -U postgres -q -b -d tmf_app_manager -f "./database/turn_on_row_level_security.sql"