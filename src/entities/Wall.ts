import MapTile from "./MapTile";
import * as THREE from "three";

const wallTexture = new THREE.TextureLoader().load("textures/2.png");
wallTexture.wrapS = THREE.RepeatWrapping;
wallTexture.wrapT = THREE.RepeatWrapping;
wallTexture.repeat.set(1, 1);

const boxGeometry = new THREE.CubeGeometry(1, 1, 1, 1, 1, 1);
const wallMaterial = new THREE.MeshLambertMaterial({ color: 0xaaaaaa, map: wallTexture });

export default class Wall extends MapTile {
	constructor(
		public readonly row: number,
		public readonly col: number
	) {
		super(row, col, new THREE.Mesh(boxGeometry, wallMaterial))
	}
}