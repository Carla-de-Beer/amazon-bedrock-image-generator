import React from 'react';
import {CircularProgress} from '@mui/material';
import axios from 'axios';

export default class ImageDisplay extends React.Component<{ prompt: string }> {

    state = {
        imageUrl: '',
        isDone: false,
        isLoading: true
    };

    quotes = [
        'Anytime someone tells me that I can\'t do something, I want to do it more.',
        'If you are lucky enough to find something that you love, and you have a shot at being good at it, don\'t stop, don\'t put it down.'
    ];

    componentDidMount(): void {

        axios.post('https://obxsjn0prh.execute-api.us-east-1.amazonaws.com/dev/image-generator', {
            prompt: this.props.prompt,
        }, {
            responseType: 'arraybuffer',
        }).then(response => {

            const presignedUrl = new TextDecoder().decode(response.data);

            axios.get(presignedUrl, {responseType: 'arraybuffer'})
                .then(response => {
                    let base64ImageString = btoa(
                        new Uint8Array(response.data)
                            .reduce((data, byte) => data + String.fromCharCode(byte), ''));

                    const imageUrl = "data:image/PNG;base64," + base64ImageString.trim();
                    this.setState({
                        imageUrl: imageUrl,
                        isDone: true,
                        isLoading: false
                    });
                })
                .catch(err => console.log(err));

        }).catch(error => {
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
                <br/>
                {this.state.imageUrl && <img src={this.state.imageUrl}
                                             alt="Base64 Image"
                                             style={{
                                                 maxHeight: '550px',
                                                 position: 'relative'
                                             }}/>}
            </div>)
    }
}
