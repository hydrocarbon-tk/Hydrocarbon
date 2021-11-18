#! /usr/bin/bash

# A small script to start a sperate build TypeScript build process for 
# each of the TypeScript packages within this repo. Utilizes Linux,
# BASH, & Tmux to run each tsc process in a seperate shell. 


declare -A ts_packages

ts_packages[asytrip]="packages/core/hc_asytrip"
ts_packages[bytecode]="packages/core/hc_bytecode"
ts_packages[grammar]="packages/core/hc_grammar"
ts_packages[root]="packages/core/hc_root"
ts_packages[tools]="packages/core/hc_tools"
ts_packages[ts_common]="packages/core/hc_ts_common"
ts_packages[rt_ts]="packages/rt_typescript"


LOC=$(dirname "$(realpath $0)")/../

echo $LOC

tmux new-session -t HC_ROOT_BUILD -d 
tmux select-layout -t HC_ROOT_BUILD tiled
tmux set -t HC_ROOT_BUILD -g mouse on

for key in "${!ts_packages[@]}"; do
  tmux new-window -t HC_ROOT_BUILD -n $key "tsc --watch  -p $LOC/${ts_packages[$key]}/tsconfig.json"
done