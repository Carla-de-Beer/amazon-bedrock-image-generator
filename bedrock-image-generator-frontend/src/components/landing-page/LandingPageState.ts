import {Orientation} from './Constants';

export interface LandingPageState {
    prompt: string,
    negativeText: string,
    numberOfImages: number,
    cfgScale: number,
    orientation: Orientation,
    isLandscape: boolean,
    isShow: boolean,
    isDisabled: boolean,
    isLoading: boolean,
    isValidationError: boolean
}
