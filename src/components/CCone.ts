/**
 * FF Typescript Foundation Library
 * Copyright 2024 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { ConeGeometry, MathUtils } from "three";

import{ types } from "@ffweb/graph/propertyTypes.js";

import { CGeometry } from "./CGeometry.js";

////////////////////////////////////////////////////////////////////////////////

export class CCone extends CGeometry
{
    static readonly typeName: string = "CCone";

    protected static readonly coneIns = {
        radius: types.Number("Radius", 5),
        height: types.Number("Height", 10),
        open: types.Boolean("OpenEnded"),
        theta: types.Vector2("Theta", [ 0, 360 ]),
        segments: types.Vector2("Segments", [ 12, 1 ])
    };

    ins = this.addInputs(CCone.coneIns);

    update()
    {
        const { radius, height, open, theta, segments } = this.ins;
        const D2R = MathUtils.DEG2RAD;

        this.geometry = new ConeGeometry(
            radius.value,
            height.value,
            segments.value[0], segments.value[1],
            open.value,
            theta.value[0] * D2R, theta.value[1] * D2R
        );

        return true;
    }
}