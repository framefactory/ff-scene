/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import {
    IComponentEvent,
    Node
} from "@ff/graph";

import IndexShader from "@ff/three/shaders/IndexShader";
import Transform from "./Transform";
import Component from "../Component";

////////////////////////////////////////////////////////////////////////////////

export interface IObject3DObjectEvent extends IComponentEvent<Object3D>
{
    current: THREE.Object3D;
    next: THREE.Object3D;
}

export interface IObject3DRenderContext
{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
    geometry: THREE.Geometry | THREE.BufferGeometry;
    material: THREE.Material;
    group: THREE.Group;
}

const _renderContext = {
    renderer: null,
    scene: null,
    camera: null,
    geometry: null,
    material: null,
    group: null
};

/**
 * Base component for Three.js renderable objects.
 * If component is added to a node together with a [[Transform]] component,
 * it is automatically added as a child to the transform.
 */
export default class Object3D extends Component
{
    static readonly type: string = "Object3D";

    private _object3D: THREE.Object3D = null;


    constructor(node: Node, id?: string)
    {
        super(node, id);
        this.addEvent("object");

        this._onBeforeRender = this._onBeforeRender.bind(this);
        this._onAfterRender = this._onAfterRender.bind(this);

        if (!this.beforeRender) {
            this.beforeRender = null;
        }
        if (!this.afterRender) {
            this.afterRender = null;
        }
    }

    get object3D(): THREE.Object3D | null
    {
        return this._object3D;
    }

    set object3D(object: THREE.Object3D)
    {
        const transform = this.transform;
        const currentObject = this._object3D;

        if (currentObject) {
            this.system.removeObject3D(currentObject);

            if (transform) {
                transform.removeObject3D(currentObject);
            }

            currentObject.onBeforeRender = undefined;
            currentObject.onAfterRender = undefined;
            currentObject.userData["component"] = null;
        }

        this.emit<IObject3DObjectEvent>("object", { current: currentObject, next: object });
        this._object3D = object;

        if (object) {
            object.matrixAutoUpdate = false;
            object.userData["component"] = this;
            object.onBeforeRender = this._onBeforeRender;

            if (this.afterRender) {
                object.onAfterRender = this._onAfterRender;
            }

            this.system.addObject3D(object);

            if (transform) {
                transform.addObject3D(object);
            }
        }
    }

    create()
    {
        this.trackComponent(Transform, transform => {
            if (this._object3D) {
                transform.addObject3D(this._object3D);
            }
        }, transform => {
            if (this._object3D) {
                transform.removeObject3D(this._object3D);
            }
        });
    }

    dispose()
    {
        if (this._object3D) {
            const transform = this.transform;

            if (transform) {
                transform.removeObject3D(this._object3D);
            }
        }

        super.dispose();
    }

    toString()
    {
        return super.toString() + (this._object3D ? ` - type: ${this._object3D.type}` : " - (null)");
    }

    /**
     * Override to get a callback from the Three.js renderer right before actual rendering.
     * @param context Three.js specific information about the object being rendered.
     */
    protected beforeRender?(context: IObject3DRenderContext);

    /**
     * Override to get a callback from the Three.js renderer right after actual rendering.
     * @param context Three.js specific information about the object being rendered.
     */
    protected afterRender?(context: IObject3DRenderContext);

    private _onBeforeRender(
        renderer: THREE.WebGLRenderer,
        scene: THREE.Scene,
        camera: THREE.Camera,
        geometry: THREE.Geometry | THREE.BufferGeometry,
        material: THREE.Material,
        group: THREE.Group)
    {
        const shader = material as IndexShader;

        // index rendering for picking: set shader index uniform to object index
        if (shader.isIndexShader) {
            shader.setIndex(this._object3D.userData["index"]);
        }

        if (this.beforeRender) {
            _renderContext.renderer = renderer;
            _renderContext.scene = scene;
            _renderContext.camera = camera;
            _renderContext.geometry = geometry;
            _renderContext.material = material;
            _renderContext.group = group;

            this.beforeRender(_renderContext);
        }
    }

    private _onAfterRender(
        renderer: THREE.WebGLRenderer,
        scene: THREE.Scene,
        camera: THREE.Camera,
        geometry: THREE.Geometry | THREE.BufferGeometry,
        material: THREE.Material,
        group: THREE.Group)
    {
        _renderContext.renderer = renderer;
        _renderContext.scene = scene;
        _renderContext.camera = camera;
        _renderContext.geometry = geometry;
        _renderContext.material = material;
        _renderContext.group = group;

        this.afterRender(_renderContext);
    }
}