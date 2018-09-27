import Character, { Animation } from 'entities/Character'
import { Frame } from './Frame';

export default class CharacterLink extends Character {
	protected readonly frames: {
		standing: Animation,
		[name: string]: Animation
	} = {
		standing: {
			n: [new Frame(94, 70, 17, 22)],
			e: [new Frame(113, 69, 16, 23)],
			s: [new Frame(55, 69, 19, 21)],
			w: [new Frame(76, 69, 16, 23)]
		}
	};

	constructor(camera: THREE.Camera) {
		super('textures/link.png', camera);
	}
}