import ICoordinate from "./Coordinate";
import { Vector3 } from "three";
import Character from "./Character";

const SPEED = 0.1;

export default class GameState {
	public keysDown: string[] = []
	public mousePos: ICoordinate = {
		x: 0,
		y: 0
	};
	public characterPos: ICoordinate = {
		x: 16,
		y: 16
	};
	public highlighted: ICoordinate | null = null;
	public characters: Character[]

	public onMouseMove(event: MouseEvent) {
		this.mousePos.x = (event.clientX / window.innerWidth) * 2 - 1
		this.mousePos.y = - (event.clientY / window.innerHeight) * 2 + 1;
	}

	public get motion(): Vector3 {
		const motion = new Vector3(0, 0, 0);
		if (this.keysDown.indexOf('w') > -1) {
			motion.z -= SPEED;
		}
		if (this.keysDown.indexOf('s') > -1) {
			motion.z += SPEED;
		}
		if (this.keysDown.indexOf('a') > -1) {
			motion.x -= SPEED;
		}
		if (this.keysDown.indexOf('d') > -1) {
			motion.x += SPEED;
		}
		return motion
	}
}