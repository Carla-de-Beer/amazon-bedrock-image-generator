import React, {useState} from 'react';
import Button from '@mui/material/Button';
import {Box, TextField} from '@mui/material';
import ImageDisplay from '../image-display/ImageDisplay';

function LandingPage(): React.JSX.Element {
    const [prompt, setPrompt] = useState('');
    const [isShow, setIsShow] = useState(false);

    return (
        <div style={{paddingTop: '20px', paddingLeft: '250px', maxWidth: '1200px'}}>
            <h2 style={{color: '#2563c0'}}>AI Image Generator</h2>
            <Box sx={{display: 'flex', width: '100%'}}>
                <TextField label="Image description"
                           sx={{width: 800}}
                           rows={4}
                           variant="outlined"
                           onBlur={e => {
                               setPrompt(e.target.value);
                           }}
                           multiline
                           size='medium'/>
            </Box>
            <br/>
            <Button disabled={isShow}
                    variant="contained"
                    onClick={() => {
                        setIsShow(true);
                    }}>
                Generate
            </Button>
            <div>
                {isShow && <ImageDisplay prompt={prompt}/>}
            </div>
        </div>
    );
}

export default LandingPage;

