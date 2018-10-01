import { Vector3 } from "three";
import { EventEmitter } from "events";

interface Movement {
	startPos: Vector3,
	endPos: Vector3,
	duration: number,
	progress: number
}

export default abstract class Movable extends EventEmitter {
	abstract get position(): Vector3
	private movement: Movement | null = null

	public moveTo(to: Vector3) {
		this.movement = {
			startPos: this.position.clone(),
			endPos: to,
			duration: 300,
			progress: 0
		}
	}
	
	protected _movementTick(d: number) {
		if (this.movement) {
			this.movement.progress = Math.min(this.movement.progress + d, this.movement.duration)
			const pos = this.position.clone().lerp(this.movement.endPos, this.movement.progress / this.movement.duration)
			this.position.set(pos.x, pos.y, pos.z)
			if (this.movement.progress === this.movement.duration) {
				this.movement = null;
				this.emit('finishedMoving')
			}
		}
	}
}