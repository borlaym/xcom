import Component from '../Component';
import { Object3D } from 'three';
import Transform from './Transform';

export default class Collision extends Component {
	constructor(
		public readonly collider: Object3D
	) {
		super()
	}

	public update(dt: number): void {
		const { position, rotation } = this.gameObject.getComponent(Transform)
		this.collider.position.set(position.x, position.y, position.z)
		this.collider.rotation.set(rotation.x, rotation.y, rotation.z)
	}
	protected handleEvent(event: GamepadEvent): void {
		return
	}
}