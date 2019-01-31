/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import NTransform from "./NTransform";
import CScene from "../components/CScene";

////////////////////////////////////////////////////////////////////////////////

export default class NScene extends NTransform
{
    get scene() {
        return this.components.get(CScene);
    }

    createComponents()
    {
        this.createComponent(CScene);
    }
}