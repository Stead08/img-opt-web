<script lang="ts">
	import createModule from '@wasm/webp';
	import type { MainModule } from '@wasm/webp';

	let api = $state<MainModule | null>(null);
	let inputImage = $state<HTMLImageElement | null>(null);
	let outputImage = $state<HTMLImageElement | null>(null);
	let currentBlobURL = $state<string | null>(null);
	let quality = $state(80);
	let isLoading = $state(false);

	// WebAssemblyモジュールの初期化
	$effect(() => {
		(async () => {
			try {
				api = await createModule();
				console.log('WebAssembly module initialized:', api._version());
			} catch (error) {
				console.error('Failed to initialize WebAssembly module:', error);
			}
		})();
	});

	// 画像変換処理
	async function convertToWebP(imageFile: File) {
		if (!api) return;
		isLoading = true;

		try {
			const image = await loadImage(URL.createObjectURL(imageFile));
			const p = api._create_buffer(image.width, image.height);
			if (!p) throw new Error('Failed to allocate buffer');

			api.HEAP8.set(image.data, p);
			const currentQuality = Math.min(100, Math.max(0, quality));
			api._encode(p, image.width, image.height, currentQuality);

			const resultPointer = api._get_result_pointer();
			const resultSize = api._get_result_size();
			if (!resultPointer || !resultSize) throw new Error('Encoding failed');

			const resultView = new Uint8Array(api.HEAP8.buffer, resultPointer, resultSize);
			const result = new Uint8Array(resultView);

			api._free_result(resultPointer);
			api._destroy_buffer(p);

			if (currentBlobURL) URL.revokeObjectURL(currentBlobURL);
			const blob = new Blob([result], { type: 'image/webp' });
			currentBlobURL = URL.createObjectURL(blob);
			if (outputImage) outputImage.src = currentBlobURL;
		} catch (error) {
			console.error('Failed to convert image:', error);
			alert('画像の変換に失敗しました。');
		} finally {
			isLoading = false;
		}
	}

	// 画像の読み込み処理
	async function loadImage(src: string) {
		const imgBlob = await fetch(src).then((resp) => resp.blob());
		const img = await createImageBitmap(imgBlob);
		const canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Failed to get context');
		ctx.drawImage(img, 0, 0);
		return ctx.getImageData(0, 0, img.width, img.height);
	}

	// ダウンロード処理
	function downloadWebP() {
		if (!currentBlobURL) return;
		const a = document.createElement('a');
		a.href = currentBlobURL;
		a.download = 'converted.webp';
		a.click();
	}

	// 品質値が変更された時の処理
	$effect(() => {
		const file = document.querySelector<HTMLInputElement>('#file-input')?.files?.[0];
		if (file) convertToWebP(file);
	});
</script>

<div class="container">
	<h1>WebP Encoder</h1>

	<div class="controls">
		<div class="input-group">
			<label for="file-input">PNG画像を選択:</label>
			<input
				type="file"
				id="file-input"
				accept="image/png"
				onchange={(e) => {
					const file = e.currentTarget.files?.[0];
					if (file) {
						if (inputImage) inputImage.src = URL.createObjectURL(file);
						convertToWebP(file);
					}
				}}
			/>
		</div>

		<div class="input-group">
			<label for="quality-input">品質 ({quality}):</label>
			<div class="quality-controls">
				<input type="range" id="quality-input" min="0" max="100" bind:value={quality} />
				<input
					type="number"
					id="quality-number"
					min="0"
					max="100"
					bind:value={quality}
					class="quality-number"
				/>
			</div>
		</div>

		<button onclick={downloadWebP} disabled={!currentBlobURL || isLoading}>
			{isLoading ? '変換中...' : 'WebPをダウンロード'}
		</button>
	</div>

	<div class="image-container">
		<div>
			<h3>入力画像:</h3>
			<img bind:this={inputImage} alt="入力画像" />
		</div>
		<div>
			<h3>WebP出力:</h3>
			<img bind:this={outputImage} alt="WebP出力" />
		</div>
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
