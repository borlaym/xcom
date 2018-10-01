import { Vector3 } from "three";

export default function rotateAroundPoint(obj: THREE.Object3D, point: Vector3, axis: Vector3, theta: number) {
	obj.position.sub(point); // remove the offset
	obj.position.applyAxisAngle(axis, theta); // rotate the POSITION
	obj.position.add(point); // re-add the offset

	obj.rotation.x = 0
	obj.rotateOnAxis(axis, theta); // rotate the OBJECT
	obj.rotation.x = -Math.PI / 3
}