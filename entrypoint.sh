#!/usr/bin/env sh

echo "Server starting"

sed -i 's/env.js?version=[0-9]*/env.js?version=11111/g' public/index.html

npm run start:prod