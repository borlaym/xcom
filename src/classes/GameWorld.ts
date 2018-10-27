import GameObject from './GameObject';
import CharacterLocke from 'entities/Locke';
import CharacterSolider from 'entities/Soldier';
import Character from 'entities/Character';

class GameWorld {
	private readonly gameObjects: GameObject[] = []
	public mapData: number[][];
	public addObject(gameObject: GameObject) {
		this.gameObjects.push(gameObject)
	}

	public setup(mapData: number[][]) {
		this.mapData = mapData;

		const character = new CharacterLocke();
		character.tilePosition = { x: 16, y: 16 }
		character.position.set(16, 0, 16)
		this.addObject(character)

		const soldier1 = new CharacterSolider();
		soldier1.tilePosition = { x: 14, y: 14 }
		soldier1.position.set(14, 0, 14)
		this.addObject(soldier1)

		const soldier2 = new CharacterSolider();
		soldier2.tilePosition = { x: 18, y: 6 }
		soldier2.position.set(18, 0, 6)
		this.addObject(soldier2)

	}

	public update(dt: number) {
		this.gameObjects.forEach(o => o.update(dt))
	}

	public get characters(): Character[] {
		return [
			...GameObject.getObjectsOfType(CharacterLocke),
			...GameObject.getObjectsOfType(CharacterSolider)
		]
	}

}

export default new GameWorld()