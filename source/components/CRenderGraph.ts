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

    set root(root: CHierarchy)
    {
        if (root.is(CTransform)) {
            const parentTransform = this.components.get(CTransform);
            const previous = this.root as CTransform;

            if (previous) {
                parentTransform.removeChild(previous);
            }

            this.root = root as CTransform;

            if (root) {
                parentTransform.addChild(root as CTransform);
            }
        }
    }
}