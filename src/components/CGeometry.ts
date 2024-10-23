/**
 * FF Typescript Foundation Library
 * Copyright 2024 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { BufferGeometry } from "three";

import { types } from "@ffweb/graph/propertyTypes.js";

import { Component } from "@ffweb/graph/Component.js";

////////////////////////////////////////////////////////////////////////////////

export class CGeometry extends Component
{
    static readonly typeName: string = "CGeometry";

    protected static readonly geometryOuts = {
        self: types.Object("Geometry", CGeometry)
    };

    outs = this.addOutputs(CGeometry.geometryOuts);

    private _geometry: BufferGeometry = null;
    
    get geometry() {
        return this._geometry;
    }

    set geometry(geometry: BufferGeometry) {
        if (geometry !== this._geometry) {
            if (this._geometry) {
                this._geometry.dispose();
            }

            this._geometry = geometry;
            this.outs.self.setValue(geometry ? this : null);
        }
    }
}