/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import {
    Component,
    IComponentEvent,
    Node
} from "@ff/graph";

import IndexShader from "@ff/three/shaders/IndexShader";
import RenderSystem from "../RenderSystem";
import Transform from "./Transform";

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

export default class Object3D extends Component
{
    static readonly type: string = "Object3D";

    private _transform: Transform = null;
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

    get renderSystem(): RenderSystem
    {
        return this.system as RenderSystem;
    }

    get transform(): Transform
    {
        return this._transform;
    }

    get object3D(): THREE.Object3D | null
    {
        return this._object3D;
    }

    set object3D(object: THREE.Object3D)
    {
        const currentObject = this._object3D;
        if (currentObject && this._transform) {
            this._transform.removeObject3D(currentObject);
            this.renderSystem.removeObject3D(currentObject);
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

            this.renderSystem.addObject3D(object);

            if (this._transform) {
                this._transform.addObject3D(object);
            }
        }
    }

    create()
    {
        this.trackComponent(Transform, transform => {
            this._transform = transform;
            if (this._object3D) {
                transform.addObject3D(this._object3D);
            }
        }, transform => {
            this._transform = null;
            if (this._object3D) {
                transform.removeObject3D(this._object3D);
            }
        });
    }

    dispose()
    {
        if (this._object3D && this._transform) {
            this._transform.removeObject3D(this._object3D);
        }

        super.dispose();
    }

    toString()
    {
        return super.toString() + (this._object3D ? ` - type: ${this._object3D.type}` : " - (null)");
    }

    protected beforeRender?(context: IObject3DRenderContext);

    private _onBeforeRender(
        renderer: THREE.WebGLRenderer,
        scene: THREE.Scene,
        camera: THREE.Camera,
        geometry: THREE.Geometry | THREE.BufferGeometry,
        material: THREE.Material,
        group: THREE.Group)
    {
        const shader = material as IndexShader;
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

    protected afterRender?(context: IObject3DRenderContext);

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