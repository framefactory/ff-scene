/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { TypeOf } from "@ff/core/types";
import { ITypedEvent } from "@ff/core/Publisher";
import Component, { IComponentEvent, types } from "@ff/graph/Component";
import GPUPicker from "@ff/three/GPUPicker";

import { IPointerEvent, ITriggerEvent } from "../RenderView";
import CScene, { IRenderContext } from "./CScene";
import CTransform from "./CTransform";

////////////////////////////////////////////////////////////////////////////////

export { IPointerEvent, ITriggerEvent, IRenderContext };


export interface ICObject3D extends Component
{
    object3D: THREE.Object3D;
}

export interface IObject3DObjectEvent extends ITypedEvent<"object">
{
    current: THREE.Object3D;
    next: THREE.Object3D;
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
    static readonly typeName: string = "CObject3D";

    /** The component type whose object3D is the parent of this component's object3D. */
    protected static readonly parentComponentClass: TypeOf<ICObject3D> = CTransform;

    ins = this.addInputs(_inputs);
    outs = this.addOutputs(_outputs);


    private _object3D: THREE.Object3D = null;
    private _scene: CScene = null;

    constructor(id: string)
    {
        super(id);
        this.addEvent("object");
    }

    /** The class of a component in the same node this component uses as parent transform. */
    get parentComponentClass(): TypeOf<ICObject3D> {
        return (this.constructor as any).parentComponentClass;
    }
    /** The transform parent of this object. */
    get parentComponent(): ICObject3D | undefined {
        return this.node.components.get(this.parentComponentClass, true);
    }
    /** The component node's transform component. */
    get transform(): CTransform | undefined {
        return this.node.components.get(CTransform, true);
    }
    /** The scene this renderable object is part of. */
    get scene(): CScene | undefined {
        const transform = this.transform;
        return transform ? transform.getParent(CScene, true) : undefined;
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

            this.registerPickableObject3D(object, true);

            if (parentComponent) {
                parentComponent.object3D.add(object);
            }
        }
    }

    create()
    {
        super.create();
        this.node.components.on(this.parentComponentClass, this._onParent, this);
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

        this.node.components.off(this.parentComponentClass, this._onParent, this);
        super.dispose();
    }

    /**
     * This is called right before the graph's scene is rendered to a specific viewport/view.
     * Override to make adjustments specific to the renderer, view or viewport.
     * @param context
     */
    preRender(context: IRenderContext)
    {
    }

    /**
     * This is called right after the graph's scene has been rendered to a specific viewport/view.
     * Override to make adjustments specific to the renderer, view or viewport.
     * @param context
     */
    postRender(context: IRenderContext)
    {
    }

    /**
     * Returns a text representation.
     */
    toString()
    {
        return super.toString() + (this._object3D ? ` - type: ${this._object3D.type}` : " - (null)");
    }

    /**
     * Adds a [[THREE.Object3D]] as a child to this component's object.
     * Registers the object with the picking service to make it pickable.
     * @param object
     */
    protected addObject3D(object: THREE.Object3D)
    {
        this._object3D.add(object);
        this.registerPickableObject3D(object, true);
    }

    /**
     * Removes a [[THREE.Object3D]] child from this component's object.
     * Also unregisters the object from the picking service.
     * @param object
     */
    protected removeObject3D(object: THREE.Object3D)
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
    protected registerPickableObject3D(object: THREE.Object3D, recursive: boolean)
    {
        GPUPicker.add(object, recursive);
    }

    /**
     * This should be called before an external change to this component's Object3D subtree.
     * It unregisters the mesh objects in the subtree from the picking service.
     * @param object
     * @param recursive
     */
    protected unregisterPickableObject3D(object: THREE.Object3D, recursive: boolean)
    {
        GPUPicker.remove(object, recursive);
    }

    private _onParent(event: IComponentEvent<ICObject3D>)
    {
        // add or remove this THREE.Object3D to the parent THREE.Object3D
        if (this._object3D) {
            if (event.add) {
                event.object.object3D.add(this._object3D);
            }
            else {
                event.object.object3D.remove(this._object3D);
            }
        }
    }
}

CObject3D.prototype.preRender = null;
CObject3D.prototype.postRender = null;
