/**
 * FF Typescript Foundation Library
 * Copyright 2024 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { NLight } from "./NLight.js";
import { CSpotLight } from "../components/CSpotLight.js";

////////////////////////////////////////////////////////////////////////////////

export class NSpotLight extends NLight
{
    static readonly typeName: string = "NSpotLight";

    get light() {
        return this.getComponent(CSpotLight);
    }

    createComponents()
    {
        super.createComponents();
        this.createComponent(CSpotLight);
    }
}