/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import {
    customElement,
    property,
    html,
    PropertyValues,
    TemplateResult
} from "@ff/ui/CustomElement";

import CDocumentManager, { IActiveDocumentEvent } from "@ff/graph/components/CDocumentManager";

import SystemView from "./SystemView";

////////////////////////////////////////////////////////////////////////////////

export { customElement, property, html, PropertyValues, TemplateResult };

export default class DocumentView extends SystemView
{
    protected get documentManager() {
        return this.system.getMainComponent(CDocumentManager);
    }
    protected get activeDocument() {
        return this.documentManager.activeDocument;
    }

    protected connected()
    {
        this.documentManager.on<IActiveDocumentEvent>("active-document", this.onActiveDocument, this);

        const activeDocument = this.documentManager.activeDocument;
        if (activeDocument) {
            this.onActiveDocument({ type: "active-document", previous: activeDocument, next: null });
        }
    }

    protected disconnected()
    {
        const activeDocument = this.documentManager.activeDocument;
        if (activeDocument) {
            this.onActiveDocument({ type: "active-document", previous: null, next: activeDocument });
        }

        this.documentManager.on<IActiveDocumentEvent>("active-document", this.onActiveDocument, this);
    }

    protected onActiveDocument(event: IActiveDocumentEvent)
    {
    }
}