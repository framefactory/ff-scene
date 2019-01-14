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
    decay: types.Number("Decay", 1),
    angle: types.Number("Angle", 45),
    penumbra: types.Number("Penumbra", 0.5)
};

export default class CSpotLight extends CLight
{
    static readonly type: string = "CSpotLight";

    ins = this.addInputs<CLight, typeof ins>(ins);

    get light(): THREE.SpotLight
    {
        return this.object3D as THREE.SpotLight;
    }

    create()
    {
        super.create();
        this.object3D = new THREE.SpotLight();
    }

    update()
    {
        const light = this.light;
        const { color, intensity, distance, decay, angle, penumbra } = this.ins;

        light.color.fromArray(color.value);
        light.intensity = intensity.value;
        light.distance = distance.value;
        light.decay = decay.value;
        light.angle = angle.value;
        light.penumbra = penumbra.value;

        light.updateMatrix();
        return true;
    }
}