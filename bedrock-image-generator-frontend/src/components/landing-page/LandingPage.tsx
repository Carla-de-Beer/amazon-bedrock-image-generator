import React from 'react';
import Button from '@mui/material/Button';
import {Box, Slider, TextField} from '@mui/material';
import ImageDisplay from '../image-display/ImageDisplay';
import './LandingPage.scss';

export default class LandingPage extends React.Component {

    state = {
        prompt: '',
        numberOfImages: 1,
        isShow: false,
        isDisabled: false
    };

    setPrompt(prompt: string): void {
        this.setState({
            prompt: prompt
        });
    }

    setNumberOfImages(numberOfImages: number): void {
        this.setState({
            numberOfImages: numberOfImages
        });
    }

    setIsShow(isShow: boolean): void {
        this.setState({
            isShow: isShow
        });
    }

    setIsDisabled = (isLoading: boolean): void => {
        this.setState({
            isDisabled: isLoading
        });
    };

    render(): React.JSX.Element {
        const marks = [
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

        const handleChange = (_: Event, newValue: number | number[]): void => {
            this.setNumberOfImages(newValue as number);
            this.setIsDisabled(false);
        };

        return (
            <div style={{paddingTop: '20px', paddingLeft: '250px', maxWidth: '1200px'}}>
                <h2 style={{color: '#2563c0'}}>AI Image Generator</h2>

                <Box sx={{display: 'flex', width: '100%'}}>
                    <Box>
                        <TextField label='Image description'
                                   sx={{width: 800}}
                                   rows={4}
                                   variant='outlined'
                                   onBlur={e => {
                                       this.setPrompt(e.target.value);
                                       this.setIsShow(false);
                                   }}
                                   multiline
                                   size='medium'/>
                    </Box>
                    <Box sx={{flex: '1', paddingLeft: '50px'}}>
                        <label>Number of images to generate</label>
                        <Slider defaultValue={1}
                                min={1}
                                max={3}
                                marks={marks}
                                aria-label='slider'
                                style={{width: '100%'}}
                                onChange={handleChange}/>
                    </Box>
                </Box>
                <br/>
                <Button disabled={this.state.isDisabled}
                        variant='contained'
                        onClick={(): void => {
                            this.setIsShow(!this.state.isShow);
                        }}>
                    Generate with Bedrock
                </Button>
                <div>
                    {this.state.isShow &&
                        <ImageDisplay
                            parameters={{
                                prompt: this.state.prompt,
                                numberOfImages: this.state.numberOfImages || 1
                            }}
                            parentCallback={this.setIsDisabled}/>}
                </div>
            </div>)
    }
}

