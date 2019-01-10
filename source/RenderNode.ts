/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Node from "@ff/graph/Node";

import Transform from "./components/Transform";
import RenderSystem from "./RenderSystem";

////////////////////////////////////////////////////////////////////////////////

export default class RenderNode extends Node
{
    static readonly type: string = "Node";

    readonly system: RenderSystem;

    get transform() {
        return this.components.get(Transform);
    }
}