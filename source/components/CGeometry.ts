/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Component from "@ff/graph/Component";

////////////////////////////////////////////////////////////////////////////////

export default class CGeometry extends Component
{
    private _geometry: THREE.BufferGeometry = null;

    
    constructor(id: string)
    {
        super(id);
        this.addEvent("geometry");
    }

    get geometry() {
        return this._geometry;
    }

    set geometry(value: THREE.BufferGeometry) {
        this._geometry = value;
        this.emit("geometry", value);
    }
}