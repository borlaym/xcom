import { Object3D, Color, Vector3, PointLight } from "three";
import Particle from "./Particle";
import * as THREE from "three";

const nullVector = new Vector3(0, 0, 0)

export default class Fireball {
	public readonly object: Object3D
	public direction: Vector3 = new Vector3(0, 0, 0)
	private readonly particles: Particle[] = []
	constructor() {
		this.object = new Object3D()
		for (let i = 0; i < 100; i++) {
			const position = new Vector3(
				THREE.Math.randFloatSpread(0.3),
				THREE.Math.randFloatSpread(0.3),
				THREE.Math.randFloatSpread(0.3)
			)
			const distanceFromCenter = position.distanceTo(nullVector)
			const centerColor = new Color(0xffff00)
			const outerColor = new Color(0xff0000)
			const color = centerColor.lerp(outerColor, distanceFromCenter / 0.3)
			const particle = new Particle(color)
			particle.sprite.position.set(position.x, position.y, position.z)
			this.object.add(particle.sprite)
			this.particles.push(particle);
		}
		// Add a light
		const light = new PointLight(0xff0000, 13, 4, 3)
		this.object.add(light)
	}

	public updateParticles() {
		this.particles.forEach((particle: Particle) => {
			const position = new Vector3(
				THREE.Math.randFloatSpread(0.3),
				THREE.Math.randFloatSpread(0.3),
				THREE.Math.randFloatSpread(0.3)
			)
			const distanceFromCenter = position.distanceTo(nullVector)
			const centerColor = new Color(0xffff00)
			const outerColor = new Color(0xff0000)
			const color = centerColor.lerp(outerColor, distanceFromCenter / 0.3)
			color.add(new Color(THREE.Math.randInt(0, 2), 0, 0));
			particle.sprite.material.color.set(color)
			particle.sprite.position.set(position.x, position.y, position.z)
		})
	}
}