/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import NHierarchy from "@ff/graph/nodes/NHierarchy";
import CTransform from "../components/CTransform";

////////////////////////////////////////////////////////////////////////////////

export default class NTransform extends NHierarchy
{
    static readonly type: string = "NTransform";

    get transform() {
        return this.components.get(CTransform);
    }

    createComponents()
    {
        this.createComponent(CTransform);
    }


}