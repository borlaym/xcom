import * as THREE from "three";
import { Frame } from "./Frame";
import { Vector2, Vector3 } from "three";

export enum Direction {
	North = 'n',
	East = 'e',
	South = 's',
	West = 'w'
}

export interface Animation {
	n: Frame[],
	e: Frame[],
	s: Frame[],
	w: Frame[]
}

export default abstract class Character {
	public readonly collider: THREE.Object3D
	public readonly sprite: THREE.Sprite
	public facing: Direction = Direction.South
	protected abstract readonly frames: {
		standing: Animation,
		[name: string]: Animation
	}
	private animationLength: number = 600;
	private animation: string = 'standing';
	private readonly material: THREE.SpriteMaterial
	private readonly canvas: HTMLCanvasElement
	private readonly ctx: CanvasRenderingContext2D
	private spriteMap: HTMLImageElement
	private readonly texture: THREE.Texture
	private lastMovement: THREE.Vector3 = new Vector3(0, 0, 1);
	constructor(
		spriteName: string,
		private readonly camera: THREE.Camera
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
		this.lastMovement = v
		this.updateFacing(v)
	}

	public updateFacing(v: THREE.Vector3 = this.lastMovement) {
		// Change facing
		const cameraAdjustedDirection = (new Vector2(v.x, -v.z)).normalize().rotateAround(new Vector2(0, 0), -this.camera.rotation.y)
		const angle = cameraAdjustedDirection.angle() * (180 / Math.PI)
		const index = Math.round((((angle < 0 ? angle + 360 : angle)) / 90)) % 4
		this.facing = [Direction.East, Direction.North, Direction.West, Direction.South][index]

		this.applySprite(this.frame)
	}

	public setAnimation(name: string) {
		this.animation = name
		this.applySprite(this.frame)
	}

	public get position() {
		return this.collider.position
	}

	private get frameSet(): Frame[] {
		return this.frames[this.animation][this.facing]
	}

	private get frame(): Frame {
		const index = Math.floor((Date.now() % this.animationLength) / (this.animationLength / this.frameSet.length))
		return this.frameSet[index]
	}

	private loadSpriteSheet(spriteName: string) {
		const img = new Image();
		img.onload = () => this.applySprite(this.frames.standing.s[0])
		img.src = spriteName
		this.spriteMap = img
	}

	private applySprite(frame: Frame) {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
		this.canvas.width = frame.w
		this.canvas.height = frame.h
		this.ctx.drawImage(this.spriteMap, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h)
		this.texture.needsUpdate = true
	}
}