
import * as THREE from 'three';

const playerGeometry = new THREE.CubeGeometry(0.2, 0.2, 0.2);
const playerMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 });


export default function createPlayerMesh() {
	const body = new THREE.Mesh(playerGeometry, playerMaterial);
	body.position.set(16, 0, 16);
	return body;
}



