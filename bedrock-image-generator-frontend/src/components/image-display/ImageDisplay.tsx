import React from 'react';
import {CircularProgress} from '@mui/material';
import axios, {AxiosResponse} from 'axios';
import {ImageParameters} from '../../types/complexTypes';
import './ImageDisplay.scss';

export default class ImageDisplay extends React.Component<{
    parameters: ImageParameters,
    parentCallback(isDisabled: boolean): void
}> {

    state = {
        imageUrls: [],
        isDone: false,
        isLoading: true
    };

    quotes: string[] = [
        'Anytime someone tells me that I can\'t do something, I want to do it more.',
        'If you are lucky enough to find something that you love, and you have a shot at being good at it, don\'t stop, don\'t put it down.'
    ];

    componentDidMount(): void {
        this.props.parentCallback(true);

        axios.post('API-GATEWAY-URL-GOES-HERE', {
            prompt: this.props.parameters.prompt,
            numberOfImages: this.props.parameters.numberOfImages
        }, {
            responseType: 'arraybuffer',
        }).then(response => {
                const s3Requests: Promise<AxiosResponse<any>>[] = [];

                const presignedUrls: string[] = JSON.parse(new TextDecoder().decode(response.data));
                for (let i: number = 0; i < presignedUrls.length; ++i) {
                    const request = axios.get(presignedUrls[i], {responseType: 'arraybuffer'});
                    s3Requests.push(request);
                }

                axios.all(s3Requests)
                    .then(axios.spread((...responses): void => {
                        const imageUrls: string[] = [];

                        for (let i: number = 0; i < responses.length; ++i) {
                            let base64ImageString: string = btoa(new Uint8Array(responses[i].data)
                                .reduce((data, byte) => data + String.fromCharCode(byte), ''));

                            const imageUrl: string = 'data:image/PNG;base64,' + base64ImageString.trim();
                            imageUrls.push(imageUrl);
                        }

                        this.setState({
                            imageUrls,
                            isDone: true,
                            isLoading: false
                        });

                        this.props.parentCallback(false);

                    })).catch(error => {
                    console.log(error)
                });
            }
        ).catch(error => {
            console.error(error);
        });
    }

    getRandomInt(): number {
        return Math.floor(Math.random() * (this.quotes.length));
    }

    render(): React.JSX.Element {
        return (
            <div>
                <br/>
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
                {this.state.imageUrls?.length > 0 && this.state.imageUrls.map((url: string, index: number) => (
                    <img src={url}
                         alt='Base64 Image'
                         key={index}
                         className={index === 0 ? 'image-box-1 ' : 'image-box-n'}/>
                ))}
            </div>)
    }
}
