import GameEvent from './GameEvent';

type EventCallback = (event: GameEvent) => void

export default class Events {
	public static addListener(onEvent: EventCallback) {
		this.callbacks.push(onEvent)
	}
	public static emit(event: GameEvent) {
		this.callbacks.forEach(callback => callback(event))
	}
	private static callbacks: EventCallback[] = []
}