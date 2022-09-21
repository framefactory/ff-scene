/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { CSelection } from "@ffweb/graph/components/CSelection.js";

import {
    SystemView,
    customElement,
    property,
    html,
    type PropertyValues,
    type TemplateResult
} from "./SystemView.js";

////////////////////////////////////////////////////////////////////////////////

export {
    customElement, 
    property, 
    html, 
    type PropertyValues, 
    type TemplateResult 
};

export class SelectionView extends SystemView
{
    protected selection: CSelection = null;

    protected firstConnected()
    {
        this.selection = this.system.getComponent(CSelection);
    }
}