/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { NTransform } from "./NTransform.js";
import { CCamera, EProjection } from "../components/CCamera.js";

////////////////////////////////////////////////////////////////////////////////

export { EProjection };

export class NCamera extends NTransform
{
    static readonly typeName: string = "NCamera";

    get camera() {
        return this.getComponent(CCamera);
    }

    createComponents()
    {
        super.createComponents();
        this.createComponent(CCamera);
    }
}