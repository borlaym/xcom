import createMap, { floorMaterial, ITile } from 'createMap';
import Link from './Link';
import * as THREE from 'three';
import { uniq } from 'lodash';
import { astar, Graph } from './astar'
import { Vector3 } from 'three';

const SPEED = 0.1;
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.x = 16;
camera.position.y = 4;
camera.position.z = 18;
camera.rotation.x = -Math.PI / 3
camera.rotation.y = 0;
camera.rotation.z = 0;

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
const clippingPlanes = [
	new THREE.Plane(new THREE.Vector3(-1, 0, 0), 24),
	new THREE.Plane(new THREE.Vector3(1, 0, 0), -8),
	new THREE.Plane(new THREE.Vector3(0, 0, 1), -8),
	new THREE.Plane(new THREE.Vector3(0, 0, -1), 20),
];
renderer.clippingPlanes = clippingPlanes
document.body.appendChild(renderer.domElement);

const mapLoaded: Promise<HTMLImageElement> = new Promise(resolve => {
	const mapDefinition = new Image();
	mapDefinition.onload = () => resolve(mapDefinition);
	mapDefinition.src = 'maps/map.png';
})

const lightLoaded: Promise<HTMLImageElement> = new Promise(resolve => {
	const mapDefinition = new Image();
	mapDefinition.onload = () => resolve(mapDefinition);
	mapDefinition.src = 'maps/lights.png';
})

Promise.all([mapLoaded, lightLoaded])
	.then(([mapDefinition, lightsDefinition]) => {
		start(scene, mapDefinition, lightsDefinition);
	});

const character = new Link();
character.moveTo(16, -0.2, 16);
let tiles: ITile[] = []
let map: number[][] = []

const highlightedMaterial = floorMaterial.clone()
highlightedMaterial.color.set(0x00ff00)

function start(scene: THREE.Scene, mapDefinition: HTMLImageElement, lightsDefinition: HTMLImageElement) {
	scene.add(character.sprite)
	const [, floorTiles, mapDef] = createMap(scene, mapDefinition, lightsDefinition)
	tiles = floorTiles
	map = mapDef
	character.sprite.lookAt(camera.position)
	animate();
}

interface ICoordinate {
	x: number,
	y: number
}

interface InterfaceState {
	keysDown: string[],
	mouseMovement: {
		x: number,
		y: number
	},
	mousePos: {
		x: number,
		y: number
	},
	characterPos: {
		x: number,
		y: number
	},
	highlighted: {
		x: number,
		y: number
	} | null,
	path: ICoordinate[]
};

const state: InterfaceState = {
	keysDown: [],
	mouseMovement: {
		x: 0,
		y: 0,
	},
	mousePos: {
		x: 0,
		y: 0
	},
	characterPos: {
		x: 16,
		y: 16
	},
	path: [],
	highlighted: null
};

document.addEventListener('keydown', (event) => {
	state.keysDown = uniq(state.keysDown.concat(event.key));
});

document.addEventListener('keyup', (event) => {
	state.keysDown = state.keysDown.filter(key => key !== event.key);
});

document.addEventListener('click', () => {
	if (state.highlighted) {
		// Pathfinding
		const graph = new Graph(map)
		const start = graph.grid[state.characterPos.y][state.characterPos.x]
		const end = graph.grid[state.highlighted.y][state.highlighted.x]
		state.path = astar.search(graph, start, end).map(obj => ({ x: obj.y, y: obj.x }))
	}
});

const onMouseMove = (event: MouseEvent) => {
	state.mouseMovement.x += event.movementX;
	state.mouseMovement.y += event.movementY;
	state.mousePos.x = (event.clientX / window.innerWidth) * 2 - 1
	state.mousePos.y = - (event.clientY / window.innerHeight) * 2 + 1;
};

document.addEventListener("mousemove", onMouseMove, false);

function animate() {
	const motion = new THREE.Vector3(0, 0, 0);
	if (state.keysDown.indexOf('w') > -1) {
		motion.z -= SPEED;
	}
	if (state.keysDown.indexOf('s') > -1) {
		motion.z += SPEED;
	}
	if (state.keysDown.indexOf('a') > -1) {
		motion.x -= SPEED;
	}
	if (state.keysDown.indexOf('d') > -1) {
		motion.x += SPEED;
	}

	// Check for mouse pointing
	tiles.forEach(tile => tile.mesh.material = floorMaterial)
	const mouseRaycaster = new THREE.Raycaster();
	mouseRaycaster.setFromCamera(state.mousePos, camera)
	const intersects = mouseRaycaster.intersectObjects(tiles.map(t => t.mesh))
	if (intersects.length === 1) {
		const intersection = intersects[0]
		if (intersection.object instanceof THREE.Mesh) {
			intersection.object.material = highlightedMaterial
			const highlightedTile = tiles.find(t => t.mesh === intersection.object)
			if (highlightedTile) {
				state.highlighted = {
					x: highlightedTile.col,
					y: highlightedTile.row
				}
			}
		}
	} else {
		state.highlighted = null
	}

	// Check for character movement
	if (state.path.length) {
		let nextPath = state.path[0]
		if (character.position.x === nextPath.x && character.position.z === nextPath.y) {
			const reachedCoordinate = state.path.shift()
			if (reachedCoordinate) {
				state.characterPos = reachedCoordinate
			}
			nextPath = state.path[0]
		}
		if (nextPath) {
			const direction = new Vector3(nextPath.x, 0, nextPath.y).sub(character.position)
			if (direction.length() < 0.18) {
				character.move(direction)
			} else {
				direction.divideScalar(5)
				character.move(direction)
			}
		}
	}

	// Move camera
	camera.position.add(motion);

	// Move clipping planes
	clippingPlanes.forEach(plane => plane.translate(motion))

	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}
