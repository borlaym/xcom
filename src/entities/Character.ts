import * as THREE from "three";
import { Frame } from "./Frame";
import { Vector3, Vector2 } from "three";
import ICoordinate from "./Coordinate";
import Movable from "./Movable";
import { directionToVector } from "../utils/directionToVector";
import vectorToDirection from "../utils/vectorToDirection";
export interface Animation {
	n: Frame[],
	e: Frame[],
	s: Frame[],
	w: Frame[]
}

export default abstract class Character extends Movable {
	public abstract readonly name: string
	public abstract readonly icon: string
	public readonly collider: THREE.Object3D
	public readonly sprite: THREE.Sprite
	public path: ICoordinate[] = [];
	public tilePosition: ICoordinate;
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
	constructor(
		spriteName: string,
		private readonly gameCamera: THREE.Camera
	) {
		super()
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
		this.on('finishedTransition', (leftOver) => this.finishedMovement(leftOver))
	}

	public tick(d: number) {
		this._movementTick(d)
		if (this.path.length) {
			this.setAnimation('walking')
			this.updateFacing()
		} else {
			this.setAnimation('standing')
			this.updateFacing()
		}
	}

	public walkPath(path: ICoordinate[]) {
		this.path = path
		const firstTile = path[0]
		this.moveTo(new Vector3(firstTile.x, 0, firstTile.y), 400)
	}

	public updateFacing() {
		this.applySprite(this.frame)
	}

	public setAnimation(name: string) {
		this.animation = name
		this.applySprite(this.frame)
	}

	public get position() {
		return this.collider.position
	}

	public set position(v: Vector3) {
		this.collider.position.set(v.x, v.y, v.z)
		this.sprite.position.set(v.x, v.y, v.z)
	}
	
	public get camera() {
		return this.gameCamera
	}

	public get facing() {
		const directionVector = directionToVector(this.movementDirection)
		const cameraAdjustedDirection = (new Vector2(directionVector.x, -directionVector.z)).rotateAround(new Vector2(0, 0), -this.camera.rotation.y)
		return vectorToDirection(cameraAdjustedDirection)
	}

	private get frameSet(): Frame[] {
		return this.frames[this.animation][this.facing]
	}

	private finishedMovement(leftOver: number) {
		const reachedTile = this.path.shift()
		if (reachedTile) {
			this.tilePosition = reachedTile
		}
		if (this.path.length > 0) {
			const firstTile = this.path[0]
			this.moveTo(new Vector3(firstTile.x, 0, firstTile.y), 400)
		}
		if (leftOver) {
			this._movementTick(leftOver)
		}
		if (this.path.length === 0) {
			this.emit('finishedMoving')
		}
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