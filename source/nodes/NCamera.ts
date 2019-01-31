/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import NTransform from "./NTransform";
import CCamera, { EProjection } from "../components/CCamera";

////////////////////////////////////////////////////////////////////////////////

export { EProjection };

export default class NCamera extends NTransform
{
    get camera() {
        return this.components.get(CCamera);
    }

    createComponents()
    {
        super.createComponents();
        this.createComponent(CCamera);
    }
}