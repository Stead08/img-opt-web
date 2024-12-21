import createModule from '@wasm/webp';
import type { MainModule } from '@wasm/webp';

let api: MainModule | null = null;

// WebAssemblyモジュールの初期化
async function initializeApi() {
  if (!api) {
    api = await createModule();
  }
  return api;
}

// 画像変換処理
async function convertToWebP(imageData: ImageData, quality: number) {
  const api = await initializeApi();
  
  const p = api._create_buffer(imageData.width, imageData.height);
  if (!p) throw new Error('Failed to allocate buffer');

  api.HEAP8.set(imageData.data, p);
  const currentQuality = Math.min(100, Math.max(0, quality));
  api._encode(p, imageData.width, imageData.height, currentQuality);

  const resultPointer = api._get_result_pointer();
  const resultSize = api._get_result_size();
  if (!resultPointer || !resultSize) throw new Error('Encoding failed');

  const resultView = new Uint8Array(api.HEAP8.buffer, resultPointer, resultSize);
  const result = new Uint8Array(resultView);

  api._free_result(resultPointer);
  api._destroy_buffer(p);

  return result;
}

self.onmessage = async (e: MessageEvent) => {
  try {
    const { imageData, quality } = e.data;
    const result = await convertToWebP(imageData, quality);
    self.postMessage({ success: true, data: result.buffer }); // 修正: result.bufferを直接送信
  } catch (error) {
    self.postMessage({ success: false, error: (error as Error).message }); // 修正: errorをError型にキャスト
  }
}; 