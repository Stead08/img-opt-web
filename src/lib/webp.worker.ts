import createModule from '@wasm/webp';

let wasmModule: any;

createModule().then((module) => {
	wasmModule = module;
});

self.onmessage = async (e) => {
	try {
		if (!wasmModule) {
			throw new Error('WASM module not initialized');
		}

		const { imageData, quality, isLossless } = e.data;
		const p = wasmModule._create_buffer(imageData.width, imageData.height);
		
		if (!p) {
			throw new Error('Failed to allocate buffer');
		}

		wasmModule.HEAP8.set(imageData.data, p);

		if (isLossless) {
			// ロスレスエンコード
			wasmModule._lossless_encode(p, imageData.width, imageData.height);
		} else {
			// 通常のエンコード（品質指定あり）
			wasmModule._encode(p, imageData.width, imageData.height, quality);
		}

		const resultPointer = wasmModule._get_result_pointer();
		const resultSize = wasmModule._get_result_size();

		if (!resultPointer || !resultSize) {
			throw new Error('Encoding failed');
		}

		const result = new Uint8Array(wasmModule.HEAP8.buffer, resultPointer, resultSize);
		const resultCopy = new Uint8Array(result);

		wasmModule._free_result(resultPointer);
		wasmModule._destroy_buffer(p);

		self.postMessage({ success: true, data: resultCopy }, { transfer: [resultCopy.buffer] });
	} catch (error) {
		self.postMessage({ success: false, error: (error as Error).message });
	}
};
