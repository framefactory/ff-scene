/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";
import{ types } from "@ff/graph";
import Geometry from "./Geometry";

////////////////////////////////////////////////////////////////////////////////

export default class Torus extends Geometry
{
    static readonly type: string = "Torus";

    ins = this.ins.append({
        radius: types.Number("Radius", 10),
        tube: types.Number("Tube", 3),
        angle: types.Number("Angle", 360),
        segments: types.Vector2("Segments", [ 24, 12 ])
    });

    update()
    {
        const { radius, tube, angle, segments } = this.ins;

        this.geometry = new THREE.TorusBufferGeometry(
            radius.value, tube.value,
            segments.value[0], segments.value[1],
            angle.value
        );

        return true;
    }
}