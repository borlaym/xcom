import Coordinates from "./Coordinate";
import { Vector3 } from "three";
import Character from "./Character";
import CharacterLocke from "./Locke";
import { EventEmitter } from "events";
import { astar, Graph } from '../astar'
import GameWorld from "classes/GameWorld";
import GameObject from "classes/GameObject";
import GameCamera from "classes/GameCamera";

const SPEED = 0.1;

export default class GameState extends EventEmitter {
	public highlighted: Coordinates | null = null;
	public playerCharacter: Character;
	public characters: Character[]
	public activeCharacter: Character
	public canAct: boolean = true;
	public selectableSpaces: Coordinates[] = []

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

	public init() {
		this.activeCharacter = GameObject.getObjectsOfType(CharacterLocke)[0]
		this.selectableSpaces = this.activeCharacter.getMovableSpaces(this.mapDataWithCharacters)
	}

	public get mapDataWithCharacters() {
		const mapData = JSON.parse(JSON.stringify(this.mapData))
		GameWorld.characters.forEach(character => {
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
		GameCamera.focus(this.activeCharacter)
		// this.emit('updateUI')
	}
}