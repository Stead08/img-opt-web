#include "emscripten.h"
#include "src/webp/encode.h"
#include <stdlib.h>

int result[2];

EMSCRIPTEN_KEEPALIVE
int version() {
  return WebPGetEncoderVersion();
}

EMSCRIPTEN_KEEPALIVE
uint8_t* create_buffer(int width, int height) {
  if (width <= 0 || height <= 0 || 
      width > 16384 || height > 16384) {
    return NULL;
  }
  
  size_t size;
  if (__builtin_mul_overflow(width, height, &size) ||
      __builtin_mul_overflow(size, 4, &size)) {
    return NULL;
  }
  
  uint8_t* buffer = (uint8_t*)calloc(1, size);
  if (!buffer) {
    return NULL;
  }
  
  return buffer;
}

EMSCRIPTEN_KEEPALIVE
void destroy_buffer(uint8_t* p) {
  if (p) {
    free(p);
  }
}

EMSCRIPTEN_KEEPALIVE
void encode(uint8_t* img_in, int width, int height, float quality) {
  if (!img_in || width <= 0 || height <= 0) {
    result[0] = 0;
    result[1] = 0;
    return;
  }

  uint8_t* img_out = NULL;
  size_t size = WebPEncodeRGBA(img_in, width, height, width * 4, quality, &img_out);

  if (size == 0 || !img_out) {
    result[0] = 0;
    result[1] = 0;
    return;
  }

  result[0] = (int)img_out;
  result[1] = size;
}

EMSCRIPTEN_KEEPALIVE
void free_result(uint8_t* result) {
  if (result) {
    WebPFree(result);
  }
}

EMSCRIPTEN_KEEPALIVE
int get_result_pointer() {
  return result[0];
}

EMSCRIPTEN_KEEPALIVE
int get_result_size() {
  return result[1];
}
