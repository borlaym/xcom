import * as THREE from 'three';
import { uniq } from 'lodash';
import { astar, Graph } from './astar'
import Floor from 'entities/Floor';
import Map from 'entities/Map';
import GameState from 'entities/GameState';
import * as ReactDOM from 'react-dom';
import UI from 'components/UI';
import * as React from 'react';
import GameScene from 'classes/GameScene';
import GameCamera from 'classes/GameCamera';
import GameWorld from 'classes/GameWorld';
import GameObject from 'classes/GameObject';
import Collision from 'classes/components/Collision';
import InputController from 'classes/InputController';
import Rendering from 'classes/components/Rendering';

const gameScene = new GameScene()
const map = new Map('test')
map.loaded.then(start)

let lastTick: number = Date.now()

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function update() {
	const now = Date.now()
	const dt = now - lastTick
	lastTick = now

	// Update colliders
	GameObject.getComponentsOfType(Collision).forEach(c => c.update(dt))

	// Update InputController
	InputController.update()

	// Update gameObjects
	GameWorld.update(dt)

	// Update meshes
	GameObject.getComponentsOfType(Rendering).forEach(c => c.update(dt))

	// Reset InputController
	InputController.reset()

	// Render
	renderer.render(gameScene.scene, GameCamera.camera);
	requestAnimationFrame(update)
}

function start() {
	GameWorld.setup(map.mapData)
	map.lights.forEach(light => gameScene.scene.add(light))
	renderUI()
	update();
}

////////////////


const globalIllumination = new THREE.AmbientLight(0xffffff, 0.4)
gameScene.scene.add(globalIllumination)
const state = new GameState()

state.on('updateUI', () => {
	renderUI()
})


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
			if (state.canAct) {
				const tileSelectable = state.selectableSpaces.find(space => space.x === tile.col && space.y === tile.row)
				if (tileSelectable) {
					tile.selectable()
				} 
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


