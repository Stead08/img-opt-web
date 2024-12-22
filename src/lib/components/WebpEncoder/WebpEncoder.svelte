<script lang="ts">
	import type { WebpEncoderState } from './types';
	import FileInput from '$lib/components/FileInput/FileInput.svelte';
	import EncodingOptions from '$lib/components/EncodingOptions/EncodingOptions.svelte';
	import ImagePreview from '$lib/components/ImagePreview/ImagePreview.svelte';
	import WebpWorker from '$lib/webp.worker.ts?worker';
	import { formatFileSize } from '$lib/utils/formatters';

	let state = $state<WebpEncoderState>({
		inputImage: null,
		outputImage: null,
		currentBlobURL: null,
		quality: 80,
		isLossless: false,
		isLoading: false,
		currentFile: null,
		originalSize: '',
		convertedSize: '',
		worker: null,
		debounceTimer: null
	});

	// WebWorkerの初期化
	$effect(() => {
		state.worker = new WebpWorker();
		return () => {
			state.worker?.terminate();
			if (state.debounceTimer !== null) {
				clearTimeout(state.debounceTimer);
			}
		};
	});

	async function handleFileChange(file: File) {
		state.currentFile = file;
		state.originalSize = formatFileSize(file.size);
		if (state.inputImage) state.inputImage.src = URL.createObjectURL(file);
		await convertToWebP(file);
	}

	async function handleQualityChange(newQuality: number) {
		state.quality = newQuality;

		if (state.debounceTimer !== null) {
			clearTimeout(state.debounceTimer);
		}

		state.debounceTimer = window.setTimeout(async () => {
			if (state.currentFile && !state.isLoading) {
				await convertToWebP(state.currentFile);
			}
			state.debounceTimer = null;
		}, 200);
	}

	async function convertToWebP(imageFile: File) {
		if (!state.worker) return;
		state.isLoading = true;

		try {
			const image = await loadImage(URL.createObjectURL(imageFile));

			return new Promise((resolve, reject) => {
				state.worker!.onmessage = (e) => {
					try {
						if (e.data.success) {
							const result = e.data.data;
							if (state.currentBlobURL) URL.revokeObjectURL(state.currentBlobURL);
							const blob = new Blob([result], { type: 'image/webp' });
							state.currentBlobURL = URL.createObjectURL(blob);
							if (state.outputImage) state.outputImage.src = state.currentBlobURL;
							state.convertedSize = formatFileSize(blob.size);
							console.log('WebP画像が正常に生成されました。');
							resolve(null);
						} else {
							reject(new Error(e.data.error));
						}
					} finally {
						state.isLoading = false;
					}
				};

				state.worker!.postMessage({
					imageData: image,
					quality: state.quality,
					isLossless: state.isLossless
				});
			});
		} catch (error) {
			console.error('Failed to convert image:', error);
			alert('画像の変換に失敗しました。');
			state.isLoading = false;
			throw error;
		}
	}

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

	function handleDownload() {
		if (!state.currentBlobURL) return;
		const a = document.createElement('a');
		a.href = state.currentBlobURL;
		a.download = state.currentFile?.name.replace(/\.[^.]+$/, '') + '.webp';
		a.click();
	}

	function handleLosslessChange(isLossless: boolean) {
		state.isLossless = isLossless;
		if (state.currentFile) {
			convertToWebP(state.currentFile);
		}
	}
</script>

<div class="container">
	<hgroup>
		<h1>WebP Encoder</h1>
		<p>PNGまたはJPEG画像をWebP形式に変換します。</p>
	</hgroup>
	<article>
		<p class="warning">
			高圧縮のjpeg画像をwebpに変換する場合、場合によってはファイルサイズが大きくなることがあります。
		</p>
	</article>

	<div class="controls">
		<FileInput {handleFileChange} />

		<EncodingOptions
			quality={state.quality}
			isLossless={state.isLossless}
			isDisabled={!state.currentFile || state.isLoading}
			{handleQualityChange}
			{handleLosslessChange}
		/>

		<button onclick={handleDownload} disabled={!state.currentBlobURL || state.isLoading}>
			{state.isLoading ? '変換中...' : 'WebPをダウンロード'}
		</button>
	</div>

	<div class="image-container">
		<ImagePreview type="input" bind:image={state.inputImage} fileSize={state.originalSize} />
		<ImagePreview
			type="output"
			bind:image={state.outputImage}
			fileSize={state.convertedSize}
			originalSize={state.originalSize}
		/>
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

	.image-container {
		display: flex;
		gap: 20px;
		margin-top: 20px;
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

	.warning {
		color: #ff0000;
	}
</style>
