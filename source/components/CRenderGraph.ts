/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import CHierarchy from "@ff/graph/components/CHierarchy";
import CGraph from "@ff/graph/components/CGraph";

import CTransform from "./CTransform";

////////////////////////////////////////////////////////////////////////////////

export default class CRenderGraph extends CGraph
{
    set innerRoot(root: CHierarchy)
    {
        if (root.is(CTransform)) {
            const parent = this.getComponent(CTransform);
            const previous = this.innerRoot as CTransform;
            const next = root as CTransform;

            if (parent && previous) {
                parent.object3D.remove(previous.object3D);
            }

            super.innerRoot = next;

            if (parent && next) {
                parent.object3D.add(next.object3D);
            }
        }
    }
}