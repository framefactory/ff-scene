/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Node from "@ff/graph/Node";
import Component from "../Component";

////////////////////////////////////////////////////////////////////////////////

export default class Material extends Component
{
    static readonly type: string = "Material";

    static readonly materialEvent = "material";

    private _material: THREE.Material = null;

    constructor(node: Node, id?: string)
    {
        super(node, id);
        this.addEvent(Material.materialEvent);
    }

    get material() {
        return this._material;
    }

    set material(value: THREE.Material) {
        this._material = value;
        this.emitAny(Material.materialEvent, value);
    }
}