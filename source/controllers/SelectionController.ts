/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Commander from "@ff/core/Commander";
import SelectionControllerBase from "@ff/graph/SelectionController";
import RenderSystem, { IPointerEvent, EPointerEventType } from "../RenderSystem";

////////////////////////////////////////////////////////////////////////////////

export default class SelectionController extends SelectionControllerBase
{
    protected startX = 0;
    protected startY = 0;

    constructor(system: RenderSystem, commander: Commander)
    {
        super(system, commander);
        system.on("pointer", this.onSystemPointer, this);
    }

    dispose()
    {
        super.dispose();
        this.system.off("pointer", this.onSystemPointer, this);
    }

    protected onSystemPointer(event: IPointerEvent)
    {
        if (event.isPrimary) {
            if (event.type === EPointerEventType.Down) {
                this.startX = event.centerX;
                this.startY = event.centerY;
            }
            else if (event.type === EPointerEventType.Up) {
                const distance = Math.abs(this.startX - event.centerX) + Math.abs(this.startY - event.centerY);
                if (distance < 2) {
                    this.selectNode(event.node, event.ctrlKey);
                }
            }
        }
    }
}