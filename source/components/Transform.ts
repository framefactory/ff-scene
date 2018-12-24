/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import math from "@ff/core/math";

import { types } from "@ff/graph/propertyTypes";
import Hierarchy from "@ff/graph/Hierarchy";
import Node from "@ff/graph/Node";
import RenderSystem from "../RenderSystem";

////////////////////////////////////////////////////////////////////////////////

const _vec3 = new THREE.Vector3();
const _vec3b = new THREE.Vector3();
const _quat = new THREE.Quaternion();
const _euler = new THREE.Euler();

export enum ERotationOrder { XYZ, YZX, ZXY, XZY, YXZ, ZYX }

/**
 * Allows arranging components in a hierarchical structure. Each [[TransformComponent]]
 * contains a transformation which affects its children as well as other components which
 * are part of the same entity.
 */
export default class Transform extends Hierarchy
{
    static readonly type: string = "Transform";

    ins = this.ins.append({
        position: types.Vector3("Transform.Position"),
        rotation: types.Vector3("Transform.Rotation"),
        order: types.Enum("Transform.Order", ERotationOrder),
        scale: types.Vector3("Transform.Scale", [ 1, 1, 1 ])
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

    get transform() {
        return this.node.components.get(Transform);
    }

    get system(): RenderSystem {
        return this.node.system as RenderSystem;
    }

    /**
     * Returns the three.js renderable object wrapped in this component.
     * @returns {Object3D}
     */
    get object3D(): THREE.Object3D
    {
        return this._object3D;
    }

    /**
     * Returns an array of child components of this.
     * @returns {Readonly<Hierarchy[]>}
     */
    get children(): Readonly<Transform[]>
    {
        return this._children as Transform[] || [];
    }

    /**
     * Returns a reference to the local transformation matrix.
     * @returns {THREE.Matrix4}
     */
    get matrix(): Readonly<THREE.Matrix4>
    {
        return this._object3D.matrix;
    }

    update()
    {
        const object3D = this._object3D;
        const { position, rotation, order, scale } = this.ins;
        const { matrix } = this.outs;

        object3D.position.fromArray(position.value);
        _vec3.fromArray(rotation.value).multiplyScalar(math.DEG2RAD);
        const orderName = types.getEnumName(ERotationOrder, order.value);
        object3D.rotation.setFromVector3(_vec3, orderName);
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

        matrix.decompose(_vec3, _quat, _vec3b);
        _vec3.toArray(position.value);

        const orderName = types.getEnumName(ERotationOrder, order.value);
        _euler.setFromQuaternion(_quat, orderName);
        _euler.toVector3(_vec3);
        _vec3.multiplyScalar(math.RAD2DEG).toArray(rotation.value);

        _vec3b.toArray(scale.value);

        position.set();
        rotation.set();
        scale.set();
    }


    /**
     * Adds a child [[HierarchyComponent]] or [[TransformComponent]] to this.
     * @param {Transform} component
     */
    addChild(component: Transform)
    {
        super.addChild(component);
        this._object3D.add(component._object3D);
    }

    /**
     * Removes a child [[HierarchyComponent]] or [[TransformComponent]] from this.
     * @param {Transform} component
     */
    removeChild(component: Transform)
    {
        this._object3D.remove(component._object3D);
        super.removeChild(component);
    }

    /**
     * Called by [[Object3DComponent]] to attach its three.js renderable object to the transform component.
     * Do not call this directly.
     * @param {Object3D} object
     */
    addObject3D(object: THREE.Object3D)
    {
        this._object3D.add(object);
    }

    /**
     * Called by [[Object3DComponent]] to detach its three.js renderable object from the transform component.
     * Do not call this directly.
     * @param {Object3D} object
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
