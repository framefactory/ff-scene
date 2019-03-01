/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Property from "@ff/graph/Property";

import CustomElement, {
    customElement,
    property,
    html
} from "@ff/ui/CustomElement";

import "./PropertyField";

////////////////////////////////////////////////////////////////////////////////

const _defaultLabels = [ "X", "Y", "Z", "W" ];

@customElement("ff-property-view")
export default class PropertyView extends CustomElement
{
    @property({ attribute: false })
    property: Property = null;

    protected firstConnected()
    {
        this.setStyle({
            display: "flex",
            overflow: "hidden"
        });

        this.classList.add("ff-property-view");
    }

    protected render()
    {
        const property = this.property;

        if (property.isArray()) {
            if (property.elementCount > 4) {
                return;
            }

            const labels = property.schema.labels || _defaultLabels;
            let fields = [];
            for (let i = 0; i < property.elementCount; ++i) {
                fields.push(html`
                    <div class="ff-label">${labels[i]}</div>
                    <ff-property-field .property=${property} .index=${i}></ff-property-field>
                `);
            }
            return html`${fields}`;
        }

        return html`<ff-property-field .property=${property}></ff-property-field>`;
    }
}