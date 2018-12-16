/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { types } from "@ff/graph";
import Light from "./Light";

////////////////////////////////////////////////////////////////////////////////

export default class SpotLight extends Light
{
    static readonly type: string = "SpotLight";

    ins = this.ins.append({
        distance: types.Number("Distance"),
        decay: types.Number("Decay", 1),
        angle: types.Number("Angle", 45),
        penumbra: types.Number("Penumbra", 0.5)
    });

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