/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { Component, Node, types } from "@ffweb/graph/Component.js";
import { IRenderContext } from "./CScene.js";

////////////////////////////////////////////////////////////////////////////////

export { Node, types };

export class CRenderable extends Component
{
    static readonly typeName: string = "CRenderable";

    /**
     * This is called right before the graph's scene is rendered to a specific viewport/view.
     * Override to make adjustments specific to the renderer, view or viewport.
     * @param context
     */
    preRender(context: IRenderContext)
    {
        // optional override
    }

    /**
     * This is called right after the graph's scene has been rendered to a specific viewport/view.
     * Override to make adjustments specific to the renderer, view or viewport.
     * @param context
     */
    postRender(context: IRenderContext)
    {
        // optional override
    }
}

CRenderable.prototype.preRender = null;
CRenderable.prototype.postRender = null;