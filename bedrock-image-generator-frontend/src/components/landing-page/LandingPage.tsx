import React from 'react';
import Button from '@mui/material/Button';
import {Box, FormControl, FormControlLabel, Radio, RadioGroup, Slider, TextField} from '@mui/material';
import ImageDisplay from '../image-display/ImageDisplay';
import './LandingPage.scss';

import logo from '../../assets/hand-blue-logo.png';
import {DEFAULT_SETTINGS, marksCfgScale, marksNumImages, MAX_PROMPT_SIZE_IN_CHARS, Orientation} from './Constants';

export default class LandingPage extends React.Component {

    state = {
        prompt: '',
        negativeText: '',
        numberOfImages: DEFAULT_SETTINGS.NUM_IMAGES,
        cfgScale: DEFAULT_SETTINGS.CFG_SCALE,
        orientation: DEFAULT_SETTINGS.ORIENTATION,
        isLandscape: DEFAULT_SETTINGS.IS_LANDSCAPE,
        isShow: DEFAULT_SETTINGS.IS_SHOW,
        isDisabled: DEFAULT_SETTINGS.IS_DISABLED,
        isLoading: DEFAULT_SETTINGS.IS_LOADING,
        isValidationError: DEFAULT_SETTINGS.IS_VALIDATION_ERROR
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

    setCfgScale(cfgScale: number): void {
        this.setState({
            cfgScale: cfgScale
        });
    }

    setOrientation = (orientation: string): void => {
        this.setState({
            orientation: orientation
        });
    };

    setIsLandscape(isLandscape: boolean): void {
        this.setState({
            isLandscape: isLandscape
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

    handleNumImagesSliderChange = (_: Event, newValue: number | number[]): void => {
        this.setNumberOfImages(newValue as number);
    };

    handleCfgScaleSliderChange = (_: Event, newValue: number | number[]): void => {
        this.setCfgScale(newValue as number);
    };

    handleReset = (): void => {
        this.setPrompt('');
        this.setNegativeText('');
        this.setNumberOfImages(DEFAULT_SETTINGS.NUM_IMAGES);
        this.setCfgScale(DEFAULT_SETTINGS.CFG_SCALE);
        this.setOrientation(DEFAULT_SETTINGS.ORIENTATION);
        this.setIsLandscape(DEFAULT_SETTINGS.IS_LANDSCAPE);
        this.setIsShow(DEFAULT_SETTINGS.IS_SHOW);
        this.setIsDisabled(DEFAULT_SETTINGS.IS_DISABLED);
        this.setIsLoading(DEFAULT_SETTINGS.IS_LOADING);
        this.setIsValidationError(DEFAULT_SETTINGS.IS_VALIDATION_ERROR);
    };

    render(): React.JSX.Element {
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
                        <Box sx={{paddingBottom: '25px', width: '100%'}}>
                            <label htmlFor='num-images-slider'>Number of images</label>
                            <Slider
                                data-cy='num-images-slider'
                                id='num-images-slider'
                                value={this.state.numberOfImages}
                                disabled={this.state.isDisabled}
                                defaultValue={DEFAULT_SETTINGS.NUM_IMAGES}
                                min={DEFAULT_SETTINGS.NUM_IMAGES_MIN}
                                max={DEFAULT_SETTINGS.NUM_IMAGES_MAX}
                                marks={marksNumImages}
                                aria-label='slider'
                                style={{width: '100%'}}
                                onChange={this.handleNumImagesSliderChange}
                            />
                            <label htmlFor='cfgScale-slider'>Classifier-free guidance scale</label>
                            <Slider
                                data-cy='cfgScale-slider'
                                id='cfgScale-slider'
                                value={this.state.cfgScale}
                                disabled={this.state.isDisabled}
                                defaultValue={DEFAULT_SETTINGS.CFG_SCALE}
                                min={DEFAULT_SETTINGS.CFG_SCALE_MIN}
                                max={DEFAULT_SETTINGS.CFG_SCALE_MAX}
                                step={DEFAULT_SETTINGS.CFG_SCALE_STEP}
                                marks={marksCfgScale}
                                aria-label='slider'
                                style={{width: '100%'}}
                                onChange={this.handleCfgScaleSliderChange}
                            />
                        </Box>
                        <FormControl>
                            <RadioGroup
                                data-cy='orientation-radio-group'
                                row
                                aria-labelledby='radioValue-radio-buttons-group-label'
                                name='radioValue-radio-buttons-group'
                                value={this.state.orientation}
                                defaultValue={Orientation.LANDSCAPE}
                                onChange={(e): void => {
                                    if (e.target.value === Orientation.LANDSCAPE) {
                                        this.setIsLandscape(true);
                                    } else {
                                        this.setIsLandscape(false);
                                    }
                                    this.setOrientation(e.target.value);
                                }}>
                                <FormControlLabel
                                    value={Orientation.LANDSCAPE}
                                    control={<Radio/>}
                                    label='Landscape'
                                    disabled={this.state.isDisabled}
                                />
                                <FormControlLabel
                                    value={Orientation.PORTRAIT}
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
                                numberOfImages: this.state.numberOfImages || DEFAULT_SETTINGS.NUM_IMAGES,
                                cfgScale: this.state.cfgScale || DEFAULT_SETTINGS.CFG_SCALE,
                                isLandscape: this.state.isLandscape
                            }}
                            parentCallbackIsLoading={this.setIsLoading}
                            parentCallbackIsDisabled={this.setIsDisabled}
                        />}
                </div>
            </div>
        )
    }
}

