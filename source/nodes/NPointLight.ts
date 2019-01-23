/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import NLight from "./NLight";
import CPointLight from "../components/CPointLight";

////////////////////////////////////////////////////////////////////////////////

export default class NPointLight extends NLight
{
    static readonly type: string = "NPointLight";

    get light() {
        return this.components.get(CPointLight);
    }

    createComponents()
    {
        super.createComponents();
        this.createComponent(CPointLight);
    }
}