<script lang="ts">
	export let type: 'input' | 'output';
	export let image: HTMLImageElement | null;
	export let fileSize: string;
	export let originalSize: string | undefined = undefined;
</script>

<div>
	<h2 class="image-preview-head">{type === 'input' ? '入力画像:' : 'WebP出力:'}</h2>
	<img bind:this={image} alt={type === 'input' ? '入力画像' : 'WebP出力'} width="500" height="300"/>
	{#if fileSize}
		<p class="file-size">
			サイズ: {fileSize}
			{#if type === 'output' && originalSize && fileSize}
				<span class="compression-rate">
					(圧縮率: {Math.round(
						(1 - Number(fileSize.split(' ')[0]) / Number(originalSize.split(' ')[0])) * 100
					)}%)
				</span>
			{/if}
		</p>
	{/if}
</div>

<style>
	img {
		max-width: 500px;
		height: auto;
	}

	.image-preview-head {
		font-size: 1.2em;
	}

	.file-size {
		margin-top: 8px;
		font-size: 0.9em;
		color: #666;
	}

	.compression-rate {
		margin-left: 8px;
		color: #4caf50;
		font-weight: bold;
	}
</style>
