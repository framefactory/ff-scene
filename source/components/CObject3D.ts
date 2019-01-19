/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { ITypedEvent } from "@ff/core/Publisher";
import Component from "@ff/graph/Component";

import RenderView, { Viewport } from "../RenderView";
import CTransform from "./CTransform";
import IndexShader from "@ff/three/shaders/IndexShader";

////////////////////////////////////////////////////////////////////////////////

const _context: IRenderContext = {
    view: null,
    viewport: null,
    renderer: null,
    scene: null,
    camera: null,
    geometry: null,
    material: null,
    group: null
};

const _hookObject3D = function(object: THREE.Object3D)
{
    if ((object as any).material) {
        object.onBeforeRender = function(r, s, c, g, material: IndexShader) {
            if (material.isIndexShader) {
                //console.log("setIndex #%s for %s", object.id, object);
                material.setIndex(object.id);
            }
        }
    }
};

const _unhookObject3D = function(object: THREE.Object3D)
{
    if ((object as any).material) {
        object.onBeforeRender = null;
    }
};

export interface IObject3DObjectEvent extends ITypedEvent<"object">
{
    current: THREE.Object3D;
    next: THREE.Object3D;
}

export interface IRenderContext
{
    view: RenderView;
    viewport: Viewport;
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
    geometry: THREE.Geometry;
    material: THREE.Material;
    group: any;
}

/**
 * Base component for Three.js renderable objects.
 * If component is added to a node together with a [[Transform]] component,
 * it is automatically added as a child to the transform.
 */
export default class CObject3D extends Component
{
    static readonly type: string = "CObject3D";


    private _object3D: THREE.Object3D = null;


    constructor(id?: string)
    {
        super(id);
        this.addEvent("object");
    }

    get transform() {
        return this.node.components.get(CTransform);
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
            object.userData["component"] = null;
            currentObject.onBeforeRender = null;
            currentObject.onAfterRender = null;

            this.unregisterPickableObject3D(currentObject, true);

            if (transform) {
                transform.removeObject3D(currentObject);
            }
        }

        this.emit<IObject3DObjectEvent>({ type: "object", current: currentObject, next: object });
        this._object3D = object;

        if (object) {
            object.userData["component"] = this;
            object.matrixAutoUpdate = false;

            object.onBeforeRender = this._onBeforeRender.bind(this);
            if (this.afterRender) {
                object.onAfterRender = this._onAfterRender.bind(this);
            }

            this.registerPickableObject3D(object, true);

            if (transform) {
                transform.addObject3D(object);
            }
        }
    }

    create()
    {
        this.trackComponent(CTransform, transform => {
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

    /**
     * For renderable components, this is called right before the component is rendered.
     * Override to make adjustments specific to the renderer, view or viewport.
     * @param context
     */
    beforeRender(context: IRenderContext)
    {
    }

    /**
     * For renderable components, this is called right after the component is rendered.
     * Override to make adjustments specific to the renderer, view or viewport.
     * @param context
     */
    afterRender(context: IRenderContext)
    {
    }

    addObject3D(object: THREE.Object3D)
    {
        this._object3D.add(object);
        this.registerPickableObject3D(object, true);
    }

    removeObject3D(object: THREE.Object3D)
    {
        this._object3D.remove(object);
        this.unregisterPickableObject3D(object, true);
    }

    /**
     * This should be called after an external change to this component's Object3D subtree.
     * It registers newly added mesh objects with the picking service.
     * @param object
     * @param recursive
     */
    registerPickableObject3D(object: THREE.Object3D, recursive: boolean = false)
    {
        if (recursive && object === this._object3D) {
            object.children.forEach(child => child.traverse(object => _hookObject3D(object)));
        }
        else if (recursive) {
            object.traverse(object => _hookObject3D(object));
        }
        else if (object !== this._object3D) {
            _hookObject3D(object);
        }
    }

    /**
     * This should be called before an external change to this component's Object3D subtree.
     * It unregisters the mesh objects in the subtree from the picking service.
     * @param object
     * @param recursive
     */
    unregisterPickableObject3D(object: THREE.Object3D, recursive: boolean = false)
    {
        if (recursive && object === this._object3D) {
            object.children.forEach(child => child.traverse(object => _unhookObject3D(object)));
        }
        else if (recursive) {
            object.traverse(object => _unhookObject3D(object));
        }
        else if (object !== this._object3D) {
            _unhookObject3D(object);
        }
    }

    /**
     * Returns a text representation.
     */
    toString()
    {
        return super.toString() + (this._object3D ? ` - type: ${this._object3D.type}` : " - (null)");
    }

    private _onBeforeRender(
        renderer: THREE.WebGLRenderer,
        scene: THREE.Scene,
        camera: THREE.Camera,
        geometry: THREE.Geometry,
        material: any,
        group: any)
    {
        // index rendering for picking: set shader index uniform to object index
        if (material.isIndexShader) {
            material.setIndex(this.object3D.id);
        }

        if (this.beforeRender) {
            _context.view = renderer["__view"];
            _context.viewport = renderer["__viewport"];
            _context.renderer = renderer;
            _context.scene = scene;
            _context.camera = camera;
            _context.geometry = geometry;
            _context.material = material;
            _context.group = group;

            this.beforeRender(_context);
        }
    }

    private _onAfterRender(
        renderer: THREE.WebGLRenderer,
        scene: THREE.Scene,
        camera: THREE.Camera,
        geometry: THREE.Geometry,
        material: THREE.Material,
        group: any)
    {
        _context.view = renderer["__view"];
        _context.viewport = renderer["__viewport"];
        _context.renderer = renderer;
        _context.scene = scene;
        _context.camera = camera;
        _context.geometry = geometry;
        _context.material = material;
        _context.group = group;

        this.afterRender(_context);
    }
}

CObject3D.prototype.beforeRender = null;
CObject3D.prototype.afterRender = null;