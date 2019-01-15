/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import Component from "@ff/graph/Component";
import CPulse from "@ff/graph/components/CPulse";

import RenderView from "../RenderView";

////////////////////////////////////////////////////////////////////////////////

export default class CRenderer extends Component
{
    static readonly type: string = "CRenderer";
    static readonly isSystemSingleton: boolean = true;

    readonly views: RenderView[] = [];

    create()
    {
        this.trackComponent(CPulse, component => {
            component.on("pulse", this.onPulse, this)
        }, component => {
            component.off("pulse", this.onPulse, this);
        });
    }

    attachView(view: RenderView)
    {
        this.views.push(view);
        //console.log("RenderSystem.attachView - total views: %s", this.views.length);
    }

    detachView(view: RenderView)
    {
        const index = this.views.indexOf(view);
        if (index < 0) {
            throw new Error("render view not registered");
        }
        this.views.splice(index, 1);
        //console.log("RenderSystem.detachView - total views: %s", this.views.length);
    }

    protected onPulse()
    {
        this.views.forEach(view => {
            view.render();
        });
    }
}