/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { types } from "@ff/graph/propertyTypes";

import CLight from "./CLight";

////////////////////////////////////////////////////////////////////////////////

const _inputs = {
    position: types.Vector3("Light.Position", [ 0, 1, 0 ]),
    target: types.Vector3("Light.Target")
};

export default class CDirectionalLight extends CLight
{
    static readonly typeName: string = "CDirectionalLight";

    ins = this.addInputs<CLight, typeof _inputs>(_inputs);

    get light(): THREE.DirectionalLight
    {
        return this.object3D as THREE.DirectionalLight;
    }

    create()
    {
        super.create();
        this.object3D = new THREE.DirectionalLight();
    }

    update()
    {
        const light = this.light;
        const { color, intensity, position, target } = this.ins;

        light.color.fromArray(color.value);
        light.intensity = intensity.value;
        light.position.fromArray(position.value);
        light.target.position.fromArray(target.value);

        light.updateMatrix();
        return true;
    }
}