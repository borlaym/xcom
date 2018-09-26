import MapTile from "./MapTile";
import * as THREE from "three";

const boxGeometry = new THREE.CubeGeometry(1, 1, 1, 1, 1, 1);
boxGeometry.translate(0, 0.5, 0)
const blackMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 })

export default class BlackBox extends MapTile {
	constructor(
		public readonly row: number,
		public readonly col: number
	) {
		super(row, col, new THREE.Mesh(boxGeometry, blackMaterial))
	}
}