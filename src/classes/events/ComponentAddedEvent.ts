import GameEvent from '../GameEvent';
import Component from '../Component';

export default class ComponentAddedEvent extends GameEvent {
	constructor(
		public readonly component: Component
	) {
		super()
	}
}