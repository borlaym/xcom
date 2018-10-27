import { Camera, PerspectiveCamera } from 'three';

class GameCamera {
	public readonly camera: Camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)

	get position() {
		return this.camera.position
	}
}

export default new GameCamera()