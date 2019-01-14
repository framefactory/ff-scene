/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { types } from "@ff/graph/propertyTypes";
import CMaterial from "./CMaterial";

////////////////////////////////////////////////////////////////////////////////

const ins = {
    color: types.ColorRGB("Color")
};

export default class CBasicMaterial extends CMaterial
{
    static readonly type: string = "CBasicMaterial";

    ins = this.addInputs(ins);

    create()
    {
        this.material = new THREE.MeshBasicMaterial();
    }

    update()
    {
        const material = this.material as THREE.MeshBasicMaterial;
        const { color } = this.ins;

        material.color.setRGB(color.value[0], color.value[1], color.value[2]);
        return true;
    }
}