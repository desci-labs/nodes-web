#!/bin/bash

# kill all localtunnel sessions
ps aux | grep .bin/lt | awk '{print $2}' | xargs -e kill