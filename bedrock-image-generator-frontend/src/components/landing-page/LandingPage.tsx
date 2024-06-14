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
        isDisabled: false,
        isLoading: false,
        textFieldValue: '',
        sliderValue: 1,
        radioValue: 'landscape'
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

    setIsDisabled = (isDisabled: boolean): void => {
        this.setState({
            isDisabled: isDisabled
        });
    };

    setIsLoading = (isLoading: boolean): void => {
        this.setState({
            isLoading: isLoading
        });
    };

    setTextFieldValue = (textFieldValue: string): void => {
        this.setState({
            textFieldValue: textFieldValue
        });
    };

    setSliderValue = (sliderValue: number): void => {
        this.setState({
            sliderValue: sliderValue
        });
    };

    setRadioValue = (radioValue: string): void => {
        this.setState({
            radioValue: radioValue
        });
    };

    handleClear = (): void => {
        this.setTextFieldValue('');
        this.setSliderValue(1);
        this.setRadioValue('landscape');
        this.setIsShow(false);
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
            this.setIsShow(false);
            this.setSliderValue(newValue as number);
        };

        return (
            <div style={{paddingTop: '25px', paddingLeft: '95px', maxWidth: '1400px'}}>
                <h2 style={{color: '#2563c0'}}>RockArt</h2>

                <Box sx={{display: 'flex', width: '100%'}}>
                    <Box>
                        <TextField
                            label='Image description'
                            sx={{width: 800}}
                            value={this.state.textFieldValue}
                            rows={5}
                            variant='outlined'
                            disabled={this.state.isDisabled}
                            onBlur={e => {
                                this.setPrompt(e.target.value);
                                this.setIsShow(false);
                            }}
                            onChange={(e) => this.setTextFieldValue(e.target.value)}
                            multiline
                            size='medium'
                        />
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
                                value={this.state.sliderValue}
                                defaultValue={1}
                                min={1}
                                max={3}
                                marks={marks}
                                aria-label='slider'
                                disabled={this.state.isDisabled}
                                style={{width: '100%'}}
                                onChange={handleChange}
                            />
                        </Box>
                        <FormControl>
                            <FormLabel id='row-radio-buttons-group-label'>Format</FormLabel>
                            <RadioGroup
                                row
                                aria-labelledby='row-radio-buttons-group-label'
                                name='row-radio-buttons-group'
                                value={this.state.radioValue}
                                defaultValue='landscape'
                                onChange={(e): void => {
                                    if (e.target.value === 'landscape') {
                                        this.setLandscapeFormat(true);
                                    } else {
                                        this.setLandscapeFormat(false);
                                    }
                                    this.setRadioValue(e.target.value);
                                    this.setIsShow(false);
                                }}>
                                <FormControlLabel
                                    value='landscape'
                                    control={<Radio/>}
                                    label='Landscape'
                                    disabled={this.state.isDisabled}
                                />
                                <FormControlLabel
                                    value='portrait'
                                    control={<Radio/>}
                                    label='Portrait'
                                    disabled={this.state.isDisabled}
                                />
                            </RadioGroup>
                        </FormControl>
                    </Box>
                </Box>
                <br/>
                <Button
                    variant='contained'
                    disabled={this.state.isDisabled}
                    onClick={(): void => {
                        this.setIsShow(!this.state.isShow);
                    }}>
                    Generate with Bedrock
                </Button>
                <Button sx={{marginLeft: '20px'}}
                        variant='outlined'
                        disabled={this.state.isLoading ? true : !this.state.isDisabled}
                        onClick={(): void => {
                            this.setIsDisabled(!this.state.isDisabled);
                            this.handleClear();
                        }}>
                    Reset
                </Button>
                <div>
                    {this.state.isShow &&
                        <ImageDisplay
                            parameters={{
                                prompt: this.state.prompt,
                                numberOfImages: this.state.numberOfImages || 1,
                                landscapeFormat: this.state.landscapeFormat
                            }}
                            parentCallbackIsLoading={this.setIsLoading}
                            parentCallbackIsDisabled={this.setIsDisabled}
                        />}
                </div>
            </div>
        )
    }
}

