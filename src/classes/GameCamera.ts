import { Camera, PerspectiveCamera, Vector3, Object3D } from 'three';
import GameObject from './GameObject';
import Movement from './components/Movement';
import Transform from './components/Transform';
import * as THREE from 'three';
import rotateAroundPoint from 'utils/rotateAroundPoint';

class GameCamera extends GameObject {
	public readonly camera: Camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100)
	private following: Object3D | null

	constructor() {
		super()
		this.camera.position.x = 16;
		this.camera.position.y = 4;
		this.camera.position.z = 18;
		this.camera.rotation.x = -Math.PI / 3
		this.camera.rotation.y = 0;
		this.camera.rotation.z = 0;
		this.camera.rotation.order = 'YXZ'
		this.addComponent(new Movement())
	}

	public get position() {
		return this.camera.position
	}

	public set position(v: Vector3) {
		this.camera.position.set(v.x, v.y, v.z)
	}

	public get lookingAt(): Vector3 {
		const cameraDirection = new Vector3()
		this.camera.getWorldDirection(cameraDirection)
		const cameraLookingAt = new Vector3()
		new THREE.Ray(this.camera.position, cameraDirection).intersectPlane(new THREE.Plane(new Vector3(0, 1, 0)), cameraLookingAt)
		return cameraLookingAt
	}

	public focus(object: GameObject) {
		const movement = object.getComponent(Transform).position.clone().sub(this.lookingAt)
		this.getComponent(Movement).moveTo(this.camera.position.clone().add(movement))
	}

	public rotateLeft() {
		this.rotate(-0.05)
	}

	public rotateRight() {
		this.rotate(0.05)
	}

	public follow(object: Object3D | null) {
		this.following = object
	}

	public update(dt: number) {
		if (this.following) {
			const movement = this.following.position.clone().sub(this.lookingAt)
			this.position.add(movement)
		} else {
			this.getComponent(Movement).update(dt)
		}
	}

	private rotate(rotation: number) {
		rotateAroundPoint(this.camera, this.lookingAt, new Vector3(0, 1, 0), rotation)
	}
}

export default new GameCamera()