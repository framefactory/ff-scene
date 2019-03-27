/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { Node, types } from "@ff/graph/Component";

import CLight from "./CLight";

////////////////////////////////////////////////////////////////////////////////

export default class CDirectionalLight extends CLight
{
    static readonly typeName: string = "CDirectionalLight";

    protected static readonly dirLightIns = {
        position: types.Vector3("Light.Position", [ 0, 1, 0 ]),
        target: types.Vector3("Light.Target"),
        shadowSize: types.Number("Shadow.Size", 100),
    };

    ins = this.addInputs<CLight, typeof CDirectionalLight["dirLightIns"]>(CDirectionalLight.dirLightIns);

    constructor(node: Node, id: string)
    {
        super(node, id);

        this.object3D = new THREE.DirectionalLight();
    }

    get light(): THREE.DirectionalLight
    {
        return this.object3D as THREE.DirectionalLight;
    }

    update(context)
    {
        super.update(context);

        const light = this.light;
        const ins = this.ins;

        if (ins.position.changed || ins.target.changed) {
            light.position.fromArray(ins.position.value);
            light.target.position.fromArray(ins.target.value);
            light.updateMatrix();
        }

        if (ins.shadowSize.changed) {
            const camera = light.shadow.camera;
            const halfSize = ins.shadowSize.value * 0.5;
            camera.left = camera.bottom = -halfSize;
            camera.right = camera.top = halfSize;
            camera.updateProjectionMatrix();
        }

        return true;
    }
}