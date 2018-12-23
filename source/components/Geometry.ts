/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Node from "@ff/graph/Node";
import Component from "../Component";

////////////////////////////////////////////////////////////////////////////////

export default class Geometry extends Component
{
    static readonly type: string = "Geometry";

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