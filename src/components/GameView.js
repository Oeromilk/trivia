import React from 'react';
import Timer from './Timer';
import { firebase, auth, fireStore, arrayUnion } from './firebase/firebaseConfig';
import { ReactComponent as ChanceElement } from '../images/chance.svg';
import { makeStyles } from '@material-ui/core/styles';
import { Container, CssBaseline, Grid, Button, Typography, FormControl, FormControlLabel, Radio, RadioGroup, Chip, Snackbar, Box } from '@material-ui/core';
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
    }
}))

function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function StartScreen(props){
    return (
        <Container style={(props.isShown ? {} : {display: 'none'})}>
            <Grid style={{paddingTop: '25em'}} container spacing={10}>
                <Grid item xs={12}>
                    <Typography align="center" variant="h1">Ready to go?</Typography>
                </Grid>
                <Grid item style={{display: 'flex', justifyContent: 'center'}} xs={12}>
                    <Button style={{margin: '0 auto'}} size="large" variant="contained" color="primary" onClick={props.startGame}>Start Game</Button>

                </Grid>
            </Grid>
        </Container>
    )
}

export default function GameView(){
    const classes = useStyles();
    const currentUser = auth.currentUser;
    const [choice, setChoice] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const [snackMessage, setSnackMessage] = React.useState('');
    const [severity, setSeverity] = React.useState('warning');
    const [isShown, setIsShown] = React.useState(true);
    const [isNextQuestion, setIsNextQuestion] = React.useState(false);
    const [chances, setChances] = React.useState(3);
    const [questionsSeen, setQuestionsSeen] = React.useState(0);
    const [currentQuestionId, setCurrentQuestionId] = React.useState('');
    const [isQuestionLoading, setIsQuestionLoading] = React.useState(true);
    const [isCorrect, setIsCorrect] = React.useState(null);
    const [timeUp, setTimeUp] = React.useState(false);
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
        // getNewQuestion();
    }, [])

    React.useEffect(() => {
        if(chances < 2){
            return;
        }

        if(!timeUp && currentQuestionId !== ''){
            setIsNextQuestion(true);
            setChances((newChances) => newChances - 1);
            setSnackMessage("Ran out of time!")
            setSeverity("warning")
            setOpen(true);
            // getNewQuestion();
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
            })
            // .then(() => {
            //     getNewQuestion();
            // })
        } else if(isCorrect === false && isCorrect != null){
            setChances((newChances) => newChances - 1);
            //getNewQuestion();
        }
        
    }, [isCorrect]);

    function getNewQuestion(){
        setQuestionsSeen((nextQuestion) => nextQuestion + 1);
        setIsQuestionLoading(true);
        setIsNextQuestion(false)
        if(open){
            setOpen(false)
        } 
        if(currentUser !== null){
            let userRef = fireStore.collection('users').doc(currentUser.uid);
            userRef.get().then((doc) => {
                if(doc.exists){
                    fireStore.collection("theOfficeTriviaQuestions")
                    .where(firebase.firestore.FieldPath.documentId(), "not-in", doc.data().questionsAnswered).limit(1)
                    .get().then((querySnapshot) => {
                        querySnapshot.forEach((nextDoc) => {
                            if(nextDoc.exists){
                                setCurrentQuestionId(nextDoc.id);
                                setCurrentQuestion(nextDoc.data());
                                setIsQuestionLoading(false);
                                setTimeUp(true);
                            } else {
                                console.log("No more questions!")
                            }
                        })
                    })
                    // fireStore.collection("theOfficeTriviaQuestions").orderBy("questionInfo").limit(1).get().then((querySnapshot) => {
                    //     querySnapshot.forEach((nextDoc) => {
                    //         if(nextDoc.exists){
                    //             console.log("hello 4")
                    //             if(!doc.data().questionsAnswered.includes(nextDoc.id)){
                    //                 console.log("hello 5")
                    //                 console.log(nextDoc.data())
                    //                 setCurrentQuestionId(nextDoc.id);
                    //                 setCurrentQuestion(nextDoc.data());
                    //                 setIsQuestionLoading(false);
                    //                 setTimeUp(true);
                    //             }
                    //         } else {
                    //             // no more questions end game?
                    //         }  
                    //     })
                    // })
                }
            })
        }
    }

    function handleUserChoice(event){
        setChoice(event.target.value);
    }

    function checkAnswer(event){
        event.preventDefault();

        setIsNextQuestion(true);
       
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

    function startGame(){
        setIsShown(false);
        getNewQuestion();
    }

    function handleNextQuestion(){
        getNewQuestion();
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
            <StartScreen isShown={isShown} startGame={startGame}/>
            <Container style={(isShown ? {display: 'none'} : {})} className={classes.root}>
                <Grid display={isShown ? 'none' : ''} container spacing={3}>
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
                                <Button className={classes.buttonStyle} disabled={!timeUp} variant="contained" color="primary" size="large" onClick={checkAnswer}>Check Choice</Button>
                            </FormControl>
                        </form>
                    </Grid>
                    <Grid container justify="center" item xs={12}>
                        <Box display={isNextQuestion ? '' : 'none'}>
                            <Button variant="contained" color="primary" size="large" onClick={handleNextQuestion}>Next Question</Button>
                        </Box>
                    </Grid>
                </Grid>
            </Container>
            <Snackbar open={open} autoHideDuration={2500} onClose={handleClose} key={questionsSeen}>
                <Alert onClose={handleClose} severity={severity}>{snackMessage}</Alert>
            </Snackbar>
        </React.Fragment>
    )
};