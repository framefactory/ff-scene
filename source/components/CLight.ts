/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { types } from "@ff/graph/propertyTypes";
import CObject3D from "./CObject3D";

////////////////////////////////////////////////////////////////////////////////

const _inputs = {
    color: types.ColorRGB("Light.Color"),
    intensity: types.Number("Light.Intensity", 1)
};

export default class CLight extends CObject3D
{
    ins = this.addInputs<CObject3D, typeof _inputs>(_inputs);


    get light(): THREE.Light
    {
        return this.object3D as THREE.Light;
    }
}