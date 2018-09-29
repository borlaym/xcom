import { Vector3 } from "three";
import Direction from "../entities/Direction";

export function directionToVector(direction: Direction) {
	const position = new Vector3(0, 0, 0)
	switch (direction) {
		case Direction.North:
			position.z = -1;
			break;
		case Direction.South:
			position.z = 1;
			break;
		case Direction.East:
			position.x = 1;
			break;
		case Direction.West:
			position.x = -1;
			break
	}
	return position
}
