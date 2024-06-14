import React from 'react';
import {
    Box,
    CircularProgress,
    FormControl,
    FormControlLabel,
    FormLabel,
    ImageList,
    ImageListItem,
    Radio,
    RadioGroup, TextField,
    Typography
} from '@mui/material';
import axios, {AxiosResponse} from 'axios';
import {ImageParameters} from '../../types/complexTypes';
import './ImageDisplay.scss';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import html2canvas from 'html2canvas';

export default class ImageDisplay extends React.Component<{
    parameters: ImageParameters,
    parentCallbackIsLoading(isLoading: boolean): void,
    parentCallbackIsDisabled(isDisabled: boolean): void
}> {

    constructor(props: any) {
        super(props);
        this.injectHtml2canvas();
    }

    state = {
        imageUrls: [],
        isDone: false,
        isLoading: true,
        isOpen: false,
        fileFormat: 'jpeg',
        filename: '',
        filenames: [''],
        currentImage: '',
        currentIndex: 0
    };

    quotes: string[] = [
        'Anytime someone tells me that I can\'t do something, I want to do it more.',
        'If you are lucky enough to find something that you love, and you have a shot at being good at it, don\'t stop, don\'t put it down.'
    ];

    setOpen = (isOpen: boolean): void => {
        this.setState({
            isOpen: isOpen
        });
    };

    setFileFormat = (fileFormat: string): void => {
        this.setState({
            fileFormat: fileFormat
        });
    };

    setFilename = (filename: string): void => {
        this.setState({
            filename: filename
        });
    };

    setCurrentImage = (currentImage: string): void => {
        this.setState({
            currentImage: currentImage
        });
    };

    setCurrentIndex = (currentIndex: number): void => {
        this.setState({
            currentIndex: currentIndex
        });
    };

    handleClose = () => this.setOpen(false);

    handleRadioChange = (event: any): void => {
        this.setFileFormat(event.target.value);
    };

    injectScript = (uri: string): void => {
        const document: Document = window.document;
        const script: HTMLScriptElement = document.createElement('script');
        script.setAttribute('src', uri);
        document.body.appendChild(script);
    };

    injectHtml2canvas = (): void => {
        this.injectScript('//html2canvas.hertzen.com/dist/html2canvas.js');
    };

    saveScreenshot = (canvas: any): void => {
        let fileName: string = this.state.filename;

        if (!fileName) {
            fileName = this.state.filenames[this.state.currentIndex];
        }

        const link: HTMLAnchorElement = document.createElement('a');
        link.download = fileName + '.' + this.state.fileFormat;
        canvas.toBlob((blob: any): void => {
            link.href = URL.createObjectURL(blob);
            link.click();
        });
    };

    downloadImage = async (): Promise<void> => {
        this.setOpen(false);
        const canvas: HTMLCanvasElement = await html2canvas(document.querySelector(this.state.currentImage) as HTMLElement, {
            allowTaint: true,
            useCORS: true
        });

        this.setFilename('');

        return this.saveScreenshot(canvas);
    };

    componentDidMount(): void {
        this.props.parentCallbackIsDisabled(true);
        this.props.parentCallbackIsLoading(true);

        axios.post('API-GATEWAY-URL-GOES-HERE', {
            prompt: this.props.parameters.prompt,
            numberOfImages: this.props.parameters.numberOfImages,
            landscapeFormat: this.props.parameters.landscapeFormat
        }, {
            responseType: 'arraybuffer',
        }).then((response: AxiosResponse<any, any>): void => {
                const s3Requests: Promise<AxiosResponse<any>>[] = [];

                const presignedUrls: string[] = JSON.parse(new TextDecoder().decode(response.data));

                for (const presignedUrl of presignedUrls) {
                    const request = axios.get(presignedUrl, {responseType: 'arraybuffer'});
                    s3Requests.push(request);
                }

                axios.all(s3Requests)
                    .then(axios.spread((...responses: AxiosResponse<any, any>[]): void => {
                        const imageUrls: string[] = [];
                        const filenames: string [] = [];

                        for (const response of responses) {
                            filenames.push(this.extractName(response.config.url as string));
                            let base64ImageString: string = btoa(new Uint8Array(response.data)
                                .reduce((data: string, byte: number) => data + String.fromCharCode(byte), ''));

                            const imageUrl: string = 'data:image/PNG;base64,' + base64ImageString.trim();
                            imageUrls.push(imageUrl);
                        }

                        this.setState({
                            imageUrls,
                            isDone: true,
                            isLoading: false,
                            filenames: [...filenames]
                        });

                        this.props.parentCallbackIsLoading(false);

                    })).catch(error => {
                    console.log(error)
                });
            }
        ).catch(error => {
            console.error(error);
        });
    }

    extractName(url: string): string {
        const regex = /\/([\d-]+-ai-image)\?/;
        const match = url.match(regex);
        return match ? match[1] : 'ai-image';
    }

    getRandomInt(): number {
        return Math.floor(Math.random() * (this.quotes.length));
    }

    render(): React.JSX.Element {
        return (
            <>
                <br/>
                <div
                    style={{marginLeft: this.state.isDone && !this.props.parameters.landscapeFormat ? '-30px' : '-10px'}}>
                    {!this.state.isDone &&
                        <div style={{
                            fontStyle: 'italic',
                            color: '#646464',
                            fontFamily: 'sans-serif'
                        }}>
                            <p>
                            <span style={{
                                fontSize: '20px',
                                fontWeight: 'bolder'
                            }}>
                                {this.quotes[this.getRandomInt()]}
                            </span>
                            </p>
                            <p style={{
                                fontSize: '14px',
                                fontWeight: 'normal'
                            }}>
                                Taylor Swift
                            </p>
                            <br/>
                        </div>}
                    {!this.state.isDone && <CircularProgress/>}
                    {this.state.imageUrls?.length > 0 &&
                        <ImageList
                            sx={
                                this.props.parameters.landscapeFormat
                                    ? {width: 1650, height: 525, paddingLeft: -8}
                                    : {width: 1400, height: 1200, paddingLeft: -25}}
                            cols={this.props.parameters.landscapeFormat ? 2 : 3}
                            rowHeight={500}>
                            {this.state.imageUrls.map((url: string, index: number) => (
                                <ImageListItem key={url}>
                                    <Button
                                        key={url}
                                        onClick={(): void => {
                                            this.setCurrentImage(`#image-${index}`);
                                            this.setCurrentIndex(index);
                                            this.setOpen(true);
                                        }}
                                        className={'image-box'}
                                        style={{border: 'none', background: 'none', padding: 0}}>
                                        <img
                                            src={url}
                                            id={'image-' + index}
                                            alt='Base64 Image'
                                            className={'image-box'}
                                        />
                                    </Button>
                                </ImageListItem>
                            ))}
                        </ImageList>
                    }
                </div>
                <Modal
                    open={this.state.isOpen}
                    onClose={this.handleClose}
                    aria-labelledby='modal-modal-title'
                    aria-describedby='modal-modal-description'>
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 700,
                            bgcolor: 'background.paper',
                            border: '1px solid #2563c0',
                            boxShadow: 24,
                            p: 4
                        }}>
                        <Typography
                            id='modal-modal-title'
                            variant='h6'
                            component='h2'>
                            Download Options
                        </Typography>
                        <br/><br/>
                        <FormControl>
                            <FormLabel id='demo-radio-buttons-group-label'>File Format</FormLabel>
                            <RadioGroup
                                aria-labelledby='demo-radio-buttons-group-label'
                                defaultValue='jpeg'
                                name='radio-buttons-group'
                                onChange={this.handleRadioChange}>
                                <FormControlLabel
                                    value='jpeg'
                                    control={<Radio/>}
                                    label='jpeg'
                                />
                                <FormControlLabel
                                    value='png'
                                    control={<Radio/>} label='png'
                                />
                                <FormControlLabel
                                    value='tiff'
                                    control={<Radio/>} label='tiff'
                                />
                            </RadioGroup>
                        </FormControl>
                        <br/><br/>
                        <TextField
                            label='Image name'
                            sx={{width: 200}}
                            defaultValue={this.state.filenames[this.state.currentIndex]}
                            onBlur={e => {
                                this.setFilename(e.target.value);
                            }}/>
                        <br/><br/><br/>
                        <Typography id='modal-modal-description' sx={{mt: 2}}>
                            <Button
                                variant='contained'
                                onClick={this.downloadImage}>Download Image</Button>
                        </Typography>
                    </Box>
                </Modal>
            </>
        )
    }
}
