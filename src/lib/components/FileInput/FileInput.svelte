<script lang="ts">
	export let handleFileChange: (file: File) => void;
</script>

<div class="input-group">
	<label for="file-input">PNGまたはJPEG画像を選択:</label>
	<input
		type="file"
		id="file-input"
		accept="image/png, image/jpeg, image/jpg"
		onchange={(e) => {
			const file = e.currentTarget.files?.[0];
			if (file) handleFileChange(file);
		}}
	/>
</div>

<style>
	.input-group {
		margin: 10px 0;
	}

	.input-group label {
		display: block;
		margin-bottom: 5px;
	}
</style>
