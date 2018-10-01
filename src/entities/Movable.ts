import { Vector3, Vector2, Camera } from "three";
import { EventEmitter } from "events";
import Direction from "./Direction";

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
		const angle = cameraAdjustedDirection.angle()
		const index = Math.round((((angle < 0 ? angle + 2 * Math.PI : angle)) / (Math.PI / 2))) % 4
		this.movementDirection = [Direction.East, Direction.North, Direction.West, Direction.South][index]
	}

	protected _movementTick(d: number) {
		if (this.movement) {
			this.movement.progress = Math.min(this.movement.progress + d, this.movement.duration)
			const pos = this.position.clone().lerp(this.movement.endPos, this.movement.progress / this.movement.duration)
			this.position = pos
			if (this.movement.progress === this.movement.duration) {
				this.movement = null;
				this.emit('finishedTransition')
			}
		}
	}
}