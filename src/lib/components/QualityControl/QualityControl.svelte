<script lang="ts">
	export let quality: number;
	export let isDisabled: boolean;
	export let handleQualityChange: (quality: number) => void;
</script>

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
			disabled={isDisabled}
		/>
		<input
			type="number"
			id="quality-number"
			min="0"
			max="100"
			value={quality}
			oninput={(e) => handleQualityChange(parseInt(e.currentTarget.value))}
			class="quality-number"
			disabled={isDisabled}
		/>
	</div>
</div>

<style>
	.input-group {
		margin: 10px 0;
	}

	.input-group label {
		display: block;
		margin-bottom: 5px;
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
</style>
