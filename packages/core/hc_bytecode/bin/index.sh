#! /bin/sh
 
export NODE_OPTIONS=--experimental-specifier-resolution=node 

LOC=$(dirname "$(realpath $0)")/../

node $LOC/build/cli $@