import { Camera, Object3D, Vector3 } from "three";
import * as THREE from "three";

export default class GameCamera {
	public camera: Camera;
	constructor() {
		this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
		this.camera.position.x = 16;
		this.camera.position.y = 4;
		this.camera.position.z = 18;
		this.camera.rotation.x = -Math.PI / 3
		this.camera.rotation.y = 0;
		this.camera.rotation.z = 0;
		this.camera.rotation.order = 'YXZ'
	}

	public focus(object: Object3D) {
		const cameraDirection = new Vector3()
		this.camera.getWorldDirection(cameraDirection)
		const cameraLookingAt = new Vector3()
		new THREE.Ray(this.camera.position, cameraDirection).intersectPlane(new THREE.Plane(new Vector3(0, 1, 0)), cameraLookingAt)
		const movement = object.position.clone().sub(cameraLookingAt)
		this.camera.position.add(movement)
	}
}