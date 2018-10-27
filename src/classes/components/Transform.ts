import Component from '../Component';
import { Vector3, Euler } from 'three';

export default class Transform extends Component {
	public position: Vector3 = new Vector3()
	public rotation: Euler = new Euler()
	public scale: Vector3 = new Vector3(1, 1, 1)
	public update(dt: number): void {
		return
	}
	protected handleEvent(event: GamepadEvent): void {
		return
	}
}