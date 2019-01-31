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
    get transform() {
        return this.components.get(CTransform);
    }

    createComponents()
    {
        this.createComponent(CTransform);
    }


}