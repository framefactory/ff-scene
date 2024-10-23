/**
 * FF Typescript Foundation Library
 * Copyright 2024 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { NLight } from "./NLight.js";
import { CDirectionalLight } from "../components/CDirectionalLight.js";

////////////////////////////////////////////////////////////////////////////////

export class NDirectionalLight extends NLight
{
    static readonly typeName: string = "NDirectionalLight";

    get light() {
        return this.getComponent(CDirectionalLight);
    }

    createComponents()
    {
        super.createComponents();
        this.createComponent(CDirectionalLight);
    }
}