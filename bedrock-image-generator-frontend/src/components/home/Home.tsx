import React, {useState} from 'react';
import Button from '@mui/material/Button';
import {TextField} from '@mui/material';
import ImageDisplay from '../image-display/ImageDisplay';

function Home() {
    const [prompt, setPrompt] = useState('');
    const [isShow, setIsShow] = useState('');

    return (
        <>
            <div style={{paddingTop: '70px', paddingLeft: '250px'}}>
                <TextField label="Image description"
                           variant="outlined"
                           onChange={e => {
                               setPrompt(e.target.value);
                           }}
                           multiline
                           size='medium'/>
                <br/><br/><br/>
                <Button
                    variant="contained"
                    onClick={() => {
                        setIsShow("YES")
                        // console.log(prompt)
                        // <ImageDisplay prompt={prompt}/>
                    }}>
                    Generate with Bedrock
                </Button>
                <div>
                    {isShow && <ImageDisplay prompt={prompt}/>}
                </div>
            </div>
        </>
    );
}

export default Home;

