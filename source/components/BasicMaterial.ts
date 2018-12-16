/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { types } from "@ff/graph";
import Material from "./Material";

////////////////////////////////////////////////////////////////////////////////

export default class BasicMaterial extends Material
{
    static readonly type: string = "BasicMaterial";

    ins = this.ins.append({
        color: types.ColorRGB("Color")
    });

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