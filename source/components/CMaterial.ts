/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Node from "@ff/graph/Node";
import RenderComponent from "../RenderComponent";

////////////////////////////////////////////////////////////////////////////////

export default class CMaterial extends RenderComponent
{
    static readonly type: string = "CMaterial";


    private _material: THREE.Material = null;

    constructor(node: Node, id?: string)
    {
        super(node, id);
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