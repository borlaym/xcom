import createMap from 'createMap';
import Link from './Link';
// import * as socketio from 'socket.io-client';
import * as THREE from 'three';
import { uniq } from 'lodash';
import { Object3D } from 'three';

// const serverName = process.env.NODE_ENV === 'production' ? 'https://marci-fps-test.herokuapp.com' : 'http://localhost:3001';
// const connection = socketio(serverName);
const SPEED = 0.1;
// const TURN_SPEED = 4;
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 4;
camera.position.z = 18;
camera.position.x = 16;

const renderer = new THREE.WebGLRenderer();
renderer.domElement.onclick = () => {
	renderer.domElement.requestPointerLock();
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
character.moveTo(16, 0, 16);
let colliders: THREE.Object3D[] = []

function start(scene: THREE.Scene, mapDefinition: HTMLImageElement, lightsDefinition: HTMLImageElement) {
	scene.add(character.sprite)
	colliders = [character.collider as Object3D].concat(createMap(scene, mapDefinition, lightsDefinition));
	camera.lookAt(character.collider.position);
	character.sprite.lookAt(camera.position)

	animate();
}

// let players: InterfacePlayer[] = [];

// interface InterfacePlayer {
// 	name: string,
// 	hp: number,
// 	mesh: THREE.Mesh
// }

// interface InterfaceGameState {
// 	players: Array<{
// 		hp: number,
// 		name: string,
// 		ry: number,
// 		x: number,
// 		y: number,
// 		z: number
// 	}>,
// 	yourHp: number
// };

// Wconnection.on('gameState', (data: InterfaceGameState) => {
// 	data.players.forEach(player => {
// 		const localPlayer = players.find(p => p.name === player.name);
// 		if (localPlayer) {
// 			// Update existing player
// 			localPlayer.mesh.position.set(player.x, player.y, player.z);
// 			localPlayer.mesh.rotation.y = player.ry;
// 			localPlayer.hp = player.hp;
// 			const mat = playerMaterial.clone();
// 			mat.color.setHSL(0, 1, player.hp / 100);
// 			localPlayer.mesh.material = mat;
// 		} else {
// 			// Add new player
// 			const mesh = createPlayerMesh();
// 			players.push({
// 				mesh,
// 				hp: player.hp,
// 				name: player.name
// 			});
// 			mesh.position.set(player.x, player.y, player.z);
// 			mesh.rotation.y = player.ry;
// 			const mat = playerMaterial.clone();
// 			mat.color.setHSL(0, 1, player.hp / 100);
// 			mesh.material = mat;
// 			scene.add(mesh);
// 		}
// 	});
// 	const removedPlayers: InterfacePlayer[] = [];
// 	// Remove non-existent players
// 	players.forEach(player => {
// 		const remotePlayer = data.players.find(p => p.name === player.name);
// 		if (!remotePlayer) {
// 			scene.remove(player.mesh);
// 			removedPlayers.push(player);
// 		}
// 	});
// 	players = players.filter(player => removedPlayers.indexOf(player) === -1);
// 	if (hpdisplay) {
// 		hpdisplay.innerHTML = String(data.yourHp);
// 	}
// });

// connection.on('init', (data: { name: string }) => {
// 	const div = document.createElement('div');
// 	div.innerHTML = `Name: ${data.name}<br>Server: ${serverName}`;
// 	div.className = 'nametag';
// 	document.body.appendChild(div);
// });

interface InterfaceState {
	keysDown: string[],
	mouseMovement: {
		x: number,
		y: number
	}
};

const state: InterfaceState = {
	keysDown: [],
	mouseMovement: {
		x: 0,
		y: 0
	}
};

document.addEventListener('keydown', (event) => {
	state.keysDown = uniq(state.keysDown.concat(event.key));
});

document.addEventListener('keyup', (event) => {
	state.keysDown = state.keysDown.filter(key => key !== event.key);
});

// document.addEventListener('click', () => {
// 	const raycaster = new THREE.Raycaster();
// 	raycaster.setFromCamera(new THREE.Vector2(), camera);
// 	const results = raycaster.intersectObjects(players.map(player => player.mesh));
// 	if (results.length) {
// 		const targetPlayer = players.find(p => p.mesh === results[0].object);
// 		if (targetPlayer) {
// 			connection.emit('hit', {
// 				name: targetPlayer.name
// 			});
// 		}
// 	}
// });

const onMouseMove = (event: MouseEvent) => {
	state.mouseMovement.x += event.movementX;
	state.mouseMovement.y += event.movementY;
};


const lockChangeAlert = () => {
	if (document.pointerLockElement === renderer.domElement) {
			global.console.log('locked to canvas');
			document.addEventListener("mousemove", onMouseMove, false);
		} else {
			document.removeEventListener("mousemove", onMouseMove, false);
		}
	}
document.addEventListener('pointerlockchange', lockChangeAlert, false);

function animate() {
	// if (state.mouseMovement.x || state.mouseMovement.y) {
	// 	const dx = state.mouseMovement.x || 0;
	// 	camera.rotation.y -= dx / window.innerWidth * TURN_SPEED;

	// 	const dy = state.mouseMovement.y || 0;
	// 	camera.rotation.x -= dy / window.innerHeight * TURN_SPEED;
	// 	camera.rotation.x = Math.min(camera.rotation.x, 0.75);
	// 	camera.rotation.x = Math.max(camera.rotation.x, -0.75);
	// 	camera.rotation.order = 'YXZ'
	// }
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
	// motion.applyEuler(new THREE.Euler(0, camera.rotation.y, 0));

	const raycaster = new THREE.Raycaster(character.collider.position, motion.clone().normalize());
	const results = raycaster.intersectObjects(colliders);
	const collisions = results.filter(result => result.distance < 0.5);
	if (!collisions.length) {
		character.move(motion);
		camera.position.add(motion);
	}

	state.mouseMovement.x = 0;
	state.mouseMovement.y = 0;

	// connection.emit('state', {
	// 	ry: camera.rotation.y,
	// 	x: camera.position.x,
	// 	y: -1,
	// 	z: camera.position.z
	// });

	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}
