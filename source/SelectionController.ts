/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Commander from "@ff/core/Commander";
import SelectionControllerBase from "@ff/graph/SelectionController";

import { IPointerEvent } from "./RenderView";
import RenderSystem from "./RenderSystem";

////////////////////////////////////////////////////////////////////////////////

export default class SelectionController extends SelectionControllerBase
{
    protected startX = 0;
    protected startY = 0;

    constructor(system: RenderSystem, commander: Commander)
    {
        super(system, commander);
        system.on<IPointerEvent>("pointer-down", this.onPointerDown, this);
        system.on<IPointerEvent>("pointer-up", this.onPointerUp, this);
    }

    dispose()
    {
        super.dispose();
        this.system.off<IPointerEvent>("pointer-down", this.onPointerDown, this);
        this.system.off<IPointerEvent>("pointer-up", this.onPointerUp, this);
    }

    protected onPointerDown(event: IPointerEvent)
    {
        if (event.isPrimary) {
            this.startX = event.centerX;
            this.startY = event.centerY;
        }
    }

    protected onPointerUp(event: IPointerEvent)
    {
        if (event.isPrimary) {
            const distance = Math.abs(this.startX - event.centerX) + Math.abs(this.startY - event.centerY);
            if (distance < 2) {
                this.selectNode(event.node, event.ctrlKey);
            }
        }
    }
}