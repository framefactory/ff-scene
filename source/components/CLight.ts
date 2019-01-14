/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { types } from "@ff/graph/propertyTypes";
import CObject3D from "./CObject3D";

////////////////////////////////////////////////////////////////////////////////

const ins = {
    color: types.ColorRGB("Color"),
    intensity: types.Number("Intensity", 1)
};

export default class CLight extends CObject3D
{
    static readonly type: string = "CLight";

    ins = this.addInputs(ins);

    get light(): THREE.Light
    {
        return this.object3D as THREE.Light;
    }
}