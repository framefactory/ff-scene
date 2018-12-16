/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { types } from "@ff/graph";
import Object3D from "./Object3D";

////////////////////////////////////////////////////////////////////////////////

export default class Light extends Object3D
{
    static readonly type: string = "Light";

    ins = this.ins.append({
        color: types.ColorRGB("Color"),
        intensity: types.Number("Intensity", 1)
    });

    get light(): THREE.Light
    {
        return this.object3D as THREE.Light;
    }
}