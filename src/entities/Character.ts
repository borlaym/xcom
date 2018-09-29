import * as THREE from "three";
import { Frame } from "./Frame";
import { Vector2, Vector3 } from "three";
import ICoordinate from "./Coordinate";

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

/**
 * Number of milliseconds to walk a tile.
 * Lower value means greater speed
 */
const SPEED = 400;

export default abstract class Character {
	public readonly collider: THREE.Object3D
	public readonly sprite: THREE.Sprite
	public facing: Direction = Direction.South
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

	public tick(d: number) {
		if (this.path.length) {
			this.setAnimation('walking')
			const nextPath = this.path[0]
			const [didReachTile, remainingDistance] = this.goTowardsTile(nextPath, d)
			// If we could move more this tick and we can, do!
			if (didReachTile) {
				const reachedTile = this.path.shift()
				if (reachedTile) {
					this.tilePosition = reachedTile
				}
				if (this.path.length > 0 && remainingDistance > 0) {
					this.goTowardsTile(this.path[0], remainingDistance)
				}
			}
		} else {
			this.setAnimation('standing')
			this.updateFacing()
		}
	}

	public moveTo(x: number, y: number, z: number) {
		this.sprite.position.set(x, y, z)
		this.collider.position.set(x, y, z)
	}

	public move(v: THREE.Vector3) {
		this.sprite.position.add(v)
		this.collider.position.add(v)
		if (v.length() !== 0) {
			this.lastMovement = v
			this.updateFacing(v)
		}
	}

	public updateFacing(movementDirection: THREE.Vector3 = this.lastMovement) {
		// Change facing
		const cameraAdjustedDirection = (new Vector2(movementDirection.x, -movementDirection.z)).rotateAround(new Vector2(0, 0), -this.camera.rotation.y)
		const angle = cameraAdjustedDirection.angle()
		const index = Math.round((((angle < 0 ? angle + 2 * Math.PI : angle)) / (Math.PI / 2))) % 4
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

	/**
	 * Go in the direction of a designated tile.
	 * If the movement would be greater than what it can go, returns the remaining distance
	 * Otherwise returns 0
	 */
	private goTowardsTile(tile: ICoordinate, d: number): [boolean, number] {
		const targetTile = new Vector3(tile.x, 0, tile.y);
		const characterToTileVector = targetTile.clone().sub(this.sprite.position)
		const distanceThisTick = d / SPEED;
		const movementThisTick = characterToTileVector.clone().setLength(distanceThisTick);
		if (movementThisTick.length() >= characterToTileVector.length()) {
			this.move(characterToTileVector);
			return [true, movementThisTick.length() - characterToTileVector.length()];
		}
		this.move(movementThisTick)
		return [false, 0];
	}
}