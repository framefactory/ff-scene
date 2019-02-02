/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import NTransform from "./NTransform";
import CLight from "../components/CLight";

////////////////////////////////////////////////////////////////////////////////

export default class NLight extends NTransform
{
    get light() {
        return this.getComponent(CLight);
    }
}