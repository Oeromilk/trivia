import React from 'react';
import { isMobile } from 'react-device-detect';
import Timer from './Timer';
import { auth } from './firebase/firebaseConfig';
import { collection, query, where, doc, updateDoc, get, getDoc, getDocs, arrayUnion, limit, documentId } from "firebase/firestore";
import { db } from './firebase/firebaseConfig';
import { ReactComponent as ChanceElement } from '../images/chance.svg';
import makeStyles from '@mui/styles/makeStyles';
import { Container, CssBaseline, Grid, Button, Typography, FormControl, FormControlLabel, Radio, RadioGroup, Chip, Snackbar, Box, Divider } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

const useStyles = makeStyles((theme) => ({
    root: {
        marginTop: (isMobile ? theme.spacing(3) : theme.spacing(10)),
        [theme.breakpoints.up('md')]: {
            maxWidth: '50%'
        },
        [theme.breakpoints.down('md')]: {
            maxWidth: '100%',
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
        width: (isMobile ? 150 : 300),
        margin: '0 auto'
    },
    chance: {
        width: (isMobile ? 50 : 100),
        height: (isMobile ? 50 : 100)
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
        [theme.breakpoints.down('md')]: {
            width: '90%',
        },
        margin: '0 auto'
    }
}))

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
})

function StartScreen(props){
    return (
        <Container style={(props.isShown ? {} : {display: 'none'})}>
            <Grid style={(isMobile ? {paddingTop: '5em'} : {paddingTop: '20em'})} container spacing={10}>
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

function GameOver(props){
    return (
        <Container>
            <Grid container rowGap={3}>
                <Grid sx={{marginBottom: 8, marginTop: 4}} item xs={12}>
                    <Typography align="center" variant="h1">Game Over</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography align="center" variant="h2">Questions Seen</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography sx={{color: "#FF6D1F", fontSize: '5rem', fontWeight: 600}} align="center">{props.seen}</Typography>
                </Grid>
                <Grid sx={{marginBottom: 4, marginTop: 4}} item xs={12}>
                    <Divider light={true} variant="middle"/>
                </Grid>
                <Grid item xs={12}>
                    <Typography align="center" variant="h2">Questions Correct</Typography>
                </Grid>
                <Grid item xs={12}>
                    <Typography sx={{color: "#52A5FF", fontSize: '5rem', fontWeight: 600}} align="center">{props.correct}</Typography>
                </Grid>
            </Grid>
        </Container>
    )
}

export default function GameView(){
    const classes = useStyles();
    const currentUser = auth.currentUser;
    const [choice, setChoice] = React.useState('');
    const [choices, setChoices] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const [snackMessage, setSnackMessage] = React.useState('');
    const [severity, setSeverity] = React.useState('warning');
    const [isShown, setIsShown] = React.useState(true);
    const [isNextQuestion, setIsNextQuestion] = React.useState(false);
    const [chances, setChances] = React.useState(3);
    const [questionsCorrect, setQuestionsCorrect] = React.useState(0);
    const [questionsSeen, setQuestionsSeen] = React.useState(0);
    const [currentQuestionId, setCurrentQuestionId] = React.useState('');
    const [isQuestionLoading, setIsQuestionLoading] = React.useState(true);
    const [isCorrect, setIsCorrect] = React.useState(null);
    const [timeUp, setTimeUp] = React.useState(false);
    const [currentQuestion, setCurrentQuestion] = React.useState(null);
    const [characterCount, setCharacterCount] = React.useState(0);
    const choiceStyle = {
        borderRadius: '0.5em',
        border: '1px solid #484848',
        boxShadow: '0px 0px 6px 1px rgba(0,0,0,0.75)',
        paddingTop: '0.25em',
        paddingBottom: '0.25em'
    };

    //React.useEffect(() => {
        // testing purposes
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

        // possible area for hardcore mode
        // setIsQuestionLoading(false);
    //}, [])

    React.useEffect(() => {
        if(currentQuestion !== null){
            if(!timeUp && currentQuestionId !== '' && isCorrect !== true){
                setIsNextQuestion(true);
                setChances((newChances) => newChances - 1);
                setSnackMessage("Ran out of time!")
                setSeverity("warning")
                setOpen(true);

                // possible hardcore mode
            }
        }
    }, [timeUp]);

    React.useEffect(() => {
        if(chances < 1){
            let newStats = {
                percentageRight: Math.round((questionsCorrect / questionsSeen + Number.EPSILON) * 100) / 100,
                questionsCorrect: questionsCorrect,
                questionsSeen: questionsSeen
            }
            updateWhenGameOver(newStats);
        }
    }, [chances]);

    React.useEffect(() => {
        if(currentQuestion !== null){
            let questionCount = currentQuestion.questionInfo.question.length;
            let choicesCount = 0;
            currentQuestion.questionInfo.choices.forEach((option) => {
                choicesCount += option.length;
            })
            console.log("Character Count: ", questionCount + choicesCount);
            setCharacterCount(questionCount + choicesCount);
        }
    }, [currentQuestion])

    React.useEffect(() => {
        if(isCorrect){
            setQuestionsCorrect((correct) => correct + 1);
            updateIfCorrect();
            
            // possible hardcore mode
            // .then(() => {
            //     getNewQuestion();
            // })
        } else if(isCorrect === false && isCorrect !== null){
            setChances((newChances) => newChances - 1);
            // possible hardcore mode
            //getNewQuestion();
        }
        
    }, [isCorrect]);

    async function updateWhenGameOver(stats){
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
            gameStats: arrayUnion(stats)
        })
    }

    async function updateIfCorrect(){
        const userRef = doc(db, "users", currentUser.uid);
        await updateDoc(userRef, {
            questionsAnswered: arrayUnion(currentQuestion.id)
        })
    }

    async function getRandomQuestion(){
        setQuestionsSeen((nextQuestion) => nextQuestion + 1);
        setIsQuestionLoading(true);
        setIsNextQuestion(false);
        if(open){
            setOpen(false);
        }
        
        if(currentUser !== null){
            const userRef = doc(db, "users", currentUser.uid);
            const userSnap = await getDoc(userRef);
            if(userSnap.exists()){
                let arr = userSnap.data().questionsAnswered;
                var randomNumber = await getRandomNumber(arr);
                
                const q = query(collection(db, "theOfficeTriviaQuestions"), where("id", "==", randomNumber), limit(1));
                const querySnap = await getDocs(q);
                
                if(querySnap.size > 0){
                    querySnap.forEach((doc) => {
                        setCurrentQuestionId(doc.id);
                        setCurrentQuestion(doc.data());
                        setChoices(doc.data().questionInfo.choices.sort(() => Math.random() - 0.5));
                        setIsQuestionLoading(false);
                        setTimeUp(true);
                    })
                } else {
                    console.log("no more questions")
                }
            }
        }
    }

    async function getRandomNumber(arr){
        const countDoc = doc(db, "theOfficeTriviaQuestions", "count");
        const countSnap = await getDoc(countDoc);
        let count = countSnap.data().numberOfQuestions + 1;
        
        var random = Math.floor((Math.random() * count));
        while(arr.includes(random)){
            random = Math.floor((Math.random() * count));
        }
        return random;
    }

    function handleUserChoice(event){
        setChoice(event.target.value);
    }

    function checkAnswer(event){
        event.preventDefault();

        setIsNextQuestion(true);
       
        if(choice === currentQuestion.questionInfo.answer){
            setIsCorrect(true);
            setSnackMessage("Correct!");
            setSeverity("success");
            setOpen(true);
        } else {
            setIsCorrect(false);
            setSnackMessage("Incorrect!");
            setSeverity("warning");
            setOpen(true);
        }
    }

    function startGame(){
        setIsShown(false);
        getRandomQuestion();
    }

    function handleNextQuestion(){
        setIsCorrect(null)
        setChoice('');
        getRandomQuestion();
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
            {
                chances < 1 ? <GameOver seen={questionsSeen} correct={questionsCorrect}/> :
            <React.Fragment>
            <StartScreen isShown={isShown} startGame={startGame}/>
            <Container style={(isShown ? {display: 'none'} : {})} className={classes.root}>
                <Grid display={isShown ? 'none' : ''} container rowSpacing={2}>
                    <Grid item xs={12}>
                        <Typography align="center" variant={(isMobile ? "h5" : "h3")}>Chances Remaining:</Typography>
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
                            {currentQuestion !== null ? <Timer count={characterCount} timeUp={timeUp} setTimeUp={setTimeUp} isNextQuestion={isNextQuestion} /> : null}
                        </div>
                    </Grid>
                    <Grid item xs={12} className={classes.infoContainer}>
                        <div className={classes.chipContainer}>
                            <Chip variant="outlined" size="small" label={isQuestionLoading === true ? "loading" : "season: " + currentQuestion.questionInfo.season} />
                            <Chip variant="outlined" size="small" label={isQuestionLoading === true ? "loading" : "episode: " + currentQuestion.questionInfo.episode} />
                            <Chip variant="outlined" size="small" label={isQuestionLoading === true ? "loading" : "difficulty: " + currentQuestion.questionInfo.difficulty} />
                        </div>
                        <Chip color="secondary" variant="outlined" label={`Current Run: ${questionsSeen}`} />
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
                                        choices.map((option) => {
                                            return (
                                                <FormControlLabel sx={choiceStyle} className={classes.radioStyle} key={option} value={option} control={<Radio/>} label={option} />
                                            )
                                        }) :
                                        <FormControlLabel key="Loading" value="Loading" control={<Radio />} label="Loading" />
                                    }
                                </RadioGroup>
                                {
                                    isNextQuestion ? 
                                    <Button variant="contained" color={(isCorrect ? "success" : "secondary")} size="large" onClick={handleNextQuestion}>Next Question</Button>
                                    :
                                    <Button sx={{ height: 50}} className={classes.buttonStyle} disabled={!timeUp} variant="contained" color="primary" size="large" onClick={checkAnswer}>Check Choice</Button>
                                }
                            </FormControl>
                        </form>
                    </Grid>
                </Grid>
            </Container>
            </React.Fragment>
            }
            <Snackbar sx={{mt: 7}} open={open} anchorOrigin={{ horizontal: 'center', vertical: 'top' }} autoHideDuration={2500} onClose={handleClose} key={questionsSeen}>
                <Alert onClose={handleClose} severity={severity}>{snackMessage}</Alert>
            </Snackbar>
        </React.Fragment>
    );
};

// let userRef = fireStore.collection('users').doc(currentUser.uid);
            // userRef.get().then((doc) => {
            //     if(doc.exists){
            //         fireStore.collection("theOfficeTriviaQuestions")
            //         .where(firebaseApp.firestore.FieldPath.documentId(), "not-in", doc.data().questionsAnswered).limit(1)
            //         .get().then((querySnapshot) => {
            //             querySnapshot.forEach((nextDoc) => {
            //                 if(nextDoc.exists){
            //                     setCurrentQuestionId(nextDoc.id);
            //                     setCurrentQuestion(nextDoc.data());
            //                     setIsQuestionLoading(false);
            //                     setTimeUp(true);
            //                 } else {
            //                     console.log("No more questions!")
            //                 }
            //             })
            //         })
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
            // async function getNewQuestion(){
            //     setQuestionsSeen((nextQuestion) => nextQuestion + 1);
            //     setIsQuestionLoading(true);
            //     setIsNextQuestion(false);
            //     if(open){
            //         setOpen(false);
            //     } 
            //     if(currentUser !== null){
            //         const userRef = doc(db, "users", currentUser.uid);
            //         const userSnap = await getDoc(userRef);
            //         if(userSnap.exists()) {
            //             const q = query(collection(db, "theOfficeTriviaQuestions"), where(documentId(), "not-in", userSnap.data().questionsAnswered));
            //             const querySnap = await getDocs(q);
            //             querySnap.forEach((doc) => {
            //                 setCurrentQuestionId(doc.id);
            //                 setCurrentQuestion(doc.data());
            //                 setIsQuestionLoading(false);
            //                 setTimeUp(true);
            //             })
            //         }
            //     }
            // }