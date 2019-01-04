/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import SubgraphBase from "@ff/graph/Subgraph";
import Hierarchy from "@ff/graph/Hierarchy";
import Transform from "./Transform";

////////////////////////////////////////////////////////////////////////////////

export default class Subgraph extends SubgraphBase
{
    static readonly type: string = "Subgraph";

    set root(root: Hierarchy)
    {
        if (root.is(Transform)) {
            const parentTransform = this.components.get(Transform);
            const previous = this.root as Transform;

            if (previous) {
                parentTransform.removeChild(previous);
            }

            this.root = root as Transform;

            if (root) {
                parentTransform.addChild(root as Transform);
            }
        }
    }
}