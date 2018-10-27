import * as THREE from "three";
import { Frame } from "./Frame";
import { Vector3, Vector2, Sprite } from "three";
import ICoordinate from "./Coordinate";
import { directionToVector } from "../utils/directionToVector";
import vectorToDirection from "../utils/vectorToDirection";
import { astar, Graph } from '../astar'
import GameObject from "classes/GameObject";
import Collision from "classes/components/Collision";
import Rendering from "classes/components/Rendering";
import Movement from "classes/components/Movement";
import Transform from "classes/components/Transform";
import GameCamera from "../classes/GameCamera";
export interface Animation {
	n: Frame[],
	e: Frame[],
	s: Frame[],
	w: Frame[]
}

export default abstract class Character extends GameObject {
	public abstract readonly name: string
	public abstract readonly icon: string
	public readonly isPlayer: boolean = false;
	public path: ICoordinate[] = [];
	public tilePosition: ICoordinate;
	protected abstract readonly frames: {
		standing: Animation,
		[name: string]: Animation
	}
	private animationLength: number = 600;
	private animation: string = 'standing';
	private readonly canvas: HTMLCanvasElement
	private readonly ctx: CanvasRenderingContext2D
	private spriteMap: HTMLImageElement
	constructor(
		spriteName: string
	) {
		super()
		this.canvas = document.createElement('canvas')
		const ctx = this.canvas.getContext('2d')
		if (!ctx) {
			throw new Error('Cant get context in character')
		}
		ctx.imageSmoothingEnabled = false
		this.ctx = ctx

		const texture = new THREE.CanvasTexture(this.canvas)
		texture.magFilter = THREE.NearestFilter
		texture.minFilter = THREE.NearestFilter
		const material = new THREE.SpriteMaterial({
			map: texture,
			color: 0xffffff,
			transparent: true,
			side: THREE.DoubleSide,
			lights: true
		});

		const sprite = new THREE.Sprite(material);
		sprite.center = new THREE.Vector2(0.5, 0)
		sprite.scale.x = 0.5
		sprite.scale.y = 0.5
		sprite.scale.z = 0.5
		this.addComponent(new Rendering(sprite))

		const colliderGeometry = new THREE.CubeGeometry(0.5, 0.5, 0.5, 1, 1, 1);
		const colliderMaterial = new THREE.MeshBasicMaterial({ opacity: 0 })
		this.addComponent(new Collision(new THREE.Mesh(colliderGeometry, colliderMaterial)))

		this.addComponent(new Movement())

		this.loadSpriteSheet(spriteName)
	}

	public update(dt: number) {
		this.getComponent(Movement).update(dt)
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
		this.getComponent(Movement).moveTo(new Vector3(firstTile.x, 0, firstTile.y), 400)
	}

	public updateFacing() {
		this.applySprite(this.frame)
	}

	public setAnimation(name: string) {
		this.animation = name
		this.applySprite(this.frame)
	}

	public get position() {
		return this.getComponent(Transform).position
	}

	public set position(v: Vector3) {
		this.getComponent(Transform).position.set(v.x, v.y, v.z)
	}
	
	public get facing() {
		const directionVector = directionToVector(this.getComponent(Movement).movementDirection)
		const cameraAdjustedDirection = (new Vector2(directionVector.x, -directionVector.z)).rotateAround(new Vector2(0, 0), -GameCamera.camera.rotation.y)
		return vectorToDirection(cameraAdjustedDirection)
	}

	public getMovableSpaces(mapData: number[][]) {
		const spaces: ICoordinate[] = []
		const graph = new Graph(mapData)
		mapData.forEach((row, y) => {
			row.forEach((col, x) => {
				// At most 3 tiles away
				if (Math.abs(y - this.tilePosition.y) <= 3 && Math.abs(x - this.tilePosition.x) <= 3) {
					// If it is walkable
					const start = graph.grid[this.tilePosition.y][this.tilePosition.x]
					const end = graph.grid[y][x]
					const route = astar.search(graph, start, end)
					if (route.length <= 3 && route.length !== 0) {
						spaces.push({ x, y })
					}
				}
			})
		})
		return spaces
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
			this.getComponent(Movement).moveTo(new Vector3(firstTile.x, 0, firstTile.y), 400)
		}
		if (leftOver) {
			this.getComponent(Movement).update(leftOver)
		}
		if (this.path.length === 0) {
			// this.emit('finishedMoving')
			return
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
		this.ctx.drawImage(this.spriteMap, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);
		(this.getComponent(Rendering).mesh as Sprite).material.needsUpdate = true
	}

}