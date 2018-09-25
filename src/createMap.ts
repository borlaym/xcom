import * as THREE from 'three';
import MapTile from 'entities/MapTile';
import { Wall } from 'entities/Wall';
import Floor from 'entities/Floor';
import { BlackBox } from 'entities/BlackBox';

export default function createMap(scene: THREE.Scene, mapDefiniton: HTMLImageElement, lightsDefinition: HTMLImageElement):
	[MapTile[], number[][]]
{

	// Read map definition image
	const canvas: HTMLCanvasElement = document.createElement('canvas');
	canvas.width = mapDefiniton.width;
	canvas.height = mapDefiniton.height;
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Couldnt initialize canvas context for drawing map')
	}
	ctx.drawImage(mapDefiniton, 0, 0);
	const tileData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	ctx.clearRect(0, 0, mapDefiniton.width, mapDefiniton.height)
	ctx.drawImage(lightsDefinition, 0, 0);
	const lightData = ctx.getImageData(0, 0, canvas.width, canvas.height);

	const mapTiles: MapTile[] = [];
	const lights: THREE.PointLight[] = [];
	const map: number[][] = []

	for (let i = 0; i < tileData.data.length; i += 4) {
		const r = tileData.data[i];
		const g = tileData.data[i + 1];
		const b = tileData.data[i + 2];
		const row = Math.floor((i / 4) / mapDefiniton.width);
		if (!map[row]) {
			map.push([])
		}
		const col = (i / 4) % mapDefiniton.width;
		// On white, add a tile
		if (r === 255 && g === 255 && b === 255) {
			const wall = new Wall(row, col)
			mapTiles.push(wall)
		}
		// On gray, add a floor tile
		if (r === 51 && g === 51 && b === 51) {
			const floor = new Floor(row, col)
			mapTiles.push(floor)
			map[map.length - 1].push(1)
		} else {
			// Everything that is not a floor is not a movable space
			map[map.length - 1].push(0)
		}
		// On black, add a blocking tile
		if (r === 0 && g === 0 && b === 0) {
			const blackBox = new BlackBox(row, col)
			mapTiles.push(blackBox)

		}
		// Add light
		if (lightData.data[i + 3] > 0) {
			const color = lightData.data[i] << 16 | lightData.data[i + 1] << 8 | lightData.data[i + 2];
			const light = new THREE.PointLight(color, 13, 5, 2);
			light.position.set(col, 0.5, row);
			lights.push(light);
			scene.add(light)
		}
	}
	mapTiles.forEach(tile => scene.add(tile.mesh))
	return [mapTiles, map]
}


