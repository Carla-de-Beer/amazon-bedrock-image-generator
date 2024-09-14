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
    RadioGroup,
    TextField,
    Typography
} from '@mui/material';
import axios, {AxiosResponse} from 'axios';
import {ImageParameters} from '../../types/complexTypes';
import './ImageDisplay.scss';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Stopwatch from '../stopwatch/Stopwatch';

import {ImageDisplayState} from './ImageDisplayState';

const API_GATEWAY_URL = 'https://<GATEWAY_API_ID>.execute-api.<REGION>.amazonaws.com/<STAGE>/<RESOURCE>';

export default class ImageDisplay extends React.Component<{
    parameters: ImageParameters,
    parentCallbackIsLoading(isLoading: boolean): void,
    parentCallbackIsDisabled(isDisabled: boolean): void
}> {

    constructor(props: any) {
        super(props);
        this.injectHtml2canvas();
    }

    state: ImageDisplayState = {
        base64Urls: [],
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
        'Rock art often has significant cultural and spiritual meanings for indigenous peoples. For example, Aboriginal Australians used rock paintings to convey stories, beliefs, and laws, and as a means of communication across generations.',
        'Rock painting, also known as rock art, is one of the oldest forms of artistic expression by humans. The oldest known rock paintings are found in Australia, dated to be around 40,000 years old, and in Indonesia, where paintings are estimated to be at least 45,500 years old.',
        'Rock art is found on every continent, showcasing a wide range of styles and subjects. Notable sites include the Lascaux caves in France, the Bhimbetka rock shelters in India, and the Chauvet Cave in France, known for their exceptional prehistoric art.',
        'Early rock painters used natural pigments like ochre, charcoal, and hematite, mixed with water, animal fat, or plant extracts. Brushes made from twigs, feathers, or even fingers were common tools.'
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

    downloadBase64Image = async (): Promise<void> => {
        const base64Url: string = this.state.base64Urls[this.state.currentIndex];
        const imageUrl: string = `data:image/${this.state.fileFormat};base64,` + base64Url.trim();

        const imageFile: string = this.convertBase64ToFileToImage(imageUrl);

        this.setOpen(false);
        this.setFilename('');

        return this.triggerImageDownload(imageFile);
    };

    convertBase64ToFileToImage = (base64: string): string => {
        try {
            const byteString: string = atob(base64.split(',')[1]);
            const mimeType: string = base64.split(',')[0].split(':')[1].split(';')[0];

            const arrayBuffer: ArrayBuffer = new ArrayBuffer(byteString.length);
            const intArray: Uint8Array = new Uint8Array(arrayBuffer);
            for (let i = 0; i < byteString.length; ++i) {
                intArray[i] = byteString.charCodeAt(i);
            }

            const blob = new Blob([arrayBuffer], {type: mimeType});

            return URL.createObjectURL(blob);
        } catch (error) {
            console.error('Error converting base64 to file:', error);
            return '';
        }
    };

    triggerImageDownload = (blobUrl: string): void => {
        try {
            let fileName: string = this.state.filename;

            if (!fileName) {
                fileName = this.state.filenames[this.state.currentIndex];
            }

            const link: HTMLAnchorElement = document.createElement('a');
            link.download = fileName + '.' + this.state.fileFormat;
            link.href = blobUrl;
            link.click();

            URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error('Error triggering image download:', error);
        }
    };

    async componentDidMount(): Promise<void> {
        this.props.parentCallbackIsDisabled(true);
        this.props.parentCallbackIsLoading(true);

        try {
            const response = await axios.post(API_GATEWAY_URL, this.props.parameters, {
                responseType: 'arraybuffer'
            });

            const presignedUrls: string[] = JSON.parse(new TextDecoder().decode(response.data));
            const s3Requests = presignedUrls.map(url => axios.get(url, {responseType: 'arraybuffer'}));

            const responses = await axios.all(s3Requests);
            const {base64Urls, imageUrls, filenames} = this.processResponses(responses);

            this.setState({
                base64Urls,
                imageUrls,
                filenames,
                isDone: true,
                isLoading: false
            });

            this.props.parentCallbackIsLoading(false);

        } catch (error) {
            alert(error);
            console.error(error);
            this.setState({isLoading: false});
            this.props.parentCallbackIsLoading(false);
        }
    }

    private processResponses(responses: AxiosResponse<any>[]): {
        base64Urls: string[],
        imageUrls: string[],
        filenames: string[]
    } {
        const base64Urls: string[] = [];
        const imageUrls: string[] = [];
        const filenames: string[] = [];

        for (const response of responses) {
            filenames.push(this.extractName(response.config.url as string));
            const base64ImageString = this.convertArrayBufferToBase64(response.data);

            base64Urls.push(base64ImageString.trim());
            const imageUrl = `data:image/PNG;base64,${base64ImageString.trim()}`;
            imageUrls.push(imageUrl);
        }

        return {base64Urls, imageUrls, filenames};
    }

    private convertArrayBufferToBase64(arrayBuffer: ArrayBuffer): string {
        const uint8Array = new Uint8Array(arrayBuffer);
        const binaryString = Array.from(uint8Array)
            .map(byte => String.fromCharCode(byte))
            .join('');
        return btoa(binaryString);
    }

    extractName(url: string): string {
        const regex = /\/([\d-]+-ai-image)\?/;
        const match = regex.exec(url);
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
                    style={{
                        marginLeft: this.state.isDone && !this.props.parameters.isLandscape
                            ? `-40px`
                            : '-10px'
                    }}>
                    {!this.state.isDone &&
                        <div style={{
                            fontStyle: 'italic',
                            color: '#646464',
                            fontFamily: 'sans-serif',
                            marginLeft: '10px'
                        }}>
                            <p>
                            <span style={{
                                fontSize: '20px',
                                fontWeight: 'bolder'
                            }}>
                                {this.quotes[this.getRandomInt()]}
                            </span>
                            </p>
                            <br/>
                        </div>}
                    <div className="centered-container">
                        {!this.state.isDone && <CircularProgress style={{marginLeft: '10px'}}/>}
                    </div>
                    <div>
                        {!this.state.isDone &&
                            <Stopwatch shouldStart={this.state.isLoading} shouldReset={this.state.isDone}/>
                        }
                    </div>
                    {this.state.imageUrls?.length > 0 &&
                        <ImageList
                            sx={
                                this.props.parameters.isLandscape
                                    ? {width: 1650, height: 525, paddingLeft: -8}
                                    : {width: 1100, height: 1200, paddingLeft: -30}}
                            cols={this.props.parameters.isLandscape ? 2 : 3}
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
                                            id={'image-' + index}
                                            src={url}
                                            alt=''
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
                            sx={{width: 400}}
                            defaultValue={this.state.filenames[this.state.currentIndex]}
                            onBlur={e => {
                                this.setFilename(e.target.value);
                            }}/>
                        <br/><br/><br/>
                        <Typography id='modal-modal-description' sx={{mt: 2}}>
                            <Button
                                variant='contained'
                                onClick={this.downloadBase64Image}>Download Image
                            </Button>
                        </Typography>
                    </Box>
                </Modal>
            </>
        )
    }
}
