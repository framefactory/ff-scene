/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { NLight } from "./NLight.js";
import { CPointLight } from "../components/CPointLight.js";

////////////////////////////////////////////////////////////////////////////////

export class NPointLight extends NLight
{
    static readonly typeName: string = "NPointLight";

    get light() {
        return this.getComponent(CPointLight);
    }

    createComponents()
    {
        super.createComponents();
        this.createComponent(CPointLight);
    }
}