/**
 * FF Typescript Foundation Library
 * Copyright 2024 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { PropertySocket } from "@ffweb/graph/PropertySocket.js";

import { ColorButton, IColorEditChangeEvent } from "@ffweb/ui/ColorButton.js";

import {
    CustomElement,
    customElement,
    property,
    html,
    type TemplateResult
} from "@ffweb/lit/CustomElement.js";

import "./PropertyField.js";

////////////////////////////////////////////////////////////////////////////////

const _defaultLabels = [ "X", "Y", "Z", "W" ];

@customElement("ff-property-view")
export class PropertyView extends CustomElement
{
    @property({ attribute: false })
    property: PropertySocket<any> = null;

    protected editButton: HTMLElement = null;

    constructor()
    {
        super();
        this.onColorChange = this.onColorChange.bind(this);
    }
    
    protected firstConnected()
    {
        this.classList.add("ff-property-view");
    }

    protected connected()
    {
        this.property.on("value", this.onPropertyValue, this);
    }

    protected disconnected()
    {
        this.property.off("value", this.onPropertyValue, this);
    }

    protected render(): TemplateResult
    {
        const property = this.property;
        const schema = property.schema;

        if (schema.semantic === "color") {
            const button = new ColorButton();
            button.selectable = true;
            button.numeric = true;
            button.color.fromArray(property.value);
            button.alpha = property.elementCount > 3;
            button.addEventListener("change", this.onColorChange);
            this.editButton = button;
        }
        else if (property.type === "number" && property.elementCount > 1) {
            this.editButton = null;
        }
        else if (property.type === "string" && property.elementCount === 1) {
            this.editButton = null;
        }

        if (property.isArray()) {
            if (property.elementCount > 4) {
                return;
            }

            const labels = property.schema.labels || _defaultLabels;
            const fields = [];
            for (let i = 0; i < property.elementCount; ++i) {
                fields.push(html`
                    <div class="ff-label">${labels[i]}</div>
                    <ff-property-field .property=${property} .index=${i}></ff-property-field>
                `);
            }
            return html`${fields}<div class="ff-edit-button">${this.editButton}</div>`;
        }

        return html`<ff-property-field .property=${property}></ff-property-field>
            <div class="ff-edit-button">${this.editButton}</div>`;
    }

    protected onColorChange(event: IColorEditChangeEvent)
    {
        const color = event.detail.color;
        const property = this.property;

        if (property.elementCount > 3) {
            color.toRGBAArray(property.value);
        }
        else {
            color.toRGBArray(property.value);
        }

        property.set();
    }

    protected onPropertyValue(value: any)
    {
        const editButton = this.editButton;
        if (editButton instanceof ColorButton) {
            editButton.color.fromArray(value);
            editButton.requestUpdate();
        }
    }
}