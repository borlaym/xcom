import GameObject from "classes/GameObject";
import Rendering from "classes/components/Rendering";
import Transform from "classes/components/Transform";

export default class MapTile extends GameObject {
	public readonly uuid: string
	constructor(
		public readonly row: number,
		public readonly col: number,
		mesh: THREE.Mesh
	) {
		super()
		this.addComponent(new Rendering(mesh))
		const transform = this.getComponent(Transform)
		transform.position.x = col;
		transform.position.z = row;
		this.uuid = mesh.uuid
	}
}