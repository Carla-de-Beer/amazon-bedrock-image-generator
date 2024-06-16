import React from 'react';
import Button from '@mui/material/Button';
import {Box, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Slider, TextField} from '@mui/material';
import ImageDisplay from '../image-display/ImageDisplay';
import './LandingPage.scss';

import logo from '../../assets/hand-blue-logo.png';

const MAX_PROMPT_SIZE_IN_CHARS: number = 512;

export default class LandingPage extends React.Component {

    state = {
        prompt: '',
        negativeText: '',
        numberOfImages: 1,
        radioValue: 'landscape',
        landscapeFormat: true,
        isShow: false,
        isDisabled: false,
        isLoading: false,
        isValidationError: false
    };

    setPrompt(prompt: string): void {
        this.setState({
            prompt: prompt
        });
    }

    setNegativeText(negativeText: string): void {
        this.setState({
            negativeText: negativeText
        });
    }

    setNumberOfImages(numberOfImages: number): void {
        this.setState({
            numberOfImages: numberOfImages
        });
    }

    setRadioValue = (radioValue: string): void => {
        this.setState({
            radioValue: radioValue
        });
    };

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

    setIsValidationError = (isValidationError: boolean): void => {
        this.setState({
            isValidationError: isValidationError
        });
    };

    handleInputValidation = (prompt: string): void => {
        if (prompt.length > MAX_PROMPT_SIZE_IN_CHARS || prompt.trim() === '') {
            this.setIsValidationError(true);
        } else {
            this.setIsValidationError(false);
        }
    };

    handleSliderChange = (_: Event, newValue: number | number[]): void => {
        this.setNumberOfImages(newValue as number);
    };

    handleReset = (): void => {
        this.setPrompt('');
        this.setNegativeText('');
        this.setNumberOfImages(1);
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

        return (
            <div style={{paddingTop: '20px', paddingLeft: '95px', maxWidth: '1400px'}}>
                <div className='header-container'>
                    <img
                        src={logo}
                        alt=''
                        style={{width: '40px'}}
                    />
                    <h2 data-cy='title' style={{color: '#1976d2', marginLeft: '15px'}}>RockArt</h2>
                </div>

                <Box sx={{display: 'flex', width: '100%'}}>
                    <Box>
                        <TextField
                            data-cy='textfield-prompt'
                            label='Image description'
                            sx={{width: 800}}
                            value={this.state.prompt}
                            placeholder={`A text prompt to generate the image must be <= ${MAX_PROMPT_SIZE_IN_CHARS} characters`}
                            helperText={this.state.isValidationError ? `Prompt cannot be empty or exceed ${MAX_PROMPT_SIZE_IN_CHARS} characters` : ''}
                            error={this.state.isValidationError}
                            rows={3}
                            variant='outlined'
                            disabled={this.state.isDisabled}
                            onBlur={e => {
                                this.setPrompt(e.target.value);
                                this.setIsShow(false);
                                this.handleInputValidation(e.target.value);
                            }}
                            onChange={(e) => this.setPrompt(e.target.value)}
                            multiline
                            required
                            size='medium'
                        />
                        <br/><br/>
                        <TextField
                            data-cy='textfield-negative-text'
                            label='Negative text (optional)'
                            sx={{width: 800}}
                            value={this.state.negativeText}
                            placeholder="Don't use negative words in this prompt field. For example, if you don't want to include mirrors in an image, enter mirrors in this prompt. Don't enter no mirrors."
                            rows={2}
                            variant='outlined'
                            disabled={this.state.isDisabled}
                            onBlur={e => {
                                this.setNegativeText(e.target.value);
                            }}
                            onChange={(e) => this.setNegativeText(e.target.value)}
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
                                data-cy='slider'
                                id='num-images-slider'
                                value={this.state.numberOfImages}
                                disabled={this.state.isDisabled}
                                defaultValue={1}
                                min={1}
                                max={3}
                                marks={marks}
                                aria-label='slider'
                                style={{width: '100%'}}
                                onChange={this.handleSliderChange}
                            />
                        </Box>
                        <FormControl>
                            <FormLabel id='row-radio-buttons-group-label'>Format</FormLabel>
                            <RadioGroup
                                data-cy='radio-group'
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
                    data-cy='generate-button'
                    variant='contained'
                    disabled={this.state.isDisabled || this.state.prompt.trim() === ''}
                    onClick={(): void => {
                        this.setIsShow(!this.state.isShow);
                    }}>
                    Generate with Bedrock
                </Button>
                <Button
                    data-cy='reset-button'
                    sx={{marginLeft: '20px'}}
                    variant='outlined'
                    disabled={this.state.isLoading ? true : !this.state.isDisabled}
                    onClick={(): void => {
                        this.handleReset();
                        this.setIsDisabled(!this.state.isDisabled);
                    }}>
                    Reset
                </Button>
                <br/>
                <div>
                    {this.state.isShow &&
                        <ImageDisplay
                            parameters={{
                                prompt: this.state.prompt,
                                negativeText: this.state.negativeText || '',
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

