/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Component from "@ff/graph/Component";

import CTransform from "./components/CTransform";
import RenderSystem from "./RenderSystem";

////////////////////////////////////////////////////////////////////////////////

/**
 * Base class for components in the ff/scene library.
 */
export default class RenderComponent extends Component
{
    static readonly type: string = "Component";

    get transform() {
        return this.node.components.get(CTransform);
    }

    get system(): RenderSystem {
        return this.node.system as RenderSystem;
    }
}