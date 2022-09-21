/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { TorusGeometry } from "three";

import { types } from "@ffweb/graph/propertyTypes.js";

import { CGeometry } from "./CGeometry.js";

////////////////////////////////////////////////////////////////////////////////

export class CTorus extends CGeometry
{
    static readonly typeName: string = "CTorus";

    protected static readonly torusIns = {
        radius: types.Number("Torus.Radius", 10),
        tube: types.Number("Torus.Tube", 3),
        angle: types.Number("Torus.Angle", 360),
        segments: types.Vector2("Torus.Segments", [ 24, 12 ])
    };

    ins = this.addInputs(CTorus.torusIns);

    update()
    {
        const { radius, tube, angle, segments } = this.ins;

        this.geometry = new TorusGeometry(
            radius.value, tube.value,
            segments.value[0], segments.value[1],
            angle.value
        );

        return true;
    }
}