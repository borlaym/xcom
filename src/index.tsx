import * as THREE from 'three';
import { uniq } from 'lodash';
import { astar, Graph } from './astar'
import { Vector3 } from 'three';
import Floor from 'entities/Floor';
import Map from 'entities/Map';
import GameState from 'entities/GameState';
import rotateCameraAboutPoint from 'utils/rotateCameraAboutPoint';
import Fireball from 'entities/Fireball';
import { directionToVector } from 'utils/directionToVector';
import * as ReactDOM from 'react-dom';
import UI from 'components/UI';
import * as React from 'react';

const scene = new THREE.Scene();

let lastTick: number = Date.now()

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



let fireball: Fireball | null = null

const map = new Map('test')
map.loaded.then(start)

const globalIllumination = new THREE.AmbientLight(0xffffff, 0.4)
scene.add(globalIllumination)

function start() {
	map.tiles.forEach(tile => scene.add(tile.mesh))
	map.lights.forEach(light => scene.add(light))
	animate();
}

const state = new GameState()
state.init(camera, scene)

document.addEventListener('keydown', (event) => {
	state.keysDown = uniq(state.keysDown.concat(event.key));
});

document.addEventListener('keyup', (event) => {
	state.keysDown = state.keysDown.filter(key => key !== event.key);
});

document.addEventListener('keypress', event => {
	if (event.code === 'Space') {
		if (fireball) {
			scene.remove(fireball.object)
			fireball = null
		}
		fireball = new Fireball()
		const movementVector = directionToVector(state.activeCharacter.facing)
		fireball.direction = movementVector.clone()
		movementVector.add(state.activeCharacter.position)
		fireball.object.position.set(movementVector.x, 0.5, movementVector.z)
		scene.add(fireball.object)
	}
})

document.addEventListener('click', () => {
	if (state.highlighted) {
		// Pathfinding
		const graph = new Graph(map.mapData)
		const start = graph.grid[state.activeCharacter.tilePosition.y][state.activeCharacter.tilePosition.x]
		const end = graph.grid[state.highlighted.y][state.highlighted.x]
		state.activeCharacter.path = astar.search(graph, start, end).map(obj => ({ x: obj.y, y: obj.x }))
	}
});

const onMouseMove = (event: MouseEvent) => {
	state.onMouseMove(event)
};

document.addEventListener("mousemove", onMouseMove, false);

function animate() {
	const now = Date.now()
	const d = now - lastTick
	lastTick = now

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

	if (state.keysDown.indexOf('q') > -1 || state.keysDown.indexOf('e') > -1) {
		const cameraDirection = new Vector3()
		camera.getWorldDirection(cameraDirection)
		const cameraLookingAt = new Vector3()
		new THREE.Ray(camera.position, cameraDirection).intersectPlane(new THREE.Plane(new Vector3(0, 1, 0)), cameraLookingAt)
		const rotation = state.keysDown.indexOf('q') > -1 ? -0.05 : 0.05
		rotateCameraAboutPoint(camera, cameraLookingAt, new Vector3(0, 1, 0), rotation)
	}
	motion.applyEuler(new THREE.Euler(0, camera.rotation.y, 0));
	camera.position.add(motion);
	
	requestAnimationFrame(animate);
	renderer.render(scene, camera);

	state.tick(d);

	if (fireball) {
		fireball.object.position.add(fireball.direction.clone().divideScalar(12))
		fireball.updateParticles()
	}
}

const reactRoot = document.createElement('div')
document.body.appendChild(reactRoot)

ReactDOM.render(
	<UI characters={state.characters} activeCharacter={state.activeCharacter} />,
	reactRoot
)
