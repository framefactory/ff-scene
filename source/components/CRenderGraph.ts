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
    static readonly type: string = "CRenderGraph";

    set innerRoot(root: CHierarchy)
    {
        if (root.is(CTransform)) {
            const parent = this.components.get(CTransform);
            const previous = this.innerRoot as CTransform;
            const next = root as CTransform;

            if (parent && previous) {
                parent.removeObject3D(previous.object3D);
            }


            super.innerRoot = next;

            if (parent && next) {
                parent.addObject3D(next.object3D);
            }
        }
    }
}