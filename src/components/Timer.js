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
        if(props.timeUp){
            setTimeLeft(100);
            var timer;
            setTimeout(() => {
                timer = setInterval(() => {
                    setTimeLeft((newTimeLeft) => (newTimeLeft <= 0 ? 0 : newTimeLeft - 1));
                }, 60);
            }, 750)

            return () => clearTimeout(timer)
        }
    }, [props.timeUp]);

    useEffect(() => {
        if(timeLeft <= 0){
            props.setTimeUp(false);
        }
    }, [timeLeft]);

    return (
        <LinearProgress className={classes.progressBar} variant="determinate" value={timeLeft}/>
    )
}