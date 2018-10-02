import * as THREE from "three";
import MapTile from "./MapTile";

const floorTexture = new THREE.TextureLoader().load("textures/3.png");
floorTexture.wrapS = THREE.RepeatWrapping;
floorTexture.wrapT = THREE.RepeatWrapping;
floorTexture.repeat.set(1, 1);
const floorGeometry = new THREE.PlaneGeometry(1, 1);
const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x444444, map: floorTexture });

const highlightedMaterial = floorMaterial.clone()
highlightedMaterial.color.set(0x00ff00)

const selectableMaterial = floorMaterial.clone()
selectableMaterial.color.set(0xaaaaaa)

export default class Floor extends MapTile {
	constructor(
		public readonly row: number,
		public readonly col: number
	) {
		super(row, col, new THREE.Mesh(floorGeometry, floorMaterial))
		// Floor tiles are rotated to be facing up
		this.mesh.rotation.x = -Math.PI / 2
	}

	public highlight() {
		this.mesh.material = highlightedMaterial
	}

	public selectable() {
		this.mesh.material = selectableMaterial
	}

	public removeHighlight() {
		this.mesh.material = floorMaterial
	}
}