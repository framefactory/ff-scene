/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { types } from "@ff/graph/propertyTypes";

import Component from "@ff/graph/Component";

////////////////////////////////////////////////////////////////////////////////

export default class CMaterial extends Component
{
    static readonly typeName: string = "CMaterial";

    outs = this.addOutputs({ self: types.Object("Material", CMaterial) });

    private _material: THREE.Material = null;

    get material() {
        return this._material;
    }

    set material(material: THREE.Material) {
        this._material = material;
        this.outs.self.setValue(material ? this : null);
    }
}