import MapTile from "./MapTile";
import * as THREE from "three";

const boxGeometry = new THREE.CubeGeometry(1, 1, 1, 1, 1, 1);
const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })

export class BlackBox extends MapTile {
	constructor(
		public readonly row: number,
		public readonly col: number
	) {
		super(row, col, new THREE.Mesh(boxGeometry, blackMaterial))
	}
}