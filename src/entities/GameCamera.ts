import { Camera, Object3D, Vector3 } from "three";
import * as THREE from "three";
import { EventEmitter } from "events";

interface Movement {
	startPos: Vector3,
	endPos: Vector3,
	duration: number,
	progress: number
}

export default class GameCamera extends EventEmitter {
	public camera: Camera;
	private movement: Movement | null = null
	constructor() {
		super()
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
		const movement = object.position.clone().sub(this.lookingAt)
		this.moveTo(this.camera.position.clone().add(movement))
	}

	public get lookingAt(): Vector3 {
		const cameraDirection = new Vector3()
		this.camera.getWorldDirection(cameraDirection)
		const cameraLookingAt = new Vector3()
		new THREE.Ray(this.camera.position, cameraDirection).intersectPlane(new THREE.Plane(new Vector3(0, 1, 0)), cameraLookingAt)
		return cameraLookingAt
	}

	public moveTo(to: Vector3) {
		this.movement = {
			startPos: this.camera.position.clone(),
			endPos: to,
			duration: 300,
			progress: 0
		}
		console.log(this.movement)
	}

	public tick(d: number) {
		if (this.movement) {
			this.movement.progress = Math.min(this.movement.progress + d, this.movement.duration)
			const pos = this.camera.position.clone().lerp(this.movement.endPos, this.movement.progress / this.movement.duration)
			this.camera.position.set(pos.x, pos.y, pos.z)
			if (this.movement.progress === this.movement.duration) {
				this.movement = null;
				this.emit('finishedMoving')
			}
		}
	}

}