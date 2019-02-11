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

const _inputs = {
    color: types.ColorRGB("Color")
};

export default class CPhongMaterial extends CMaterial
{
    static readonly typeName: string = "CPhongMaterial";

    ins = this.addInputs(_inputs);


    create()
    {
        this.material = new THREE.MeshPhongMaterial();
    }

    update()
    {
        const material = this.material as THREE.MeshBasicMaterial;
        const { color } = this.ins;

        if (color.changed) {
            const rgb = color.value;
            material.color.setRGB(rgb[0], rgb[1], rgb[2]);
        }

        return true;
    }
}