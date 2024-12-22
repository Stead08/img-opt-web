<script lang="ts">
	export let quality: number;
	export let isLossless: boolean;
	export let isDisabled: boolean;
	export let handleQualityChange: (quality: number) => void;
	export let handleLosslessChange: (isLossless: boolean) => void;
</script>

<div class="encoding-options">
	<div class="option-group">
		<label class="lossless-label">
			<input
				type="checkbox"
				bind:checked={isLossless}
				on:change={(e) => handleLosslessChange(e.currentTarget.checked)}
				disabled={isDisabled}
			/>
			ロスレス圧縮を使用
		</label>
		<span class="tooltip">画質を損なわない圧縮方式です。ファイルサイズは大きくなります。</span>
	</div>

	<div class="option-group" class:disabled={isLossless}>
		<label for="quality-input">品質 ({quality}):</label>
		<div class="quality-controls">
			<input
				type="range"
				id="quality-input"
				min="0"
				max="100"
				value={quality}
				on:input={(e) => handleQualityChange(parseInt(e.currentTarget.value))}
				disabled={isDisabled || isLossless}
			/>
			<input
				type="number"
				id="quality-number"
				min="0"
				max="100"
				value={quality}
				on:input={(e) => handleQualityChange(parseInt(e.currentTarget.value))}
				class="quality-number"
				disabled={isDisabled || isLossless}
			/>
		</div>
	</div>
</div>

<style>
	.encoding-options {
		margin: 10px 0;
	}

	.option-group {
		margin: 10px 0;
	}

	.option-group.disabled {
		opacity: 0.5;
	}

	.lossless-label {
		display: flex;
		align-items: center;
		gap: 8px;
		cursor: pointer;
	}

	.tooltip {
		margin-left: 8px;
		font-size: 0.9em;
		color: #666;
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

	#quality-input {
		width: 200px;
	}

	label {
		display: block;
		margin-bottom: 5px;
	}
</style>
