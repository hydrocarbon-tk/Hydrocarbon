#! /bin/bash

echo "Installing Emscripten SDK"

git clone https://github.com/emscripten-core/emsdk.git ./build/emsdk

cd ./build/emsdk

git pull

./emsdk install latest

./emsdk activate latest
