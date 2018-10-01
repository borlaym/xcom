import { Vector2 } from "three";
import Direction from "../entities/Direction";

export default function vectorToDirection(v: Vector2): Direction {
	const angle = v.angle()
	const index = Math.round((((angle < 0 ? angle + 2 * Math.PI : angle)) / (Math.PI / 2))) % 4
	return [Direction.East, Direction.North, Direction.West, Direction.South][index]
}