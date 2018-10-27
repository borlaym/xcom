import Component from '../Component';
import { Object3D } from 'three';
import Transform from './Transform';
import Events from '../Events';
import ComponentAddedEvent from '../events/ComponentAddedEvent';

export default class Rendering extends Component {
	constructor(
		public readonly mesh: Object3D
	) {
		super()
		Events.emit(new ComponentAddedEvent(this))
	}

	public update(dt: number): void {
		const { position, rotation } = this.gameObject.getComponent(Transform)
		this.mesh.position.set(position.x, position.y, position.z)
		this.mesh.rotation.set(rotation.x, rotation.y, rotation.z)
	}

	protected handleEvent(event: GamepadEvent): void {
		return
	}
}