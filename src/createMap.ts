import * as THREE from 'three';

export default function createMap(scene: THREE.Scene, mapDefiniton: HTMLImageElement) {
	const roomTexture = new THREE.TextureLoader().load("textures/1.jpg");
	roomTexture.wrapS = THREE.RepeatWrapping;
	roomTexture.wrapT = THREE.RepeatWrapping;
	roomTexture.repeat.set(1, 1);

	const tileGeometry = new THREE.CubeGeometry(1, 1, 1, 1, 1, 1);
	const floorGeometry = new THREE.PlaneGeometry(1, 1);
	const roomMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, map: roomTexture, side: THREE.DoubleSide });
	const floorMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });

	// Read map definition image
	const canvas: HTMLCanvasElement = document.createElement('canvas');
	canvas.width = mapDefiniton.width;
	canvas.height = mapDefiniton.height;
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Couldnt initialize canvas context for drawing map')
	}
	ctx.drawImage(mapDefiniton, 0, 0);
	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

	const tiles: THREE.Mesh[] = [];
	for (let i = 0; i < imageData.data.length; i += 4) {
		const r = imageData.data[i];
		const g = imageData.data[i + 1];
		const b = imageData.data[i + 2];
		const row = Math.floor((i / 4) / mapDefiniton.width);
		const col = (i / 4) % mapDefiniton.width;
		// On white, add a tile
		if (r === 255 && g === 255 && b === 255) {
			const tileMesh = new THREE.Mesh(tileGeometry, roomMaterial);
			tileMesh.position.x = col;
			tileMesh.position.z = row;
			tiles.push(tileMesh)
			scene.add(tileMesh);
		}
		// On gray, add a floor tile
		if (r === 51 && g === 51 && b === 51) {
			const tileMesh = new THREE.Mesh(floorGeometry, floorMaterial);
			tileMesh.rotation.x = Math.PI / 2
			tileMesh.position.x = col;
			tileMesh.position.z = row;
			tileMesh.position.y = -0.5;
			tiles.push(tileMesh)
			scene.add(tileMesh);
		}
	}

	return tiles;
}



