export const MAX_PROMPT_SIZE_IN_CHARS: number = 512;

export enum Orientation {
    LANDSCAPE = 'landscape',
    PORTRAIT = 'portrait'
}

export const DEFAULT_SETTINGS = {
    NUM_IMAGES: 1,
    NUM_IMAGES_MIN: 1,
    NUM_IMAGES_MAX: 2,
    CFG_SCALE: 7.5,
    CFG_SCALE_MIN: 1.5,
    CFG_SCALE_MAX: 10.0,
    CFG_SCALE_STEP: 0.5,
    ORIENTATION: Orientation.LANDSCAPE,
    IS_LANDSCAPE: true,
    IS_SHOW: false,
    IS_DISABLED: false,
    IS_LOADING: false,
    IS_VALIDATION_ERROR: false
} as const;

export const marksNumImages = [
    {
        value: 1,
        label: '1',
    },
    {
        value: 2,
        label: '2',
    },
    {
        value: 3,
        label: '3',
    }
];

export const marksCfgScale = [
    {
        value: 1,
        label: '1.1',
    },
    {
        value: 2,
        label: '2.0',
    },
    {
        value: 3,
        label: '3.0',
    },
    {
        value: 4,
        label: '4.0',
    },
    {
        value: 5,
        label: '5.0',
    },
    {
        value: 6,
        label: '6.0',
    },
    {
        value: 7,
        label: '7.0',
    },
    {
        value: 8,
        label: '8.0',
    },
    {
        value: 9,
        label: '9.0',
    },
    {
        value: 10,
        label: '10.0',
    }
];