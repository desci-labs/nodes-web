#!/bin/bash
## proxy the frontend AND the backend to localtunnel, useful for full stack local testing on another device

# we create a localtunnel URL unique to your ip
IP_SAFE=$(ifconfig | grep inet | awk '{print $2}' | head -n 1 | sed -e s/\\./-/g)
LT_SERVER=https://nodeserver-$IP_SAFE.loca.lt
LT_DAPP=https://dapp-$IP_SAFE.loca.lt 
LT_CHAIN=https://chain-$IP_SAFE.loca.lt 
LT_IPFS=https://ipfs-$IP_SAFE.loca.lt
nohup npx localtunnel -p 5420 --subdomain nodeserver-$IP_SAFE 0<&- &>/dev/null &
nohup npx localtunnel -p 8545 --subdomain chain-$IP_SAFE 0<&- &>/dev/null &
nohup npx localtunnel -p 3000 --subdomain dapp-$IP_SAFE 0<&- &>/dev/null &
nohup npx localtunnel -p 8089 --subdomain ipfs-$IP_SAFE 0<&- &>/dev/null &

echo You have 5 seconds to note these URLs.
echo
echo Visit them first to make sure you are whitelisted.
echo Make sure you run "yarn tunnel:stop" when finished
echo
echo $LT_DAPP
echo $LT_SERVER
echo $LT_CHAIN
echo $LT_IPFS
sleep 5
BROWSER=none REACT_APP_DEFAULT_RPC_URL=$LT_CHAIN REACT_APP_NODES_API=$LT_SERVER REACT_APP_IPFS_RESOLVER_OVERRIDE=$LT_IPFS/ipfs npx craco start