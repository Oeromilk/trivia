import React, { useEffect } from 'react';
import { auth, fireStore } from './firebase/firebaseConfig';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import LinearProgress from '@material-ui/core/LinearProgress';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles((theme) => ({
    root: {
        marginTop: theme.spacing(10),
        [theme.breakpoints.up('md')]: {
            maxWidth: '50%'
        },
        [theme.breakpoints.down('sm')]: {
            maxWidth: '90%',
        }
    },
    timerWrap: {
        width: '100%'
    }
}))

export default function GameView(){
    const classes = useStyles();
    const [timeLeft, setTimeLeft] = React.useState(100);
    const [currentQuestion, setCurrentQuestion] = React.useState(null);

    // useEffect(() => {
    //     countDown();
    // }, [])

    useEffect(() => {
        getNewQuestion();
    })

    function countDown(){
        var counter = 8;
        var questionCountdown = setInterval(() => {
            let newTimeLeft = timeLeft - 12.5;
            setTimeLeft(newTimeLeft);
            counter--;
            if(counter === 0){
                clearInterval(questionCountdown);
            }
        }, 1000);
    }
    function getNewQuestion(){
        fireStore.collection("theOfficeTriviaQuestions").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                console.log(doc.data());
            })
        })
    }
    return (
        <React.Fragment>
            <CssBaseline />
            <Container className={classes.root}>
                <Grid container>
                    <Grid item xs={12}>
                        <div className={classes.timerWrap}>
                            <LinearProgress variant="determinate" value={timeLeft}/>
                        </div>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography>Question for the topic goes here?</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <List>
                            <ListItem>
                                <Button>A</Button>
                            </ListItem>
                            <ListItem>
                                <Button>B</Button>
                            </ListItem>
                            <ListItem>
                                <Button>C</Button>
                            </ListItem>
                            <ListItem>
                                <Button>D</Button>
                            </ListItem>
                        </List>
                    </Grid>
                </Grid>
            </Container>
        </React.Fragment>
    )
};