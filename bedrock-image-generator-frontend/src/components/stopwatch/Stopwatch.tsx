import React, {useEffect} from 'react';
import {useStopwatch} from 'react-timer-hook';
import './Stopwatch.scss';

interface StopwatchProps {
    shouldStart: boolean;
    shouldReset: boolean;
}

export default function Stopwatch({shouldStart, shouldReset}: StopwatchProps) {
    const {
        seconds,
        minutes,
        start,
        reset,
    } = useStopwatch({autoStart: true});

    useEffect((): void => {
        if (shouldStart) {
            start();
        }
    }, [shouldStart, start]);

    useEffect((): void => {
        if (shouldReset) {
            reset();
        }
    }, [shouldReset, reset]);

    const timerColor: string = (minutes > 0 || (minutes === 0 && seconds >= 25)) ? '#D63230' : '#646464';

    return (
        <div className="stopwatch-container">
            <p className="stopwatch-header">Inference and network latency</p>
            <div className="stopwatch-timer" style={{color: timerColor}}>
                <span>{minutes}</span>:<span>{seconds}</span>
            </div>
        </div>
    );
}
