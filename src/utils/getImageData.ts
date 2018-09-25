export default function getImageData(image: HTMLImageElement) {
	const canvas: HTMLCanvasElement = document.createElement('canvas');
	canvas.width = image.width;
	canvas.height = image.height;
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Couldnt initialize canvas context for drawing map')
	}
	ctx.drawImage(image, 0, 0);
	return ctx.getImageData(0, 0, canvas.width, canvas.height);
}