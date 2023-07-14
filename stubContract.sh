#!/bin/bash
mkdir -p ./src/desci-contracts-config

STUB="{\"proxies\":[{\"address\":\"\"}]}"
[ ! -f "./src/desci-contracts-config/unknown-1337.json" ] && echo $STUB > ./src/desci-contracts-config/unknown-1337.json
[ ! -f "./src/desci-contracts-config/unknown-research-object.json" ] && echo $STUB > ./src/desci-contracts-config/unknown-research-object.json
[ ! -f "./src/desci-contracts-config/unknown-dpid.json" ] && echo $STUB > ./src/desci-contracts-config/unknown-dpid.json

echo "done"
