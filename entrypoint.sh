#!/usr/bin/env sh

echo "Server starting"
npm run app:env:loader
current_date=$(date +%s)
# To handle browser cache generating new path in run time
sed -i "s/env.js?version=[0-9]*/env.js?version=${current_date}/g" build/index.html

#todo install storage  package based on env

npm run start:prod