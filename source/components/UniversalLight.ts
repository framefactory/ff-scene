/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { types } from "@ff/graph/propertyTypes";
import UniLight, { ELightType } from "@ff/three/UniversalLight";

import Object3D from "./Object3D";

////////////////////////////////////////////////////////////////////////////////

export default class UniversalLight extends Object3D
{
    static readonly type: string = "UniversalLight";

    ins = this.ins.append({
        type: types.Enum("Type", ELightType, ELightType.Directional),
        color: types.ColorRGB("Color"),
        intensity: types.Number("Intensity", 1),
        position: types.Vector3("Position", [ 0, 1, 0 ]),
        target: types.Vector3("Target"),
        distance: types.Number("Distance"),
        decay: types.Number("Decay", 1),
        angle: types.Number("Angle", 45),
        penumbra: types.Number("Penumbra", 0.5)
    });

    get light(): UniLight
    {
        return this.object3D as UniLight;
    }

    create()
    {
        super.create();
        this.object3D = new UniLight();
    }

    update()
    {
        const light = this.light;
        const { type, color, intensity, position, target, distance, decay, angle, penumbra } = this.ins;

        if (type.changed) {
            light.setType(types.getEnumIndex(ELightType, type.value));
        }

        light.color.fromArray(color.value);
        light.intensity = intensity.value;
        light.position.fromArray(position.value);
        light.target.position.fromArray(target.value);
        light.distance = distance.value;
        light.decay = decay.value;
        light.angle = angle.value;
        light.penumbra = penumbra.value;

        light.updateMatrix();
        return true;
    }
}