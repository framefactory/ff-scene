/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { types } from "@ff/graph/propertyTypes";

import CGeometry from "./CGeometry";

////////////////////////////////////////////////////////////////////////////////

const _inputs = {
    size: types.Vector3("Box.Size", [ 10, 10, 10 ]),
    segments: types.Vector3("Box.Segments", [ 1, 1, 1])
};

export default class CBox extends CGeometry
{
    ins = this.addInputs<CGeometry, typeof _inputs>(_inputs);


    update()
    {
        const { size, segments } = this.ins;

        if (size.changed || segments.changed) {
            this.geometry = new THREE.BoxBufferGeometry(
                size.value[0], size.value[1], size.value[2],
                segments.value[0], segments.value[1], segments.value[2]
            );
        }

        return true;
    }
}