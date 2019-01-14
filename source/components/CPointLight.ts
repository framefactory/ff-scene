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

const ins = {
    distance: types.Number("Distance"),
    decay: types.Number("Decay", 1)
};

export default class CPointLight extends CLight
{
    static readonly type: string = "CPointLight";

    ins = this.addInputs<CLight, typeof ins>(ins);

    get light(): THREE.PointLight
    {
        return this.object3D as THREE.PointLight;
    }

    create()
    {
        super.create();
        this.object3D = new THREE.PointLight();
    }

    update()
    {
        const light = this.light;
        const { color, intensity, distance, decay } = this.ins;

        light.color.fromArray(color.value);
        light.intensity = intensity.value;
        light.distance = distance.value;
        light.decay = decay.value;

        light.updateMatrix();
        return true;
    }
}