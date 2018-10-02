import * as THREE from 'three';
import { uniq } from 'lodash';
import { astar, Graph } from './astar'
import Floor from 'entities/Floor';
import Map from 'entities/Map';
import GameState from 'entities/GameState';
import * as ReactDOM from 'react-dom';
import UI from 'components/UI';
import * as React from 'react';
import GameCamera from 'entities/GameCamera';

const scene = new THREE.Scene();

let lastTick: number = Date.now()

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new GameCamera()

const map = new Map('test')
map.loaded.then(start)

const globalIllumination = new THREE.AmbientLight(0xffffff, 0.4)
scene.add(globalIllumination)
const state = new GameState()

function start() {
	state.init(camera, scene, map.mapData)
	renderUI()
	map.tiles.forEach(tile => scene.add(tile.mesh))
	map.lights.forEach(light => scene.add(light))
	animate();
}

state.on('updateUI', () => {
	renderUI()
})

document.addEventListener('keydown', (event) => {
	state.keysDown = uniq(state.keysDown.concat(event.key));
});

document.addEventListener('keyup', (event) => {
	state.keysDown = state.keysDown.filter(key => key !== event.key);
});

document.addEventListener('click', () => {
	if (state.highlighted && state.canAct) {
		// Pathfinding
		const graph = new Graph(state.mapDataWithCharacters)
		const start = graph.grid[state.activeCharacter.tilePosition.y][state.activeCharacter.tilePosition.x]
		const end = graph.grid[state.highlighted.y][state.highlighted.x]
		const route = astar.search(graph, start, end).map(obj => ({ x: obj.y, y: obj.x }))
		if (route.length <= 3 && route.length !== 0) {
			state.activeCharacter.walkPath(route)
			state.canAct = false
		}

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

	const cameraMotion = state.cameraMotion

	// Check for mouse pointing
	map.tiles.forEach(tile => {
		if (tile instanceof Floor) {
			tile.removeHighlight()
			const tileSelectable = state.movableSpaces.find(space => space.x === tile.col && space.y === tile.row)
			if (tileSelectable) {
				tile.selectable()
			} 
		}
	})
	if (state.canAct) {
		const mouseRaycaster = new THREE.Raycaster();
		mouseRaycaster.setFromCamera(state.mousePos, camera.camera)
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
	}

	if (state.keysDown.indexOf('q') > -1) {
		camera.rotateLeft()
	} 
	if (state.keysDown.indexOf('e') > -1) {
		camera.rotateRight()
	}
	cameraMotion.applyEuler(new THREE.Euler(0, camera.camera.rotation.y, 0));
	camera.camera.position.add(cameraMotion);
	
	state.tick(d);
	camera.tick(d);

	renderer.render(scene, camera.camera);
	requestAnimationFrame(animate);


}

const reactRoot = document.createElement('div')
document.body.appendChild(reactRoot)

function renderUI() {
	ReactDOM.render(
		<UI characters={state.characters} activeCharacter={state.activeCharacter} />,
		reactRoot
	)
}


