export interface WebpEncoderState {
	inputImage: HTMLImageElement | null;
	outputImage: HTMLImageElement | null;
	currentBlobURL: string | null;
	quality: number;
	isLossless: boolean;
	isLoading: boolean;
	currentFile: File | null;
	originalSize: string;
	convertedSize: string;
	worker: Worker | null;
	debounceTimer: number | null;
}
