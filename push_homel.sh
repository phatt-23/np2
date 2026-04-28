#!/bin/env bash

npm run build
scp -r build/* homel:~/public_html/





