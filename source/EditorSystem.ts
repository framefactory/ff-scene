/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Commander from "@ff/core/Commander";
import Registry from "@ff/graph/Registry";

import Selection, { INodeEvent, IComponentEvent } from "./Selection";
import RenderSystem from "./RenderSystem";

////////////////////////////////////////////////////////////////////////////////

export { INodeEvent, IComponentEvent };

/**
 * Extension of [[RenderSystem]]. Adds a selection controller.
 */
export default class EditorSystem extends RenderSystem
{
    readonly selection: Selection;

    constructor(commander: Commander, registry?: Registry)
    {
        super(registry);

        this.selection = new Selection(this, commander);
    }
}