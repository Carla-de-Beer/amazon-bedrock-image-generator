export type ImageParameters = {
    prompt: string;
    negativeText?: string;
    numberOfImages?: number;
    cfgScale?: number;
    isLandscape: boolean;
};