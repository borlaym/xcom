export default class MapTile {
	public readonly uuid: string
	constructor(
		public readonly row: number,
		public readonly col: number,
		public readonly mesh: THREE.Mesh
	) {
		this.mesh.position.x = col;
		this.mesh.position.z = row;
		this.uuid = this.mesh.uuid
	}
}