<script lang="ts">
	import { onMount } from 'svelte';
	import init, { convert_image } from '../../wasm/pkg/wasm';

	onMount(async () => {
		await init();
	});

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		if (e.target instanceof HTMLFormElement) {
			const fileElement = e.target.elements.namedItem('image') as HTMLInputElement;
			const file = fileElement.files?.[0];
			if (file) {
				const convertedFile = await convert_image(file);
				// ダウンロードさせる
				const url = URL.createObjectURL(convertedFile);
				const a = document.createElement('a');
				a.href = url;
				a.download = 'converted.webp';
				a.click();
			}
		}
	};
</script>

<h1>Image Optimizer</h1>
<form onsubmit={handleSubmit}>
	<label for="image">Image</label>
	<input type="file" id="image" name="image" accept="image/*" />
	<button type="submit">Submit</button>
</form>
