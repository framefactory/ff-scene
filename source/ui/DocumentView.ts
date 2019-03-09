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

import CDocumentManager from "@ff/graph/components/CDocumentManager";
import CDocument from "@ff/graph/components/CDocument";

import SystemView from "./SystemView";

////////////////////////////////////////////////////////////////////////////////

export { customElement, property, html, PropertyValues, TemplateResult };

export default class DocumentView extends SystemView
{
    private _activeDocument: CDocument = null;

    protected get documentManager() {
        return this.system.getMainComponent(CDocumentManager);
    }
    protected get activeDocument() {
        return this._activeDocument;
    }

    protected connected()
    {
        const activeDocumentProp = this.documentManager.outs.activeDocument;
        activeDocumentProp.on("value", this._onActiveDocument, this);
        this._onActiveDocument(activeDocumentProp.value);
    }

    protected disconnected()
    {
        this._onActiveDocument(null);
        this.documentManager.outs.activeDocument.off("value", this._onActiveDocument, this);
    }

    protected onActiveDocument(previous: CDocument, next: CDocument)
    {
    }

    private _onActiveDocument(document: CDocument)
    {
        if (document !== this._activeDocument) {
            this.onActiveDocument(this._activeDocument, document);
            this._activeDocument = document;
        }
    }
}