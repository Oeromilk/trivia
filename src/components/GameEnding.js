import React from 'react';
import { useHistory } from "react-router-dom";
import makeStyles from '@mui/styles/makeStyles';
import dwightGif from "../images/dwight-celebration.gif";
import { Typography, Grid, Button } from '@mui/material';

const useStyles = makeStyles((theme) => ({
    root: {
        paddingTop: theme.spacing(6),
        paddingBottom: theme.spacing(6)
    },
    gif: {
        width: '50%',
        height: '100%',
        [theme.breakpoints.down('md')]: {
            width: '90%'
        }
    },
    alignment: {
        display: 'flex',
        justifyContent: 'center'
    }
}))

export default function GameEnding(){
    const classes = useStyles();
    const history = useHistory();

    function navigateHome(event){
        event.preventDefault();

        history.push("/");
    }

    return (
        <div className={classes.root}>
            <Grid container rowSpacing={8}>
                <Grid item xs={12}>
                    <Typography align="center" variant="h1">Yeah! Come on!</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography align="center" variant="h5">You have answered every question we have! Bravo!</Typography>
                </Grid>
                <Grid className={classes.alignment} item xs={12}>
                    <Button size="large" variant="outlined" onClick={navigateHome}>Back to Dashboard</Button>
                </Grid>
                <Grid className={classes.alignment} item xs={12}>
                    <img className={classes.gif} alt="Animation of Dwight celebrating" src={dwightGif} />
                </Grid>
            </Grid>  
        </div>
    )
}