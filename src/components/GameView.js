import React from 'react';
import Timer from './Timer';
import { auth, fireStore, arrayUnion } from './firebase/firebaseConfig';
import { ReactComponent as ChanceElement } from '../images/chance.svg';
import { makeStyles } from '@material-ui/core/styles';
import { Container, CssBaseline, Grid, Button, Typography, FormControl, FormControlLabel, Radio, RadioGroup, Chip, Snackbar } from '@material-ui/core';
import MuiAlert from '@material-ui/lab/Alert';

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
    },
    progressBar: {
        height: 16,
        borderRadius: 5
    },
    chanceContainer: {
        width: 300,
        margin: '0 auto'
    },
    chance: {
        width: 100,
        height: 100
    },
    lostChance: {
        filter: 'brightness(20%) saturate(20%)'
    },
    infoContainer: {
        display: 'flex',
        justifyContent: 'space-around'
    },
    chipContainer: {
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        '& > *': {
        margin: theme.spacing(0.5),
        }
    },
    formStyle : {
        display: 'flex',
        justifyContent: 'center'
    },
    formControlStyle: {
        width: '75%'
    },
    radioStyle: {
        marginLeft: theme.spacing(1),
        marginBottom: theme.spacing(3)
    },
    buttonStyle: {
        [theme.breakpoints.up('md')]: {
            width: '50%'
        },
        [theme.breakpoints.down('sm')]: {
            width: '90%',
        },
        margin: '0 auto'
    },
    snackSuccesStyle: {
        backgroundColor: 'green'
    },
    snackWarningStyle: {
        backgroundColor: 'orange'
    }
}))

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function GameView(){
    const classes = useStyles();
    const currentUser = auth.currentUser;
    const [choice, setChoice] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [snackMessage, setSnackMessage] = React.useState('');
    const [severity, setSeverity] = React.useState('warning');
    const [chances, setChances] = React.useState(3);
    const [questionsSeen, setQuestionsSeen] = React.useState(0);
    const [currentQuestionId, setCurrentQuestionId] = React.useState('');
    const [isQuestionLoading, setIsQuestionLoading] = React.useState(true);
    const [isCorrect, setIsCorrect] = React.useState(null);
    const [timeUp, setTimeUp] = React.useState(true);
    const [currentQuestion, setCurrentQuestion] = React.useState(null);

    React.useEffect(() => {
        // setCurrentQuestion({questionInfo:{
        //     "question": "How many children do Holly and Michael have?",
        //     "episode": 20,
        //     "choices": [
        //         "3",
        //         "4",
        //         "5",
        //         "6"
        //     ],
        //     "season": 9,
        //     "answer": "4",
        //     "difficulty": 3
        // }})
        // setIsQuestionLoading(false);
        getNewQuestion();
    }, [])

    React.useEffect(() => {
        if(chances < 2){
            return;
        }
        if(!timeUp){
            setChances((newChances) => newChances - 1);
            setSnackMessage("Ran out of time!")
            setSeverity("warning")
            setOpen(true);
            getNewQuestion();
        }
    }, [timeUp]);

    React.useEffect(() => {
        if(chances < 1){
            console.log('done son')
        }
    }, [chances]);

    React.useEffect(() => {
        if(chances < 2){
            return;
        }
        if(isCorrect){
            let userRef = fireStore.collection('users').doc(currentUser.uid);
            userRef.update({
                questionsAnswered: arrayUnion(currentQuestionId)
            }).then(() => {
                getNewQuestion();
            })
        } else if(isCorrect === false && isCorrect != null){
            setChances((newChances) => newChances - 1);
            getNewQuestion();
        }
        
    }, [isCorrect]);

    function getNewQuestion(){
        setQuestionsSeen((nextQuestion) => nextQuestion + 1);
        setIsQuestionLoading(true); 
        if(currentUser !== null){
            let userRef = fireStore.collection('users').doc(currentUser.uid);
            userRef.get().then((doc) => {
                if(doc.exists){
                    fireStore.collection("theOfficeTriviaQuestions").orderBy("questionInfo").limit(1).get().then((querySnapshot) => {
                        querySnapshot.forEach((nextDoc) => {
                            if(nextDoc.exists){
                                if(!doc.data().questionsAnswered.includes(nextDoc.id)){
                                    console.log(nextDoc.data())
                                    setCurrentQuestionId(nextDoc.id);
                                    setCurrentQuestion(nextDoc.data());
                                    setIsQuestionLoading(false);
                                    setTimeUp(true);
                                }
                            } else {
                                // no more questions end game?
                            }  
                        })
                    })
                }
            })
        }
    }

    function handleUserChoice(event){
        setChoice(event.target.value);
    }

    function checkAnswer(event){
        event.preventDefault();
       
        if(choice === currentQuestion.questionInfo.answer){
            setIsCorrect(true);
            setSnackMessage("Correct!")
            setSeverity("success");
            setOpen(true);
        } else {
            setIsCorrect(false);
            setSnackMessage("Incorrect!")
            setSeverity("warning")
            setOpen(true);
        }
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    return (
        <React.Fragment>
            <CssBaseline />
            <Container className={classes.root}>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography align="center" variant="h3">Chances Remaining:</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <div className={classes.chanceContainer}>
                            <ChanceElement className={`${classes.chance} ${chances < 1 ? classes.lostChance : ''}`} />
                            <ChanceElement className={`${classes.chance} ${chances < 2 ? classes.lostChance : ''}`} />
                            <ChanceElement className={`${classes.chance} ${chances < 3 ? classes.lostChance : ''}`} />
                        </div>
                    </Grid>
                    <Grid item xs={12}>
                        <div className={classes.timerWrap}>
                            <Timer timeUp={timeUp} setTimeUp={setTimeUp} />
                        </div>
                    </Grid>
                    <Grid item xs={12} className={classes.infoContainer}>
                        <div className={classes.chipContainer}>
                            <Chip variant="outlined" size="small" label={isQuestionLoading === true ? "loading" : "season: " + currentQuestion.questionInfo.season} />
                            <Chip variant="outlined" size="small" label={isQuestionLoading === true ? "loading" : "episode: " + currentQuestion.questionInfo.episode} />
                            <Chip variant="outlined" size="small" label={isQuestionLoading === true ? "loading" : "difficulty: " + currentQuestion.questionInfo.difficulty} />
                        </div>
                        <Chip label={`Current Run: ${questionsSeen}`} />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography style={{fontSize: '24px'}} align="center">{isQuestionLoading === true ? "Question Loading" : currentQuestion.questionInfo.question}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <form className={classes.formStyle}>
                            <FormControl className={classes.formControlStyle}>
                                <RadioGroup aria-label="trivia" name="trivia" value={choice} onChange={handleUserChoice}>
                                    {
                                        isQuestionLoading === false ?
                                        currentQuestion.questionInfo.choices.map((option) => {
                                            return (
                                                <FormControlLabel className={classes.radioStyle} key={option} value={option} control={<Radio/>} label={option} />
                                            )
                                        }) :
                                        <FormControlLabel key="Loading" value="Loading" control={<Radio />} label="Loading" />
                                    }
                                </RadioGroup>
                                <Button className={classes.buttonStyle} variant="contained" color="secondary" size="large" onClick={checkAnswer}>Check Choice</Button>
                            </FormControl>
                        </form>
                    </Grid>
                </Grid>
            </Container>
            <Snackbar open={open} autoHideDuration={1500} onClose={handleClose} key={questionsSeen}>
                <Alert onClose={handleClose} severity={severity}>{snackMessage}</Alert>
            </Snackbar>
        </React.Fragment>
    )
};