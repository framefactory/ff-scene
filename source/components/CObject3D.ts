/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { ClassOf } from "@ff/core/types";
import { ITypedEvent } from "@ff/core/Publisher";

import Component, { types } from "@ff/graph/Component";
import IndexShader from "@ff/three/shaders/IndexShader";

import RenderView, { Viewport } from "../RenderView";
import CTransform from "./CTransform";

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

export interface ICObject3D extends Component
{
    object3D: THREE.Object3D;
}

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

const _inputs = {
    visible: types.Boolean("Object.Visible", true),
    pickable: types.Boolean("Object.Pickable", true),
};

const _outputs = {
    pointerDown: types.Event("Picking.PointerDown"),
    pointerUp: types.Event("Picking.PointerUp"),
    pointerActive: types.Event("Picking.PointerActive")
};

/**
 * Base component for Three.js renderable objects.
 * If component is added to a node together with a [[Transform]] component,
 * it is automatically added as a child to the transform.
 */
export default class CObject3D extends Component implements ICObject3D
{
    /** The component type whose object3D is the parent of this component's object3D. */
    protected static readonly parentComponentClass: ClassOf<ICObject3D> = CTransform;

    ins = this.addInputs(_inputs);
    outs = this.addOutputs(_outputs);


    private _object3D: THREE.Object3D = null;


    constructor(id: string)
    {
        super(id);
        this.addEvent("object");
    }

    /** The class of a component in the same node this component uses as parent transform. */
    get parentComponentClass(): ClassOf<ICObject3D> {
        return (this.constructor as any).parentComponentClass;
    }
    /** The transform parent of this object. */
    get parentComponent(): ICObject3D {
        return this.node.components.get(this.parentComponentClass);
    }
    /** The underlying [[THREE.Object3D]] of this component. */
    get object3D(): THREE.Object3D | null {
        return this._object3D;
    }

    /**
     * Assigns a [[THREE.Object3D]] to this component. The object automatically becomes a child
     * of the parent component's object.
     * @param object
     */
    set object3D(object: THREE.Object3D)
    {
        const currentObject = this._object3D;
        const parentComponent = this.parentComponent;

        if (currentObject) {
            object.userData["component"] = null;
            currentObject.onBeforeRender = null;
            currentObject.onAfterRender = null;

            this.unregisterPickableObject3D(currentObject, true);

            if (parentComponent) {
                parentComponent.object3D.remove(currentObject);
            }
        }

        this.emit<IObject3DObjectEvent>({ type: "object", current: currentObject, next: object });
        this._object3D = object;

        if (object) {
            object.userData["component"] = this;
            object.matrixAutoUpdate = false;
            object.visible = this.ins.visible.value;

            object.onBeforeRender = this._onBeforeRender.bind(this);
            if (this.afterRender) {
                object.onAfterRender = this._onAfterRender.bind(this);
            }

            this.registerPickableObject3D(object, true);

            if (parentComponent) {
                parentComponent.object3D.add(object);
            }
        }
    }

    create()
    {
        this.trackComponent(this.parentComponentClass, component => {
            if (this._object3D) {
                component.object3D.add(this._object3D);
            }
        }, component => {
            if (this._object3D) {
                component.object3D.remove(this._object3D);
            }
        });
    }

    update(context): boolean
    {
        const ins = this.ins;

        if (ins.visible.changed && this._object3D) {
            this._object3D.visible = ins.visible.value;
        }

        return true;
    }

    dispose()
    {
        if (this._object3D) {
            const component = this.parentComponent;

            if (component) {
                component.object3D.remove(this._object3D);
            }
        }

        super.dispose();
    }

    /**
     * This is called right before the component's 3D object is rendered.
     * Override to make adjustments specific to the renderer, view or viewport.
     * @param context
     */
    beforeRender(context: IRenderContext)
    {
    }

    /**
     * This is called right after the component's 3D object has been rendered.
     * Override to make adjustments specific to the renderer, view or viewport.
     * @param context
     */
    afterRender(context: IRenderContext)
    {
    }

    /**
     * Adds a [[THREE.Object3D]] as a child to this component's object.
     * Registers the object with the picking service to make it pickable.
     * @param object
     */
    addObject3D(object: THREE.Object3D)
    {
        this._object3D.add(object);
        this.registerPickableObject3D(object, true);
    }

    /**
     * Removes a [[THREE.Object3D]] child from this component's object.
     * Also unregisters the object from the picking service.
     * @param object
     */
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

    /**
     * Three.js event handler called before the object is rendered.
     * @private
     */
    private _onBeforeRender(
        renderer: THREE.WebGLRenderer,
        scene: THREE.Scene,
        camera: THREE.Camera,
        geometry: THREE.Geometry,
        material: any,
        group: any)
    {
        // index rendering for picking: set shader index uniform to the object's id
        if (material.isIndexShader && this.ins.pickable.value) {
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

    /**
     * Three.js event handler called after the object has been rendered.
     * @private
     */
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