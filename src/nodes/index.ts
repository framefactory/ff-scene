/**
 * FF Typescript Foundation Library
 * Copyright 2022 Ralph Wiedemeier, Frame Factory GmbH
 *
 * License: MIT
 */

import { NCamera } from "./NCamera.js";
import { NDirectionalLight } from "./NDirectionalLight.js";
import { NPointLight } from "./NPointLight.js";
import { NScene } from "./NScene.js";
import { NSpotLight } from "./NSpotLight.js";
import { NTransform } from "./NTransform.js";

////////////////////////////////////////////////////////////////////////////////

export {
    NCamera,
    NDirectionalLight,
    NPointLight,
    NScene,
    NSpotLight,
    NTransform
};

export const nodeTypes = [
    NCamera,
    NDirectionalLight,
    NPointLight,
    NScene,
    NSpotLight,
    NTransform
];