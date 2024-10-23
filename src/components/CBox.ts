/**
 * FF Typescript Foundation Library
 * Copyright 2024 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { BoxGeometry } from "three";

import { types } from "@ffweb/graph/propertyTypes.js";

import { CGeometry } from "./CGeometry.js";

////////////////////////////////////////////////////////////////////////////////

export class CBox extends CGeometry
{
    static readonly typeName: string = "CBox";

    protected static readonly boxIns = {
        size: types.Vector3("Box.Size", [ 10, 10, 10 ]),
        segments: types.Vector3("Box.Segments", [ 1, 1, 1])
    };

    ins = this.addInputs(CBox.boxIns);

    update()
    {
        const { size, segments } = this.ins;

        this.geometry = new BoxGeometry(
            size.value[0], size.value[1], size.value[2],
            segments.value[0], segments.value[1], segments.value[2]
        );

        return true;
    }
}