/**
 * FF Typescript Foundation Library
 * Copyright 2024 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { System } from "@ffweb/graph/System.js";

import {
    CustomElement,
    customElement,
    property,
    html,
    type PropertyValues,
    type TemplateResult
} from "@ffweb/ui/CustomElement.js";

////////////////////////////////////////////////////////////////////////////////

export { 
    System, 
    customElement, 
    property, 
    html, 
    type PropertyValues, 
    type TemplateResult 
};

export class SystemView extends CustomElement
{
    @property({ attribute: false })
    system: System;

    constructor(system?: System)
    {
        super();
        this.system = system;
    }
}