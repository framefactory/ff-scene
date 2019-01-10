/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Commander from "@ff/core/Commander";
import Registry from "@ff/graph/Registry";

import SelectionController, { INodeEvent, IComponentEvent } from "./SelectionController";
import RenderSystem, { IRenderContext } from "./RenderSystem";

////////////////////////////////////////////////////////////////////////////////

export { IRenderContext, INodeEvent, IComponentEvent };

/**
 * Extension of [[RenderSystem]]. Adds a selection controller.
 */
export default class EditorSystem extends RenderSystem
{
    readonly selectionController: SelectionController;

    constructor(commander: Commander, registry?: Registry)
    {
        super(registry);

        this.selectionController = new SelectionController(this, commander);
    }
}