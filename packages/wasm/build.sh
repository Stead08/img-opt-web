#! /bin/bash

emcc -O3 -s WASM=1 -s EXPORTED_RUNTIME_METHODS='["cwrap"]' \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s EXPORT_ALL=1 \
    -s EXPORT_NAME="createModule" \
    -s EXPORT_ES6=1 \
    -I ../libwebp \
    --emit-tsd webp.wasm.d.ts \
    -o pkg/webp.wasm.mjs \
    webp.c \
    ../libwebp/src/{dec,dsp,demux,enc,mux,utils}/*.c \
    ../libwebp/sharpyuv/*.c