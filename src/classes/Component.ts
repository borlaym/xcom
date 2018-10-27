import GameObject from './GameObject';
import Events from './Events';

export default abstract class Component {
	public gameObject: GameObject
	constructor() {
		Events.addListener(this.handleEvent.bind(this))
	}
	public abstract update(dt: number): void
	protected abstract handleEvent(event: GamepadEvent): void
}