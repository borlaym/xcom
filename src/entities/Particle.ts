import { Color, SpriteMaterial, Sprite } from "three";

const getMaterial = (color: Color) => new SpriteMaterial({ color })

export default class Particle {
	public readonly sprite: Sprite
	constructor(
		private color: Color
	) {
		this.sprite = new Sprite(getMaterial(this.color))
		this.sprite.scale.set(1 / 32, 1 / 32, 1 / 32)
	}
}