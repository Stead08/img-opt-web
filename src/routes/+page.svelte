<script lang="ts">
	import WebpWorker from '$lib/webp.worker.ts?worker';

	let inputImage = $state<HTMLImageElement | null>(null);
	let outputImage = $state<HTMLImageElement | null>(null);
	let currentBlobURL = $state<string | null>(null);
	let quality = $state(80);
	let isLoading = $state(false);

	// WebWorkerのインスタンス
	let worker = $state<Worker | null>(null);

	// WebWorkerの初期化
	$effect(() => {
		worker = new WebpWorker();

		return () => {
			worker?.terminate();
		};
	});

	// 画像変換処理
	async function convertToWebP(imageFile: File) {
		if (!worker) return;
		isLoading = true;

		try {
			const image = await loadImage(URL.createObjectURL(imageFile));

			return new Promise((resolve, reject) => {
				worker!.onmessage = (e) => {
					try {
						if (e.data.success) {
							const result = e.data.data;
							if (currentBlobURL) URL.revokeObjectURL(currentBlobURL);
							const blob = new Blob([result], { type: 'image/webp' });
							currentBlobURL = URL.createObjectURL(blob);
							if (outputImage) outputImage.src = currentBlobURL;
							console.log('WebP画像が正常に生成されました。');
							isLoading = false;
							resolve(null);
						} else {
							reject(new Error(e.data.error));
						}
					} finally {
						isLoading = false;
					}
				};

				worker!.onerror = (error) => {
					isLoading = false;
					reject(error);
				};

				worker!.postMessage({
					imageData: image,
					quality
				});
			});
		} catch (error) {
			console.error('Failed to convert image:', error);
			alert('画像の変換に失敗しました。');
			isLoading = false;
			throw error;
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
		a.download = currentFile?.name.replace(/\.[^.]+$/, '') + '.webp';
		a.click();
	}

	// 現在の入力ファイルを保持する変数を追加
	let currentFile = $state<File | null>(null);

	// ファイル選択時の処理を関数として定義
	async function handleFileChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (file) {
			currentFile = file;
			if (inputImage) inputImage.src = URL.createObjectURL(file);
			await convertToWebP(file);
		}
	}

	// デバウンス用のタイマーID
	let debounceTimer: number | null = null;

	// 品質値が変更された時の処理をデバウンス付きのイベントハンドラとして実装
	async function handleQualityChange(newQuality: number) {
		quality = newQuality; // UIの更新はすぐに行う

		// 既存のタイマーをクリア
		if (debounceTimer !== null) {
			clearTimeout(debounceTimer);
		}

		// 新しいタイマーをセット
		debounceTimer = window.setTimeout(async () => {
			if (currentFile && !isLoading) {
				await convertToWebP(currentFile);
			}
			debounceTimer = null;
		}, 200); // 200ミリ秒のデバウンス
	}

	// コンポーネントのクリーンアップ
	$effect(() => {
		return () => {
			if (debounceTimer !== null) {
				clearTimeout(debounceTimer);
			}
		};
	});
</script>

<div class="container">
	<hgroup>
		<h1>WebP Encoder</h1>
		<p>WebP画像をPNGまたはJPEG画像に変換します。</p>
	</hgroup>
	<div class="controls">
		<div class="input-group">
			<label for="file-input">PNGまたはJPEG画像を選択:</label>
			<input
				type="file"
				id="file-input"
				accept="image/png, image/jpeg, image/jpg"
				onchange={handleFileChange}
			/>
		</div>

		<div class="input-group">
			<label for="quality-input">品質 ({quality}):</label>
			<div class="quality-controls">
				<input
					type="range"
					id="quality-input"
					min="0"
					max="100"
					value={quality}
					oninput={(e) => handleQualityChange(parseInt(e.currentTarget.value))}
					disabled={!currentFile || isLoading}
				/>
				<input
					type="number"
					id="quality-number"
					min="0"
					max="100"
					value={quality}
					oninput={(e) => handleQualityChange(parseInt(e.currentTarget.value))}
					class="quality-number"
					disabled={!currentFile || isLoading}
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
