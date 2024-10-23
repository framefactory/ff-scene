/**
 * FF Typescript Foundation Library
 * Copyright 2024 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { NHierarchy } from "@ffweb/graph/nodes/NHierarchy.js";
import { CTransform } from "../components/CTransform.js";

////////////////////////////////////////////////////////////////////////////////

export class NTransform extends NHierarchy
{
    static readonly typeName: string = "NTransform";

    get transform() {
        return this.getComponent(CTransform);
    }

    createComponents()
    {
        this.createComponent(CTransform);
    }


}