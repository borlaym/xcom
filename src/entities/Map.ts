import loadImage from "utils/loadImage";
import getImageData from "utils/getImageData";
import MapTile from "./MapTile";
import Wall from "./Wall";
import Floor from "./Floor";
import BlackBox from "./BlackBox";
import * as THREE from "three";

export default class Map {
	public readonly loaded: Promise<void>
	public tiles: MapTile[] = [];
	public mapData: number[][] = [];
	public lights: THREE.PointLight[] = []
	constructor(
		name: string
	) {
		const mapPromise = loadImage(`maps/${name}_map.png`).then(image => this.createMap(image))
		const lightPromise = loadImage(`maps/${name}_lights.png`).then(image => this.createLights(image))
		this.loaded = Promise.all([mapPromise, lightPromise]).then(() => undefined)
	}

	private createMap(image: HTMLImageElement) {
		const mapData: number[][] = []
		const mapTiles: MapTile[] = [];
		const imageData = getImageData(image)
		
		for (let i = 0; i < imageData.data.length; i += 4) {
			const r = imageData.data[i];
			const g = imageData.data[i + 1];
			const b = imageData.data[i + 2];
			const row = Math.floor((i / 4) / image.width);
			if (!mapData[row]) {
				mapData.push([])
			}
			const col = (i / 4) % image.width;
			// On white, add a tile
			if (r === 255 && g === 255 && b === 255) {
				const wall = new Wall(row, col)
				mapTiles.push(wall)
			}
			// On gray, add a floor tile
			if (r === 51 && g === 51 && b === 51) {
				const floor = new Floor(row, col)
				mapTiles.push(floor)
				mapData[mapData.length - 1].push(1)
			} else {
				// Everything that is not a floor is not a movable space
				mapData[mapData.length - 1].push(0)
			}
			// On black, add a blocking tile
			if (r === 0 && g === 0 && b === 0) {
				const blackBox = new BlackBox(row, col)
				mapTiles.push(blackBox)
			}
		}

		this.tiles = mapTiles
		this.mapData = mapData
	}

	private createLights(image: HTMLImageElement) {
		const lights = []
		const imageData = getImageData(image)
		for (let i = 0; i < imageData.data.length; i += 4) {
			const row = Math.floor((i / 4) / image.width);
			const col = (i / 4) % image.width;
			if (imageData.data[i + 3] > 0) {
				const color = imageData.data[i] << 16 | imageData.data[i + 1] << 8 | imageData.data[i + 2];
				const light = new THREE.PointLight(color, 13, 5, 2);
				light.position.set(col, 0.5, row);
				lights.push(light);
			}
		}
		this.lights = lights
	}
}