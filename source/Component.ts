/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import ComponentBase, {
    IComponentChangeEvent as IComponentBaseChangeEvent
} from "@ff/graph/Component";

import Transform from "./components/Transform";
import RenderSystem from "./RenderSystem";

////////////////////////////////////////////////////////////////////////////////

export interface IComponentChangeEvent<T extends Component = Component> extends IComponentBaseChangeEvent<T>
{
}

/**
 * Base class for components in the ff/scene library.
 */
export default class Component extends ComponentBase
{
    get transform() {
        return this.node.components.get(Transform);
    }

    get system(): RenderSystem {
        return this.node.system as RenderSystem;
    }
}