/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import math from "@ff/core/math";

import { types } from "@ff/graph/propertyTypes";
import CHierarchy from "@ff/graph/components/CHierarchy";
import Node from "@ff/graph/Node";

import RenderComponent from "../RenderComponent";
import RenderSystem from "../RenderSystem";

////////////////////////////////////////////////////////////////////////////////

const _vec3a = new THREE.Vector3();
const _vec3b = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler();

export interface IObject3D extends RenderComponent
{
    object3D: THREE.Object3D;

    readonly system: RenderSystem;
    readonly transform: CTransform;
}

export enum ERotationOrder { XYZ, YZX, ZXY, XZY, YXZ, ZYX }

/**
 * Allows arranging components in a hierarchical structure. Each [[TransformComponent]]
 * contains a transformation which affects its children as well as other components which
 * are part of the same entity.
 */
export default class CTransform extends CHierarchy implements IObject3D
{
    static readonly type: string = "CTransform";

    ins = this.ins.append({
        position: types.Vector3("Position"),
        rotation: types.Vector3("Rotation"),
        order: types.Enum("Order", ERotationOrder),
        scale: types.Vector3("Scale", [ 1, 1, 1 ])
    });

    outs = this.outs.append({
        matrix: types.Matrix4("Matrix")
    });

    private _object3D: THREE.Object3D;

    constructor(node: Node, id?: string)
    {
        super(node, id);

        this._object3D = this.createObject3D();
        this._object3D.matrixAutoUpdate = false;
    }

    get transform(): CTransform {
        return this;
    }

    get system(): RenderSystem {
        return this.node.system as RenderSystem;
    }

    /**
     * Returns the three.js renderable object wrapped in this component.
     */
    get object3D(): THREE.Object3D
    {
        return this._object3D;
    }

    /**
     * Returns an array of child components of this.
     */
    get children(): Readonly<CTransform[]>
    {
        return this._children as CTransform[] || [];
    }

    /**
     * Returns a reference to the local transformation matrix.
     */
    get matrix(): Readonly<THREE.Matrix4>
    {
        return this._object3D.matrix;
    }

    update(context)
    {
        const object3D = this._object3D;
        const { position, rotation, order, scale } = this.ins;
        const { matrix } = this.outs;

        object3D.position.fromArray(position.value);
        _vec3a.fromArray(rotation.value).multiplyScalar(math.DEG2RAD);
        const orderName = types.getEnumName(ERotationOrder, order.value);
        object3D.rotation.setFromVector3(_vec3a, orderName);
        object3D.scale.fromArray(scale.value);
        object3D.updateMatrix();

        (object3D.matrix as any).toArray(matrix.value);
        matrix.set();

        return true;
    }

    dispose()
    {
        if (!this._object3D) {
            return;
        }

        // detach the three.js object from its parent and children
        if (this._object3D.parent) {
            this._object3D.parent.remove(this._object3D);
        }
        this._object3D.children.slice().forEach(child => this._object3D.remove(child));

        super.dispose();
    }

    setFromMatrix(matrix: THREE.Matrix4)
    {
        const { position, rotation, order, scale } = this.ins;

        matrix.decompose(_vec3a, _quat, _vec3b);
        _vec3a.toArray(position.value);

        const orderName = types.getEnumName(ERotationOrder, order.value);
        _euler.setFromQuaternion(_quat, orderName);
        _euler.toVector3(_vec3a);
        _vec3a.multiplyScalar(math.RAD2DEG).toArray(rotation.value);

        _vec3b.toArray(scale.value);

        position.set();
        rotation.set();
        scale.set();
    }


    /**
     * Adds the given transform component as a children to this.
     * @param component
     */
    addChild(component: CTransform)
    {
        super.addChild(component);
        this._object3D.add(component._object3D);
    }

    /**
     * Removes the given transform component from the list of children of this.
     * @param component
     */
    removeChild(component: CTransform)
    {
        this._object3D.remove(component._object3D);
        super.removeChild(component);
    }

    /**
     * Called by [[CObject3D]] to attach its three.js renderable object to the transform component.
     * Do not call this directly.
     * @param object
     */
    addObject3D(object: THREE.Object3D)
    {
        this._object3D.add(object);
    }

    /**
     * Called by [[CObject3D]] to detach its three.js renderable object from the transform component.
     * Do not call this directly.
     * @param object
     */
    removeObject3D(object: THREE.Object3D)
    {
        this._object3D.remove(object);
    }

    protected createObject3D()
    {
        return new THREE.Object3D();
    }
}
