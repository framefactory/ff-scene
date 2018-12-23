/**
 * FF Typescript Foundation Library
 * Copyright 2018 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import * as THREE from "three";

import { types } from "@ff/graph/propertyTypes";
import { IComponentEvent } from "@ff/graph/System"

import Component from "../Component";
import Scene from "./Scene";
import Camera from "./Camera";

////////////////////////////////////////////////////////////////////////////////

export default class Main extends Component
{
    static readonly type: string = "Main";

    protected scenes: Scene[] = [];
    protected cameras: Camera[] = [];

    protected selectedScene: Scene = null;
    protected selectedCamera: Camera = null;

    ins = this.ins.append({
        scene: types.Option("Scene"),
        camera: types.Option("Camera")
    });

    get sceneComponent(): Scene | null {
        return this.selectedScene;
    }

    get cameraComponent(): Camera | null {
        return this.selectedCamera;
    }

    get scene(): THREE.Scene | null {
        return this.selectedScene ? this.selectedScene.scene : null;
    }

    get camera(): THREE.Camera | null {
        return this.selectedCamera ? this.selectedCamera.camera : null;
    }

    create()
    {
        this.scenes = this.system.components.cloneArray(Scene);
        this.system.components.on(Scene, this.onSceneComponent, this);

        this.cameras = this.system.components.cloneArray(Camera);
        this.system.components.on(Camera, this.onCameraComponent, this);

        this.updateOptions();
    }

    update()
    {
        const ins = this.ins;

        if (ins.scene.changed) {
            const index = ins.scene.getOptionIndex();
            this.selectedScene = index >= 0 ? this.scenes[index] : null;
        }
        if (ins.camera.changed) {
            const index = ins.camera.getOptionIndex();
            this.selectedCamera = index >= 0 ? this.cameras[index] : null;
        }

        return true;
    }

    dispose()
    {
        this.system.components.off(Scene, this.onSceneComponent, this);
        this.system.components.off(Camera, this.onCameraComponent, this);
    }

    protected onSceneComponent(event: IComponentEvent<Scene>)
    {
        const inScene = this.ins.scene;

        if (event.add) {
            this.scenes.push(event.component);
            this.updateOptions();
        }
        else {
            const index = this.scenes.indexOf(event.component);
            this.scenes.splice(index, 1);

            this.updateOptions();

            if (!inScene.hasInLinks() && index <= inScene.value) {
                inScene.setValue(Math.max(0, inScene.value - 1));
            }
        }

        inScene.set();
    }

    protected onCameraComponent(event: IComponentEvent<Camera>)
    {
        const inCamera = this.ins.camera;

        if (event.add) {
            this.cameras.push(event.component);
            this.updateOptions();
        }
        else {
            const index = this.cameras.indexOf(event.component);
            this.cameras.splice(index, 1);

            this.updateOptions();

            if (!inCamera.hasInLinks() && index <= inCamera.value) {
                inCamera.setValue(Math.max(0, inCamera.value - 1));
            }
        }

        inCamera.set();
    }

    protected updateOptions()
    {
        const { scene, camera } = this.ins;

        if (this.scenes.length > 0) {
            scene.schema.options = this.scenes.map(scene => scene.name || scene.type);
        }
        else {
            scene.schema.options = [ "N/A" ];
        }
        scene.emit("update");

        if (this.cameras.length > 0) {
            camera.schema.options = this.cameras.map(camera => camera.name || camera.type);
        }
        else {
            camera.schema.options = [ "N/A" ];
        }
        camera.emit("update");
    }
}