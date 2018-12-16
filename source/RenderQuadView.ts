/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import RenderSystem from "./RenderSystem";
import RenderView from "./RenderView";
import { EViewPreset, EProjection } from "../UniversalCamera";

////////////////////////////////////////////////////////////////////////////////

export enum EQuadViewLayout { Single, HorizontalSplit, VerticalSplit, Quad }

export default class RenderQuadView extends RenderView
{
    protected _horizontalSplit = 0.5;
    protected _verticalSplit = 0.5;
    protected _layout: EQuadViewLayout = EQuadViewLayout.Quad;

    constructor(system: RenderSystem, canvas: HTMLCanvasElement, overlay: HTMLElement)
    {
        super(system, canvas, overlay);

        this.addViewports(4);

        this.viewports[1].setBuiltInCamera(EProjection.Orthographic, EViewPreset.Top);
        this.viewports[1].enableCameraManip(true).orientationEnabled = false;

        this.viewports[2].setBuiltInCamera(EProjection.Orthographic, EViewPreset.Left);
        this.viewports[2].enableCameraManip(true).orientationEnabled = false;

        this.viewports[3].setBuiltInCamera(EProjection.Orthographic, EViewPreset.Front);
        this.viewports[3].enableCameraManip(true).orientationEnabled = false;

        this.layout = EQuadViewLayout.Single;
    }

    set layout(value: EQuadViewLayout) {
        if (this._layout !== value) {
            this._layout = value;
            this.updateConfiguration();
        }
    }

    get layout() {
        return this._layout;
    }

    set horizontalSplit(value: number) {
        this._horizontalSplit = value;
        this.updateSplitPositions();
    }

    get horizontalSplit() {
        return this._horizontalSplit;
    }

    set verticalSplit(value: number) {
        this._verticalSplit = value;
        this.updateSplitPositions();
    }

    get verticalSplit() {
        return this._verticalSplit;
    }

    protected updateConfiguration()
    {
        this.updateSplitPositions();
        this.viewports[0].enabled = true;

        switch (this._layout) {
            case EQuadViewLayout.Single:
                this.viewports[1].enabled = false;
                this.viewports[2].enabled = false;
                this.viewports[3].enabled = false;
                break;
            case EQuadViewLayout.HorizontalSplit:
            case EQuadViewLayout.VerticalSplit:
                this.viewports[1].enabled = true;
                this.viewports[2].enabled = false;
                this.viewports[3].enabled = false;
                break;
            case EQuadViewLayout.Quad:
                this.viewports[1].enabled = true;
                this.viewports[2].enabled = true;
                this.viewports[3].enabled = true;
                break;
        }
    }

    protected updateSplitPositions()
    {
        const h = this._horizontalSplit;
        const v = this._verticalSplit;

        switch (this._layout) {
            case EQuadViewLayout.Single:
                this.viewports[0].setSize(0, 0, 1, 1);
                break;
            case EQuadViewLayout.HorizontalSplit:
                this.viewports[0].setSize(0, 0, h, 1);
                this.viewports[1].setSize(h, 0, 1-h, 1);
                break;
            case EQuadViewLayout.VerticalSplit:
                this.viewports[0].setSize(0, 0, 1, v);
                this.viewports[1].setSize(0, v, 1, 1-v);
                break;
            case EQuadViewLayout.Quad:
                this.viewports[0].setSize(0, 0, h, v);
                this.viewports[1].setSize(h, 0, 1-h, v);
                this.viewports[2].setSize(0, v, h, 1-v);
                this.viewports[3].setSize(h, v, 1-h, 1-v);
                break;
        }
    }
}