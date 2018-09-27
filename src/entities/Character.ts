import * as THREE from "three";

export default class Character {
	public readonly collider: THREE.Object3D
	public readonly sprite: THREE.Sprite
	private readonly material: THREE.SpriteMaterial
	private readonly canvas: HTMLCanvasElement
	private readonly ctx: CanvasRenderingContext2D
	private spriteMap: HTMLImageElement
	private readonly texture: THREE.Texture
	constructor(
		spriteName: string
	) {
		this.canvas = document.createElement('canvas')
		const ctx = this.canvas.getContext('2d')
		if (!ctx) {
			throw new Error('Cant get context in character')
		}
		ctx.imageSmoothingEnabled = false
		this.ctx = ctx

		this.texture = new THREE.CanvasTexture(this.canvas)
		this.texture.magFilter = THREE.NearestFilter
		this.texture.minFilter = THREE.NearestFilter
		const plane = new THREE.PlaneGeometry(0.5, 0.5);
		plane.translate(0, 0.5, 0)
		this.material = new THREE.SpriteMaterial({
			map: this.texture,
			color: 0xffffff,
			transparent: true,
			side: THREE.DoubleSide,
			lights: true
		});

		this.sprite = new THREE.Sprite(this.material);
		this.sprite.center = new THREE.Vector2(0.5, 0)
		this.sprite.scale.x = 0.5
		this.sprite.scale.y = 0.5
		this.sprite.scale.z = 0.5

		const colliderGeometry = new THREE.CubeGeometry(0.5, 0.5, 0.5, 1, 1, 1);
		const colliderMaterial = new THREE.MeshBasicMaterial({ opacity: 0 })
		this.collider = new THREE.Mesh(colliderGeometry, colliderMaterial);

		this.loadSpriteSheet(spriteName)
	}

	public moveTo(x: number, y: number, z: number) {
		this.sprite.position.set(x, y, z)
		this.collider.position.set(x, y, z)
	}
	public move(v: THREE.Vector3) {
		this.sprite.position.add(v)
		this.collider.position.add(v)
	}

	public get position() {
		return this.collider.position
	}

	private loadSpriteSheet(spriteName: string) {
		const img = new Image();
		img.onload = () => this.applySprite()
		img.src = spriteName
		this.spriteMap = img
	}

	private applySprite() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		this.canvas.width = 19
		this.canvas.height = 21
		this.ctx.drawImage(this.spriteMap, 55, 69, 19, 21, 0, 0, 19, 21)
		this.texture.needsUpdate = true
	}
}