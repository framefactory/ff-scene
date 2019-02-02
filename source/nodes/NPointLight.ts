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
    get light() {
        return this.getComponent(CPointLight);
    }

    createComponents()
    {
        super.createComponents();
        this.createComponent(CPointLight);
    }
}