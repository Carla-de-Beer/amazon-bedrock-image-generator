export interface ImageDisplayState {
    base64Urls: string [],
    imageUrls: string [],
    isDone: boolean,
    isLoading: boolean,
    isOpen: boolean,
    fileFormat: string,
    filename: string,
    filenames: string[],
    currentImage: string,
    currentIndex: number
}
