export default function loadImage(filename: string): Promise<HTMLImageElement> {
	return new Promise(resolve => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.src =filename
	})
}