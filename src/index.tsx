import Link from 'entities/Link';
import * as THREE from 'three';
import { uniq } from 'lodash';
import { astar, Graph } from './astar'
import { Vector3 } from 'three';
import Floor from 'entities/Floor';
import Map from 'entities/Map';
import GameState from 'entities/GameState';
import rotateCameraAboutPoint from 'utils/rotateCameraAboutPoint';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.x = 16;
camera.position.y = 4;
camera.position.z = 18;
camera.rotation.x = -Math.PI / 3
camera.rotation.y = 0;
camera.rotation.z = 0;
camera.rotation.order = 'YXZ'

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const character = new Link();
character.moveTo(16, 0, 16);

const map = new Map('test')
map.loaded.then(start)

function start() {
	scene.add(character.sprite)
	map.tiles.forEach(tile => scene.add(tile.mesh))
	map.lights.forEach(light => scene.add(light))
	character.sprite.lookAt(camera.position)
	animate();
}


const state = new GameState()
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
	state.onMouseMove(event)
};

document.addEventListener("mousemove", onMouseMove, false);

function animate() {
	const motion = state.motion

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
	if (state.keysDown.indexOf('q') > -1 || state.keysDown.indexOf('e') > -1) {
		const cameraDirection = new Vector3()
		camera.getWorldDirection(cameraDirection)
		const cameraLookingAt = new Vector3()
		new THREE.Ray(camera.position, cameraDirection).intersectPlane(new THREE.Plane(new Vector3(0, 1, 0)), cameraLookingAt)
		const rotation = state.keysDown.indexOf('q') > -1 ? 0.03 : -0.03
		rotateCameraAboutPoint(camera, cameraLookingAt, new Vector3(0, 1, 0), rotation)
	}

	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}


