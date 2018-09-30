import Character, { Animation } from 'entities/Character'
import { Frame } from './Frame';

export default class CharacterSolider extends Character {
	public name: string = "Soldier";
	public icon: string = "icons/soldier.png";
	protected readonly frames: {
		standing: Animation,
		[name: string]: Animation
	} = {
			standing: {
				n: [new Frame(75, 3, 16, 24)],
				e: [new Frame(147, 3, 13, 24)],
				s: [new Frame(21, 3, 16, 24)],
				w: [new Frame(130, 3, 13, 24)]
			},
			walking: {
				n: [new Frame(57, 3, 16, 24), new Frame(93, 3, 16, 24)],
				e: [new Frame(163, 4, 16, 23), new Frame(182, 4, 14, 23)],
				s: [new Frame(3, 3, 16, 24), new Frame(39, 3, 16, 24)],
				w: [new Frame(111, 4, 16, 23), new Frame(4, 30, 14, 23)]
			}
		};

	constructor(camera: THREE.Camera) {
		super('textures/soldier.png', camera);
		this.sprite.scale.y = 0.7
	}
}