import { uniq } from 'lodash';
import GameObject from './GameObject';
import Collision from './components/Collision';
import { Raycaster } from 'three';
import GameCamera from './GameCamera';

class InputController {
	
	public keysDown: string[] = []
	public mousePos: { x: number, y: number } = { x: 0, y: 0 }
	public click: boolean = false
	public mousedown: boolean = false
	public mouseColliders: GameObject[] = []
	constructor() {
		document.addEventListener('keydown', (event) => {
			this.keysDown = uniq(this.keysDown.concat(event.key));
		});

		document.addEventListener('keyup', (event) => {
			this.keysDown = this.keysDown.filter(key => key !== event.key);
		});

		document.addEventListener('click', () => {
			this.click = true
		});

		document.addEventListener('mousedown', () => {
			this.mousedown = true
		});

		document.addEventListener('mousedown', () => {
			this.mousedown = false
		});

		document.addEventListener("mousemove", (event) => {
			this.mousePos.x = (event.clientX / window.innerWidth) * 2 - 1
			this.mousePos.y = - (event.clientY / window.innerHeight) * 2 + 1;
		});
	}

	public update() {
		const collisionComponents = GameObject.getComponentsOfType(Collision)
		const colliders = collisionComponents.map(component => component.collider)
		const mouseRaycaster = new Raycaster();
		mouseRaycaster.setFromCamera(this.mousePos, GameCamera.camera)
		const intersects = mouseRaycaster.intersectObjects(colliders)
		if (intersects.length > 0) {
			this.mouseColliders = intersects.map(intersection => {
				const uuid = intersection.object.uuid
				const component = collisionComponents.find(component => component.collider.uuid === uuid)
				if (!component) {
					throw new Error('cant find component with uuid')
				}
				return component.gameObject
			})
		} else {
			this.mouseColliders = []
		}
	}

	public reset() {
		this.click = false
	}

	public get mousePointingAt() {
		return this.mouseColliders[0]
	}
}

export default new InputController()