import ICoordinate from "./Coordinate";
import { Vector3, Camera, Scene } from "three";
import Character from "./Character";
import CharacterSolider from "./Soldier";
import CharacterLocke from "./Locke";
import { EventEmitter } from "events";

const SPEED = 0.1;

export default class GameState extends EventEmitter {
	public keysDown: string[] = []
	public mousePos: ICoordinate = {
		x: 0,
		y: 0
	};
	public highlighted: ICoordinate | null = null;
	public characters: Character[]
	public activeCharacter: Character
	public canAct: boolean = true;

	public onMouseMove(event: MouseEvent) {
		this.mousePos.x = (event.clientX / window.innerWidth) * 2 - 1
		this.mousePos.y = - (event.clientY / window.innerHeight) * 2 + 1;
	}

	public get motion(): Vector3 {
		const motion = new Vector3(0, 0, 0);
		if (this.keysDown.indexOf('w') > -1) {
			motion.z -= SPEED;
		}
		if (this.keysDown.indexOf('s') > -1) {
			motion.z += SPEED;
		}
		if (this.keysDown.indexOf('a') > -1) {
			motion.x -= SPEED;
		}
		if (this.keysDown.indexOf('d') > -1) {
			motion.x += SPEED;
		}
		return motion
	}

	public init(camera: Camera, scene: Scene) {
		const character = new CharacterLocke(camera);
		character.tilePosition = { x: 16, y: 16 }
		character.moveTo(16, 0, 16);

		const soldier1 = new CharacterSolider(camera);
		soldier1.tilePosition = { x: 14, y: 14 }
		soldier1.moveTo(14, 0, 14)

		const soldier2 = new CharacterSolider(camera);
		soldier2.tilePosition = { x: 18, y: 6 }
		soldier2.moveTo(18, 0, 6)

		this.characters = [character, soldier1, soldier2]
		scene.add(character.sprite)
		scene.add(soldier1.sprite)
		scene.add(soldier2.sprite)

		this.activeCharacter = character

		this.characters.forEach(character => character.on('finishedMoving', () => {
			this.nextCharacter()
		}))
	}

	public tick(d: number) {
		this.characters.forEach(character => character.tick(d))
	}

	private nextCharacter() {
		console.log('nextcharacter')
		const activeCharacterIndex = this.characters.indexOf(this.activeCharacter)
		const nextIndex = activeCharacterIndex === this.characters.length - 1 ? 0 : activeCharacterIndex + 1;
		this.activeCharacter = this.characters[nextIndex]
		this.canAct = true;
		this.emit('updateUI')
	}
}