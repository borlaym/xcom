import createMap, { floorMaterial, ITile } from 'createMap';
import Link from './Link';
import * as THREE from 'three';
import { uniq } from 'lodash';

const SPEED = 0.1;
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 4;
camera.position.z = 18;
camera.position.x = 16;

const renderer = new THREE.WebGLRenderer();
renderer.domElement.onclick = () => {
	// renderer.domElement.requestPointerLock();
}
renderer.setSize(window.innerWidth, window.innerHeight);
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

const highlightedMaterial = floorMaterial.clone()
highlightedMaterial.color.set(0x00ff00)

function start(scene: THREE.Scene, mapDefinition: HTMLImageElement, lightsDefinition: HTMLImageElement) {
	scene.add(character.sprite)
	const [, floorTiles] = createMap(scene, mapDefinition, lightsDefinition)
	tiles = floorTiles
	camera.lookAt(character.collider.position);
	character.sprite.lookAt(camera.position)

	animate();
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
	moveTo: {
		x: number,
		y: number
	} | null,
	highlighted: {
		x: number,
		y: number
	} | null,
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
	moveTo: null,
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
		state.moveTo = state.highlighted
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
					x: highlightedTile.row,
					y: highlightedTile.col
				}
			}
		}
	} else {
		state.highlighted = null
	}

	// Check for character movement
	if (state.moveTo) {
		character.moveTo(state.moveTo.y, -0.2, state.moveTo.x)
	}

	camera.position.add(motion);

	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}
