/**
 * FF Typescript Foundation Library
 * Copyright 2019 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { Node, types } from "@ff/graph/Component";

import UniversalCamera, { EProjection } from "@ff/three/UniversalCamera";
import CObject3D, { ERotationOrder } from "./CObject3D";
import math from "@ff/core/math";

////////////////////////////////////////////////////////////////////////////////

const _vec3a = new THREE.Vector3();
const _vec3b = new THREE.Vector3();
const _euler = new THREE.Euler();
const _quat = new THREE.Quaternion();

export { EProjection };


export default class CCamera extends CObject3D
{
    static readonly typeName: string = "CCamera";

    protected static readonly camIns = {
        autoActivate: types.Boolean("Camera.AutoActivate", true),
        activate: types.Event("Camera.Activate"),
        position: types.Vector3("Transform.Position"),
        rotation: types.Vector3("Transform.Rotation"),
        order: types.Enum("Transform.Order", ERotationOrder, ERotationOrder.ZYX),
        projection: types.Enum("Projection.Type", EProjection, EProjection.Perspective),
        fov: types.Number("Projection.FovY", 52),
        size: types.Number("Projection.Size", 20),
        zoom: types.Number("Projection.Zoom", 1),
        near: types.Number("Frustum.ZNear", 0.01),
        far: types.Number("Frustum.ZFar", 10000),
    };

    ins = this.addInputs<CObject3D, typeof CCamera.camIns>(CCamera.camIns);

    constructor(node: Node, id: string)
    {
        super(node, id);
        this.object3D = new UniversalCamera();
    }
    get camera() {
        return this.object3D as UniversalCamera;
    }

    update()
    {
        const { autoActivate, activate } = this.ins;

        if (activate.changed || autoActivate.changed && autoActivate.value) {
            const scene = this.scene;
            if (scene) {
                scene.activeCameraComponent = this;
            }
        }

        const camera = this.camera;
        const { position, rotation, projection, fov, size, zoom, near, far } = this.ins;

        if (position.changed || rotation.changed) {
            camera.position.fromArray(position.value);
            camera.rotation.fromArray(rotation.value);
            camera.updateMatrix();
        }

        if (projection.changed) {
            camera.setProjection(projection.getValidatedValue());
        }

        camera.fov = fov.value;
        camera.size = size.value;
        camera.zoom = zoom.value;
        camera.near = near.value;
        camera.far = far.value;

        camera.updateProjectionMatrix();
        return true;
    }

    dispose()
    {
        const scene = this.scene;
        if (scene && scene.activeCameraComponent === this) {
            scene.activeCameraComponent = null;
        }

        super.dispose();
    }

    setPropertiesFromMatrix(matrix?: THREE.Matrix4)
    {
        const silent = !matrix;
        matrix = matrix || this.object3D.matrix;

        const { position, rotation, order } = this.ins;

        matrix.decompose(_vec3a, _quat, _vec3b);
        _vec3a.toArray(position.value);

        const orderName = order.getOptionText();
        _euler.setFromQuaternion(_quat, orderName);
        _euler.toVector3(_vec3a);
        _vec3a.multiplyScalar(math.RAD2DEG).toArray(rotation.value);

        position.set(silent);
        rotation.set(silent);
    }
}