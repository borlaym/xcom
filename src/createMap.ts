import * as THREE from 'three';

export default function createMap(scene: THREE.Scene, mapDefiniton: HTMLImageElement, lightsDefinition: HTMLImageElement) {
	const roomTexture = new THREE.TextureLoader().load("textures/2.png");
	roomTexture.wrapS = THREE.RepeatWrapping;
	roomTexture.wrapT = THREE.RepeatWrapping;
	roomTexture.repeat.set(1, 1);

	const floorTexture = new THREE.TextureLoader().load("textures/3.png");
	floorTexture.wrapS = THREE.RepeatWrapping;
	floorTexture.wrapT = THREE.RepeatWrapping;
	floorTexture.repeat.set(1, 1);

	const tileGeometry = new THREE.CubeGeometry(1, 1, 1, 1, 1, 1);
	const floorGeometry = new THREE.PlaneGeometry(1, 1);
	const roomMaterial = new THREE.MeshLambertMaterial({ color: 0xaaaaaa, map: roomTexture });
	const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x444444, map: floorTexture });
	const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })

	// Read map definition image
	const canvas: HTMLCanvasElement = document.createElement('canvas');
	canvas.width = mapDefiniton.width;
	canvas.height = mapDefiniton.height;
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		throw new Error('Couldnt initialize canvas context for drawing map')
	}
	ctx.drawImage(mapDefiniton, 0, 0);
	const tileData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	ctx.clearRect(0, 0, mapDefiniton.width, mapDefiniton.height)
	ctx.drawImage(lightsDefinition, 0, 0);
	const lightData = ctx.getImageData(0, 0, canvas.width, canvas.height);

	const tiles: THREE.Mesh[] = [];
	const lights: THREE.PointLight[] = [];

	for (let i = 0; i < tileData.data.length; i += 4) {
		const r = tileData.data[i];
		const g = tileData.data[i + 1];
		const b = tileData.data[i + 2];
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
			tileMesh.rotation.x = -Math.PI / 2
			tileMesh.position.x = col;
			tileMesh.position.z = row;
			tileMesh.position.y = -0.5;
			scene.add(tileMesh);
		}
		// On black, add a blocking tile
		if (r === 0 && g === 0 && b === 0) {
			const tileMesh = new THREE.Mesh(tileGeometry, blackMaterial);
			tileMesh.position.x = col;
			tileMesh.position.z = row;
			scene.add(tileMesh);
		}
		// Add light
		if (lightData.data[i + 3] > 0) {
			const color = lightData.data[i] << 16 | lightData.data[i + 1] << 8 | lightData.data[i + 2];
			const light = new THREE.PointLight(color, 13, 5, 2);
			light.position.set(col, 0.5, row);
			lights.push(light);
			scene.add(light)
		}
	}

	return tiles;
}



