import Coordinates from "./Coordinate";
import { Vector3, Scene } from "three";
import Character from "./Character";
import CharacterSolider from "./Soldier";
import CharacterLocke from "./Locke";
import { EventEmitter } from "events";
import GameCamera from "./GameCamera";
import { astar, Graph } from '../astar'

const SPEED = 0.1;

export default class GameState extends EventEmitter {
	public keysDown: string[] = []
	public mousePos: Coordinates = {
		x: 0,
		y: 0
	};
	public highlighted: Coordinates | null = null;
	public playerCharacter: Character;
	public characters: Character[]
	public activeCharacter: Character
	public canAct: boolean = true;
	public selectableSpaces: Coordinates[] = []

	private gameCamera: GameCamera
	private mapData: number[][]

	public onMouseMove(event: MouseEvent) {
		this.mousePos.x = (event.clientX / window.innerWidth) * 2 - 1
		this.mousePos.y = - (event.clientY / window.innerHeight) * 2 + 1;
	}

	public get cameraMotion(): Vector3 {
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

	public init(camera: GameCamera, scene: Scene, mapData: number[][]) {
		this.mapData = mapData;

		const character = new CharacterLocke(camera.camera);
		character.tilePosition = { x: 16, y: 16 }
		character.position = new Vector3(16, 0, 16);

		const soldier1 = new CharacterSolider(camera.camera);
		soldier1.tilePosition = { x: 14, y: 14 }
		soldier1.position = new Vector3(14, 0, 14)

		const soldier2 = new CharacterSolider(camera.camera);
		soldier2.tilePosition = { x: 18, y: 6 }
		soldier2.position = new Vector3(18, 0, 6)

		this.playerCharacter = character
		this.characters = [character, soldier1, soldier2]
		scene.add(character.sprite)
		scene.add(soldier1.sprite)
		scene.add(soldier2.sprite)

		this.activeCharacter = character

		this.characters.forEach(character => character.on('finishedMoving', () => {
			this.nextCharacter()
		}))
		this.selectableSpaces = this.activeCharacter.getMovableSpaces(this.mapDataWithCharacters)
		this.gameCamera = camera
	}

	public tick(d: number) {
		this.characters.forEach(character => character.tick(d))
	}

	public get mapDataWithCharacters() {
		const mapData = JSON.parse(JSON.stringify(this.mapData))
		this.characters.forEach(character => {
			mapData[character.tilePosition.y][character.tilePosition.x] = 0
		})
		return mapData
	}

	private nextCharacter() {
		const activeCharacterIndex = this.characters.indexOf(this.activeCharacter)
		const nextIndex = activeCharacterIndex === this.characters.length - 1 ? 0 : activeCharacterIndex + 1;
		this.activeCharacter = this.characters[nextIndex]
		if (this.activeCharacter.isPlayer) {
			this.selectableSpaces = this.activeCharacter.getMovableSpaces(this.mapDataWithCharacters)
			this.canAct = true;
			// this.gameCamera.follow(null)
		} else {
			// this.gameCamera.follow(this.activeCharacter.sprite)
			// Enemies go towards the player character
			const mapData = this.mapDataWithCharacters
			const graph = new Graph(mapData)
			const targetTiles: Coordinates[] = []
			for (let row = this.playerCharacter.tilePosition.y - 1; row <= this.playerCharacter.tilePosition.y + 1; row++) {
				for (let col = this.playerCharacter.tilePosition.x - 1; col <= this.playerCharacter.tilePosition.x + 1; col++) {
					if (mapData[row][col] === 1) {
						targetTiles.push({
							x: col,
							y: row
						})
					}
				}
			}
			const paths: Coordinates[][] = []
			targetTiles.forEach(target => {
				const start = graph.grid[this.activeCharacter.tilePosition.y][this.activeCharacter.tilePosition.x]
				const end = graph.grid[target.y][target.x]
				const route = astar.search(graph, start, end)
				paths.push(route.map((gridNode) => ({ x: gridNode.y, y: gridNode.x })))
			})
			const minPathLength = Math.min(...paths.filter(path => path.length !== 0).map(path => path.length))
			const shortestPaths = paths.filter(path => path.length === minPathLength)
			const shortestPath = shortestPaths[0]
			if (shortestPath) {
				this.activeCharacter.walkPath(shortestPath.slice(0, 3))
			} else {
				this.nextCharacter()
			}
		}
		this.gameCamera.focus(this.activeCharacter.sprite)
		this.emit('updateUI')
	}
}