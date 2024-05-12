import React from 'react';
import axios from 'axios';
import {Buffer} from 'buffer';
import {CircularProgress} from "@mui/material";

export default class ImageDisplay extends React.Component<{ prompt: any }> {

    state = {
        imageUrl: '',
        isDone: false
    };

    quotes = [
        'Anytime someone tells me that I can\'t do something, I want to do it more.',
        'My imagination is a twisted place.',
        'I second-guess and overthink and rethink every single thing that I do.',
        'If you are lucky enough to find something that you love, and you have a shot at being good at it, don\'t stop, don\'t put it down.',
        'Even if you\'re happy with the life you\'ve chosen, you\'re still curious about the other options.'
    ];

    componentDidMount() {
        axios.get('API-GATEWAY-URL-GOES-HERE', {
            params: {
                prompt: this.props.prompt,
            },
            responseType: 'arraybuffer',
        }).then(response => {

            const parsedJson = JSON.parse(new TextDecoder().decode(response.data as ArrayBuffer));
            const presignedUrl = parsedJson['body'];

            axios.get(presignedUrl, {responseType: 'arraybuffer'})
                .then(response => {

                    let base64ImageString = Buffer.from(response.data, 'binary').toString('base64');

                    const imageUrl = "data:image/PNG;base64," + base64ImageString.trim();
                    this.setState({
                        imageUrl: imageUrl,
                        isDone: true
                    });
                })
                .catch(err => console.log(err));

        }).catch(error => {
            console.error(error);
        });
    }

    getRandomInt() {
        return Math.floor(Math.random() * (this.quotes.length + 1));
    }

    render() {
        return (
            <>
                <div>
                    {!this.state.isDone &&
                        <h4><span style={{fontStyle: 'italic'}}>{this.quotes[this.getRandomInt()]}</span>
                        </h4>}
                    {!this.state.isDone && <p>Taylor Swift</p>}
                    <br/><br/>
                    {!this.state.isDone && <CircularProgress/>}
                    <br/>
                    {this.state.imageUrl && <img src={this.state.imageUrl}
                                                 alt="Base64 Image"
                                                 style={{
                                                     maxHeight: '600px',
                                                     position: 'relative'
                                                 }}/>}
                </div>
            </>
        );

        // const [imageSrc, setImageSrc] = useState('');
        //
        // useEffect(() => {
        //
        //     axios.get('https://obxsjn0prh.execute-api.us-east-1.amazonaws.com/dev/image-generator', {
        //         params: {
        //             prompt: 'Image of a magpie sitting in a cherry tree',
        //         },
        //         responseType: 'arraybuffer',
        //     }).then(response => {
        //
        //         const parsedJson = JSON.parse(new TextDecoder().decode(response.data as ArrayBuffer));
        //         const presignedUrl = parsedJson['body'];
        //
        //         axios.get(presignedUrl, {responseType: 'arraybuffer'})
        //             .then(response => {
        //
        //                 let base64ImageString = Buffer.from(response.data, 'binary').toString('base64');
        //
        //                 let imageUrl = "data:image/PNG;base64," + base64ImageString;
        //
        //                 setImageSrc(imageUrl);
        //             })
        //             .catch(err => console.log(err));
        //
        //     }).catch(error => {
        //         console.error(error);
        //     });
        // }, []);
        //
        // return (
        //     <div>
        //         <h2>Image Generator</h2>
        //         {imageSrc && <img src={imageSrc}
        //                           alt="Base64 Image"
        //                           style={{maxWidth: '1000px', paddingLeft: '100px'}}/>}
        //     </div>
        // );
    }
}
