import Character, { Animation } from 'entities/Character'
import { Frame } from './Frame';

export default class CharacterLocke extends Character {
	protected readonly frames: {
		standing: Animation,
		[name: string]: Animation
	} = {
			standing: {
				n: [new Frame(32, 48, 16, 24)],
				e: [new Frame(92, 48, 15, 24)],
				s: [new Frame(2, 48, 16, 24)],
				w: [new Frame(62, 48, 15, 24)]
			},
			walking: {
				n: [new Frame(32, 78, 15, 24), new Frame(32, 108, 15, 24)],
				e: [new Frame(92, 78, 16, 23), new Frame(92, 108, 15, 23)],
				s: [new Frame(2, 78, 16, 24), new Frame(2, 108, 16, 24)],
				w: [new Frame(62, 78, 16, 23), new Frame(62, 108, 15, 23)]
			}
		};

	constructor(camera: THREE.Camera) {
		super('textures/locke.png', camera);
		this.sprite.scale.y = 0.7
	}
}