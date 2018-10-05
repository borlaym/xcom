import { Camera, Object3D, Vector3 } from "three";
import * as THREE from "three";
import Movable from "./Movable";
import rotateAroundPoint from "utils/rotateAroundPoint";

export default class GameCamera extends Movable {
	public camera: Camera;
	private following: Object3D | null

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

	get position() {
		return this.camera.position
	}

	set position(v: Vector3) {
		this.camera.position.set(v.x, v.y, v.z)
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

	public rotateLeft() {
		this.rotate(-0.05)
	}

	public rotateRight() {
		this.rotate(0.05)
	}

	public tick(d: number) {
		if (this.following) {
			const movement = this.following.position.clone().sub(this.lookingAt)
			this.position.add(movement)
		} else {
			this._movementTick(d)
		}
	}

	public follow(object: Object3D | null) {
		this.following = object
	}

	private rotate(rotation: number) {
		rotateAroundPoint(this.camera, this.lookingAt, new Vector3(0, 1, 0), rotation)
	}




}