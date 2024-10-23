/**
 * FF Typescript Foundation Library
 * Copyright 2024 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { NTransform } from "./NTransform.js";
import { CScene } from "../components/CScene.js";

////////////////////////////////////////////////////////////////////////////////

export class NScene extends NTransform
{
    static readonly typeName: string = "NScene";

    get scene() {
        return this.getComponent(CScene);
    }

    createComponents()
    {
        this.createComponent(CScene);
    }
}