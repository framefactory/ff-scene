/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { NTransform } from "./NTransform.js";
import { CLight } from "../components/CLight.js";

////////////////////////////////////////////////////////////////////////////////

export class NLight extends NTransform
{
    static readonly typeName: string = "NLight";

    get light() {
        return this.getComponent(CLight);
    }
}