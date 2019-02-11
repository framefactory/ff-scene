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

export default class CGeometry extends Component
{
    static readonly typeName: string = "CGeometry";

    outs = this.addOutputs({ self: types.Object("Geometry", CGeometry) });

    private _geometry: THREE.BufferGeometry = null;
    
    get geometry() {
        return this._geometry;
    }

    set geometry(geometry: THREE.BufferGeometry) {
        this._geometry = geometry;
        this.outs.self.setValue(geometry ? this : null);
    }
}