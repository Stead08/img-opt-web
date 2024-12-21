<script>
	import { onMount } from 'svelte';
	import createModule from '../lib/a.out.js';

	let api;
	let inputImage;
	let outputImage;
	let currentBlobURL;
	let quality = 80; // デフォルト値

	onMount(async () => {
		api = await createModule();
		console.log(api);
	});

	const downloadWebP = () => {
		if (!currentBlobURL) return;
		const a = document.createElement('a');
		a.href = currentBlobURL;
		a.download = 'converted.webp';
		a.click();
	};

	// async function loadImage(src) {
	// 	async function loadImage(src) {
	// 		const imgBlob = await fetch(src).then((resp) => resp.blob());
	// 		const img = await createImageBitmap(imgBlob);
	// 		const canvas = document.createElement('canvas');
	// 		canvas.width = img.width;
	// 		canvas.height = img.height;
	// 		const ctx = canvas.getContext('2d');
	// 		ctx.drawImage(img, 0, 0);
	// 		return ctx.getImageData(0, 0, img.width, img.height);
	// 	}

	// 	async function convertToWebP(imageFile) {
	// 		try {
	// 			if (!api || !Module) {
	// 				throw new Error('WebAssembly module not initialized');
	// 			}

	// 			const image = await loadImage(URL.createObjectURL(imageFile));

	// 			const p = api.create_buffer(image.width, image.height);
	// 			if (!p) throw new Error('Failed to allocate buffer');

	// 			Module.HEAP8.set(image.data, p);

	// 			// クオリティを0-100の範囲に制限
	// 			const currentQuality = Math.min(100, Math.max(0, quality));
	// 			api.encode(p, image.width, image.height, currentQuality);
	// 			const resultPointer = api.get_result_pointer();
	// 			const resultSize = api.get_result_size();

	// 			if (!resultPointer || !resultSize) {
	// 				throw new Error('Encoding failed');
	// 			}

	// 			const resultView = new Uint8Array(Module.HEAP8.buffer, resultPointer, resultSize);
	// 			const result = new Uint8Array(resultView);

	// 			api.free_result(resultPointer);
	// 			api.destroy_buffer(p);

	// 			// 古いBlobURLを解放
	// 			if (currentBlobURL) {
	// 				URL.revokeObjectURL(currentBlobURL);
	// 			}

	// 			const blob = new Blob([result], { type: 'image/webp' });
	// 			currentBlobURL = URL.createObjectURL(blob);
	// 			outputImage.src = currentBlobURL;

	// 			// ダウンロードボタンを有効化
	// 			const downloadBtn = document.getElementById('download-btn');
	// 			downloadBtn.disabled = false;
	// 		} catch (error) {
	// 			console.error('Failed to convert image:', error);
	// 			alert('画像の変換に失敗しました。');
	// 		}
	// 	}

	// 	function downloadWebP() {
	// 		if (!currentBlobURL) return;
	// 		const a = document.createElement('a');
	// 		a.href = currentBlobURL;
	// 		a.download = 'converted.webp';
	// 		a.click();
	// 	}

	// 	// 初期化処理
	// 	const initModule = () => {
	// 		api = {
	// 			version: Module.cwrap('version', 'number', []),
	// 			create_buffer: Module.cwrap('create_buffer', 'number', ['number', 'number']),
	// 			destroy_buffer: Module.cwrap('destroy_buffer', '', ['number']),
	// 			encode: Module.cwrap('encode', '', ['number', 'number', 'number', 'number']),
	// 			free_result: Module.cwrap('free_result', '', ['number']),
	// 			get_result_pointer: Module.cwrap('get_result_pointer', 'number', []),
	// 			get_result_size: Module.cwrap('get_result_size', 'number', [])
	// 		};
	// 		console.log('WebAssembly module initialized:', api.version());
	// 	};

	// 	// DOMの準備完了後に実行
	// 	document.addEventListener('DOMContentLoaded', () => {
	// 		inputImage = document.getElementById('input-image');
	// 		outputImage = document.getElementById('output-image');

	// 		const fileInput = document.getElementById('file-input');
	// 		const qualityInput = document.getElementById('quality-input');
	// 		const qualityValue = document.getElementById('quality-value');

	// 		fileInput.addEventListener('change', (event) => {
	// 			if (event.target.files && event.target.files[0]) {
	// 				const file = event.target.files[0];
	// 				inputImage.src = URL.createObjectURL(file);
	// 				convertToWebP(file);
	// 			}
	// 		});

	// 		qualityInput.addEventListener('input', updateQuality);
	// 		document.getElementById('quality-number').addEventListener('input', updateQuality);

	// 		function updateQuality(event) {
	// 			quality = Number(event.target.value);
	// 			// 値を0-100の範囲に制限
	// 			quality = Math.min(100, Math.max(0, quality));

	// 			// 両方の入力要素を更新
	// 			qualityInput.value = quality;
	// 			document.getElementById('quality-number').value = quality;
	// 			qualityValue.textContent = quality;

	// 			const file = fileInput.files?.[0];
	// 			if (file) {
	// 				convertToWebP(file);
	// 			}
	// 		}

	// 		// Moduleの初期化を待つ
	// 		if (Module.calledRun) {
	// 			initModule();
	// 		} else {
	// 			Module.onRuntimeInitialized = initModule;
	// 		}
	// 	});
</script>

<h1>WebP Encoder</h1>

<div class="controls">
	<div class="input-group">
		<label for="file-input">PNG画像を選択:</label>
		<input type="file" accept="image/png" id="file-input" />
	</div>

	<div class="input-group">
		<label for="quality-input">品質 (<span id="quality-value">80</span>):</label>
		<div class="quality-controls">
			<input type="range" id="quality-input" min="0" max="100" value="80" step="1" />
			<input
				type="number"
				id="quality-number"
				min="0"
				max="100"
				value="80"
				class="quality-number"
			/>
		</div>
	</div>

	<button id="download-btn" onclick={downloadWebP} disabled> WebPをダウンロード </button>
</div>

<div class="image-container">
	<div>
		<h3>入力画像:</h3>
		<img id="input-image" alt="入力画像" />
	</div>
	<div>
		<h3>WebP出力:</h3>
		<img id="output-image" alt="WebP出力" />
	</div>
</div>

<style>
	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 20px;
	}

	.controls {
		margin: 20px 0;
		padding: 20px;
		background: #f5f5f5;
		border-radius: 8px;
	}

	.input-group {
		margin: 10px 0;
	}

	.input-group label {
		display: block;
		margin-bottom: 5px;
	}

	#quality-input {
		width: 200px;
	}

	button {
		margin-top: 10px;
		padding: 8px 16px;
		background: #4caf50;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}

	button:disabled {
		background: #cccccc;
		cursor: not-allowed;
	}

	button:hover:not(:disabled) {
		background: #45a049;
	}

	.image-container {
		display: flex;
		gap: 20px;
		margin-top: 20px;
	}

	img {
		max-width: 500px;
		height: auto;
	}

	.quality-controls {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.quality-number {
		width: 60px;
		padding: 4px;
		border: 1px solid #ccc;
		border-radius: 4px;
	}
</style>
