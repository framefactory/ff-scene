/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { types } from "@ff/graph/propertyTypes";

import UniversalCamera, { EProjection } from "@ff/three/UniversalCamera";
import CObject3D from "./CObject3D";
import CScene from "./CScene";

////////////////////////////////////////////////////////////////////////////////

export { EProjection };

const _inputs = {
    activate: types.Event("Camera.Activate"),
    position: types.Vector3("Transform.Position"),
    rotation: types.Vector3("Transform.Rotation"),
    projection: types.Enum("Projection.Type", EProjection, EProjection.Perspective),
    fov: types.Number("Projection.FovY", 52),
    size: types.Number("Projection.Size", 20),
    zoom: types.Number("Projection.Zoom", 1),
    near: types.Number("Frustum.ZNear", 0.01),
    far: types.Number("Frustum.ZFar", 10000)
};

export default class CCamera extends CObject3D
{
    ins = this.addInputs<CObject3D, typeof _inputs>(_inputs);


    get camera() {
        return this.object3D as UniversalCamera;
    }

    protected get scene() {
        return this.graph.components.get(CScene)
    }

    create()
    {
        super.create();
        this.object3D = new UniversalCamera();

        const scene = this.scene;
        if (scene && !scene.activeCameraComponent) {
            scene.activeCameraComponent = this;
        }
    }

    update()
    {
        const { activate, position, rotation, projection, fov, size, zoom, near, far } = this.ins;

        if (activate.changed) {
            const scene = this.scene;
            if (scene) {
                scene.activeCameraComponent = this;
            }
        }

        const camera = this.camera;

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
}