import { Vector3, Vector2, Camera } from "three";
import { EventEmitter } from "events";
import Direction from "./Direction";
import vectorToDirection from "utils/vectorToDirection";

interface Movement {
	startPos: Vector3,
	endPos: Vector3,
	duration: number,
	progress: number
}

export default abstract class Movable extends EventEmitter {
	abstract get position(): Vector3
	abstract set position(v: Vector3)
	abstract get camera(): Camera
	protected movementDirection: Direction = Direction.South
	private movement: Movement | null = null

	public moveTo(to: Vector3, duration = 300) {
		this.movement = {
			startPos: this.position.clone(),
			endPos: to,
			duration,
			progress: 0
		}

		const movementDirection = to.clone().sub(this.position.clone())
		const cameraAdjustedDirection = (new Vector2(movementDirection.x, -movementDirection.z)).rotateAround(new Vector2(0, 0), -this.camera.rotation.y)
		this.movementDirection = vectorToDirection(cameraAdjustedDirection)
	}

	protected _movementTick(d: number) {
		if (this.movement) {
			const progress = Math.min(this.movement.progress + d, this.movement.duration)
			const leftOver = this.movement.progress + d - this.movement.duration
			this.movement.progress = progress
			const pos = this.position.clone().lerp(this.movement.endPos, progress / this.movement.duration)
			this.position = pos
			if (this.movement.progress === this.movement.duration) {
				this.movement = null;
				this.emit('finishedTransition', leftOver)
			}
		}
	}
}