import React from 'react';
import Button from '@mui/material/Button';
import {Box, RadioGroup, FormControl, FormLabel, Slider, TextField, FormControlLabel, Radio} from '@mui/material';
import ImageDisplay from '../image-display/ImageDisplay';
import './LandingPage.scss';

export default class LandingPage extends React.Component {

    state = {
        prompt: '',
        numberOfImages: 1,
        landscapeFormat: true,
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

    setLandscapeFormat(landscapeFormat: boolean): void {
        this.setState({
            landscapeFormat: landscapeFormat
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
            },
            {
                value: 4,
                label: '4'
            }
        ];

        const handleChange = (_: Event, newValue: number | number[]): void => {
            this.setNumberOfImages(newValue as number);
            this.setIsDisabled(false);
            this.setIsShow(false);
        };

        return (
            <div style={{paddingTop: '25px', paddingLeft: '95px', maxWidth: '1400px'}}>
                <h2 style={{color: '#2563c0'}}>AI Image Generator</h2>

                <Box sx={{display: 'flex', width: '100%'}}>
                    <Box>
                        <TextField
                            label='Image description'
                            sx={{width: 800}}
                            rows={5}
                            variant='outlined'
                            onBlur={e => {
                                this.setPrompt(e.target.value);
                                this.setIsShow(false);
                            }}
                            multiline
                            size='medium'/>
                    </Box>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '450px',
                        paddingLeft: '50px',
                        marginTop: '-5px'
                    }}>
                        <Box sx={{paddingBottom: '20px', width: '100%'}}>
                            <label htmlFor='num-images-slider'>Number of images to generate</label>
                            <Slider
                                id='num-images-slider'
                                defaultValue={1}
                                min={1}
                                max={4}
                                marks={marks}
                                aria-label='slider'
                                style={{width: '100%'}}
                                onChange={handleChange}/>
                        </Box>
                        <FormControl>
                            <FormLabel id='row-radio-buttons-group-label'>Format</FormLabel>
                            <RadioGroup
                                row
                                aria-labelledby='row-radio-buttons-group-label'
                                name='row-radio-buttons-group'
                                defaultValue='landscape'
                                onChange={(e): void => {
                                    if (e.target.value === 'landscape') {
                                        this.setLandscapeFormat(true);
                                    } else {
                                        this.setLandscapeFormat(false);
                                    }
                                    this.setIsShow(false);
                                }}>
                                <FormControlLabel value='landscape' control={<Radio/>} label='Landscape'/>
                                <FormControlLabel value='portrait' control={<Radio/>} label='Portrait'/>
                            </RadioGroup>
                        </FormControl>
                    </Box>
                </Box>
                <br/>
                <Button
                    disabled={this.state.isDisabled}
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
                                numberOfImages: this.state.numberOfImages || 1,
                                landscapeFormat: this.state.landscapeFormat
                            }}
                            parentCallback={this.setIsDisabled}/>}
                </div>
            </div>
        )
    }
}

