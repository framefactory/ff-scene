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

export default class CPhongMaterial extends CMaterial
{
    static readonly typeName: string = "CPhongMaterial";

    protected static readonly phongMatIns = {
        color: types.ColorRGB("Color"),
        opacity: types.Percent("Opacity", 1),
    };

    ins = this.addInputs(CPhongMaterial.phongMatIns);

    create()
    {
        this.material = new THREE.MeshPhongMaterial();
    }

    update()
    {
        const material = this.material as THREE.MeshBasicMaterial;
        const { color, opacity } = this.ins;

        material.color.setRGB(color.value[0], color.value[1], color.value[2]);
        material.opacity = opacity.value;
        material.transparent = opacity.value < 1;

        return true;
    }
}