#! /bin/bash

source ./build/emsdk/emsdk_env.sh

TEMP_NAME=$1
OUT_NAME=$2

>&2 echo "TempName:"
>&2 echo $TEMP_NAME
>&2 echo "OutName:"
>&2 echo $OUT_NAME

emcc $TEMP_NAME \
    -O3 \
    -g2 \
    -s ALLOW_MEMORY_GROWTH=1 \
    --no-entry \
    -s EXPORTED_FUNCTIONS='["_init_data","_get_next_command_block","_init_table","_get_fork_pointers","_recognize"]'\
    -o $OUT_NAME


