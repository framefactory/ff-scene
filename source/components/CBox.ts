/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { types } from "@ff/graph/propertyTypes";
import { IPointerEvent } from "../RenderView";
import CGeometry from "./CGeometry";

////////////////////////////////////////////////////////////////////////////////

const ins = {
    size: types.Vector3("Size", [ 10, 10, 10 ]),
    segments: types.Vector3("Segments", [ 1, 1, 1])
};

export default class CBox extends CGeometry
{
    static readonly type: string = "CBox";

    ins = this.addInputs(ins);

    create()
    {
        super.create();
        this.on("pointer", this.onPointer, this);
    }

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

    protected onPointer(event: IPointerEvent)
    {
    }
}