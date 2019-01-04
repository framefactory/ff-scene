/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { ITypedEvent } from "@ff/core/Publisher";
import Node from "@ff/graph/Node";

import Transform from "./Transform";
import RenderComponent from "../RenderComponent";

////////////////////////////////////////////////////////////////////////////////

export interface IObject3DObjectEvent extends ITypedEvent<"object">
{
    current: THREE.Object3D;
    next: THREE.Object3D;
}

/**
 * Base component for Three.js renderable objects.
 * If component is added to a node together with a [[Transform]] component,
 * it is automatically added as a child to the transform.
 */
export default class Object3D extends RenderComponent
{
    static readonly type: string = "Object3D";

    private _object3D: THREE.Object3D = null;


    constructor(node: Node, id?: string)
    {
        super(node, id);
        this.addEvent("object");
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
            this.system.unregisterObject3D(currentObject);

            if (transform) {
                transform.removeObject3D(currentObject);
            }
        }

        this.emit<IObject3DObjectEvent>({ type: "object", current: currentObject, next: object });
        this._object3D = object;

        if (object) {
            object.matrixAutoUpdate = false;
            this.system.registerObject3D(object, this);

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
     * Adds a Three.js Object3D (subtree) as a child to the root Object3D of this component
     * and registers it with the picking service. Must also call [[removeChildObject3D]] when removing the object.
     * @param subtree
     */
    protected addChild(subtree: THREE.Object3D)
    {
        this.object3D.add(subtree);
        this.system.registerObject3D(subtree);
    }

    /**
     * Removes a Three.js Object3D (subtree) child from the root Object3D of this component
     * and unregisters it from the picking service.
     * @param subtree
     */
    protected removeChild(subtree: THREE.Object3D)
    {
        this.object3D.remove(subtree);
        this.system.unregisterObject3D(subtree);
    }

    /**
     * This should be called after an external change to this component's Object3D subtree.
     * It registers newly added mesh objects with the picking service.
     * @param subtree
     */
    protected registerSubtree(subtree: THREE.Object3D)
    {
        this.system.registerObject3D(subtree);
    }

    /**
     * This should be called before an external change to this component's Object3D subtree.
     * It unregisters the mesh objects in the subtree from the picking service.
     * @param subtree
     */
    protected unregisterSubtree(subtree: THREE.Object3D)
    {
        this.system.unregisterObject3D(subtree);
    }
}