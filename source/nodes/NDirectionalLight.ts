/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import NLight from "./NLight";
import CDirectionalLight from "../components/CDirectionalLight";

////////////////////////////////////////////////////////////////////////////////

export default class NDirectionalLight extends NLight
{
    static readonly type: string = "NDirectionalLight";

    get light() {
        return this.components.get(CDirectionalLight);
    }

    createComponents()
    {
        super.createComponents();
        this.createComponent(CDirectionalLight);
    }
}