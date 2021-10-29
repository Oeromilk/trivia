import React, { useEffect } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import LinearProgress from '@mui/material/LinearProgress';

const useStyles = makeStyles((theme) => ({
    progressBar: {
        height: 16,
        borderRadius: 5
    }
}))

export default function Timer(props){
    const classes = useStyles();
    const [timeLeft, setTimeLeft] = React.useState(100);

    React.useEffect(() => {
        if(props.timeUp && !props.isNextQuestion){
            setTimeLeft(100);
            var timer;
            setTimeout(() => {
                timer = setInterval(() => {
                    setTimeLeft((newTimeLeft) => (newTimeLeft <= 0 ? 0 : newTimeLeft - 1));
                }, props.count);
            }, 750)

            if(props.isNextQuestion){
                setTimeLeft(1);
                clearInterval(timer);
            }
            return () => clearInterval(timer)
        }
    }, [props.timeUp, props.isNextQuestion]);

    useEffect(() => {
        if(timeLeft <= 0){
            props.setTimeUp(false);
        }
    }, [timeLeft]);

    return (
        <LinearProgress className={classes.progressBar} variant="determinate" value={timeLeft}/>
    )
}