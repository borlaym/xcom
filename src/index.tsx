import Link from 'entities/Link';
import * as THREE from 'three';
import { uniq } from 'lodash';
import { astar, Graph } from './astar'
import { Vector3 } from 'three';
import Floor from 'entities/Floor';
import Map from 'entities/Map';

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
renderer.domElement.onclick = () => {
	// renderer.domElement.requestPointerLock();
}
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


const map = new Map('test')

map.loaded.then(start)

const character = new Link();
character.moveTo(16, -0.2, 16);

function start() {
	scene.add(character.sprite)
	map.tiles.forEach(tile => scene.add(tile.mesh))
	map.lights.forEach(light => scene.add(light))
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
		const graph = new Graph(map.mapData)
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
	map.tiles.forEach(tile => tile instanceof Floor && tile.removeHighlight())
	const mouseRaycaster = new THREE.Raycaster();
	mouseRaycaster.setFromCamera(state.mousePos, camera)
	const intersects = mouseRaycaster.intersectObjects(map.tiles.map(t => t.mesh))
	if (intersects.length === 1) {
		const intersection = intersects[0]
		const uuid = intersection.object.uuid
		const floor = map.tiles.find(tile => tile.uuid === uuid)
		if (floor && floor instanceof Floor) {
			floor.highlight()
			state.highlighted = {
				x: floor.col,
				y: floor.row
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

	camera.position.add(motion);

	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}
