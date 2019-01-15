/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Component from "@ff/graph/Component";
import Node from "@ff/graph/Node";

////////////////////////////////////////////////////////////////////////////////

export default class CGeometry extends Component
{
    static readonly type: string = "CGeometry";

    private _geometry: THREE.BufferGeometry = null;

    constructor(node: Node, id?: string)
    {
        super(node, id);
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