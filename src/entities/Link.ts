import Character, { Frame } from 'entities/Character'

export default class CharacterLink extends Character {
	protected readonly frames: { default: Frame, [name: string]: Frame} = {
		default: [55, 69, 19, 21]
	};
	constructor() {
		super('textures/link.png');
	}
}