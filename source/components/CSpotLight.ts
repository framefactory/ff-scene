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
    distance: types.Number("Light.Distance"),
    decay: types.Number("Light.Decay", 1),
    angle: types.Number("Light.Angle", 45),
    penumbra: types.Number("Light.Penumbra", 0.5)
};

export default class CSpotLight extends CLight
{
    static readonly typeName: string = "CSpotLight";

    ins = this.addInputs<CLight, typeof _inputs>(_inputs);


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