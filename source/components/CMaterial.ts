/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Component from "@ff/graph/Component";

////////////////////////////////////////////////////////////////////////////////

export default class CMaterial extends Component
{
    static readonly type: string = "CMaterial";


    private _material: THREE.Material = null;

    constructor(id: string)
    {
        super(id);
        this.addEvent("material");
    }

    get material() {
        return this._material;
    }

    set material(value: THREE.Material) {
        this._material = value;
        this.emit("material", value);
    }
}