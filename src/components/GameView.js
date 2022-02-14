import React from 'react';
import { useHistory } from "react-router-dom";
import { isMobile } from 'react-device-detect';
import Timer from './Timer';
import { auth, analytics, db, storage } from './firebase/firebaseConfig';
import { collection, addDoc, getDocs, query, orderBy } from "firebase/firestore";
import { ref, getDownloadURL } from "firebase/storage";
import { logEvent } from "firebase/analytics";
import chance from '../images/chance.svg';
import makeStyles from '@mui/styles/makeStyles';
import { Container, CssBaseline, Grid, Button, Typography, FormControl, FormControlLabel, Radio, RadioGroup, Chip, Snackbar, Divider } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

const useStyles = makeStyles((theme) => ({
    root: {
        marginTop: (isMobile ? theme.spacing(3) : theme.spacing(10)),
        marginBottom: (isMobile ? theme.spacing(3) : theme.spacing(5)),
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
            <Grid style={(isMobile ? {paddingTop: '5em'} : {paddingTop: '15em'})} container spacing={10}>
                <Grid item xs={12}>
                    <Typography align="center" variant="h1">Ready to go?</Typography>
                </Grid>
                <Grid item style={{display: 'flex', justifyContent: 'center'}} xs={12}>
                    <Button style={{margin: '0 auto', height: 72, width: 144}} variant="contained" color="primary" onClick={props.startGame}>
                        <Typography variant="body1">Start Game</Typography>
                    </Button>
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
    const history = useHistory();
    const currentUser = auth.currentUser;
    const [availableQuestions, setAvailableQuestions] = React.useState([]);
    const [allQuestionsSeen, setAllQuestionsSeen] = React.useState([]);
    const [mediaSrc, setMediaSrc] = React.useState(null);
    const [questionType, setQuestionType] = React.useState('text');
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
        paddingBottom: '0.25em',
        textAlign: 'center'
    };

    React.useEffect(() => {
        getQuestions();
    }, [])

    async function getQuestions(){
        const collectionRef = query(collection(db, "theOfficeTriviaQuestions"), orderBy("id"));
        const questionsAnsweredRef = collection(db, `users/${currentUser.uid}/questions-answered`);
        const collectionSnap = await getDocs(collectionRef);
        const questionsAnsweredSnap = await getDocs(questionsAnsweredRef);
        var newQuestions = [];
        var qsAnswered = [];
        collectionSnap.forEach(doc => {
            newQuestions.push(doc.data())
        })
        questionsAnsweredSnap.forEach(doc => {
            qsAnswered.push(doc.data())
        })

        const questionsToRemove = new Set(qsAnswered);
        const updatedQuestions = newQuestions.filter((question) => {
            // return those elements not in the namesToDeleteSet
            return !questionsToRemove.has(question);
          });
        
        setAvailableQuestions(updatedQuestions);
        setAllQuestionsSeen(qsAnswered);
    }

    const setNextQuestion = () => {
        if(availableQuestions.length === 0){
            let newStats = {
                percentageRight: Math.round((questionsCorrect / questionsSeen + Number.EPSILON) * 100) / 100,
                questionsCorrect: questionsCorrect,
                questionsSeen: questionsSeen
            }
            updateWhenGameOver(newStats);
            history.push("/game/ending");
            return;
        }

        setQuestionsSeen((nextQuestion) => nextQuestion + 1);
        setIsQuestionLoading(true);
        setIsNextQuestion(false);

        if(open){
            setOpen(false);
        }

        const nextQuestion = getRandomQuestion();

        setCurrentQuestionId(nextQuestion.id);
        setCurrentQuestion(nextQuestion);
        setQuestionType(nextQuestion.questionInfo.type);
        setChoices(nextQuestion.questionInfo.choices.sort(() => Math.random() - 0.5));
        setAllQuestionsSeen(seen => [...seen, nextQuestion]);
        setAvailableQuestions(questions => questions.filter((question) => question !== nextQuestion))
        countCharacters();
        if(nextQuestion.questionInfo.type === "audio") {
            getQuestionMedia('audio-clips/', nextQuestion.questionInfo.fileName);
        }
        if(nextQuestion.questionInfo.type === "image"){
            getQuestionMedia('images/', nextQuestion.questionInfo.fileName);
        }
        if(nextQuestion.questionInfo.type === "text") {
            setIsQuestionLoading(false);
            setTimeUp(true);
        }
    }

    const getQuestionMedia = (type, fileName) => {
        getDownloadURL(ref(storage, `${type}/${fileName}`))
            .then((url) => {
                setMediaSrc(url);
            })
            .catch((error) => {
                console.log(error);
            })
    }

    const getRandomQuestion = () => {
        var random = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

        if(allQuestionsSeen.includes(random)){
            random = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        }

        return random;
    }

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
        await addDoc(collection(db, `users/${currentUser.uid}/game-stats`), stats);
        logEvent(analytics, 'game_ended', stats);
    }

    async function updateIfCorrect(){
        await addDoc(collection(db, `users/${currentUser.uid}/questions-answered`), currentQuestion)
    }

    const countCharacters = () => {
        if(currentQuestion !== null){
            let questionCount = currentQuestion.questionInfo.question.length;
            let choicesCount = 0;
            let mediaCount = 0;
            currentQuestion.questionInfo.choices.forEach((option) => {
                choicesCount += option.length;
            })

            if(currentQuestion.questionInfo.type === "audio"){
               mediaCount += 25;
            }

            if(currentQuestion.questionInfo.type === "image"){
                mediaCount += 20;
            }
            
            setCharacterCount(questionCount + choicesCount + mediaCount);
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
        logEvent(analytics, 'game_started');
        setNextQuestion();
    }

    function handleNextQuestion(){
        setIsCorrect(null)
        setChoice('');
        setNextQuestion();
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    const mediaLoaded = () => {
        setIsQuestionLoading(false);
        setTimeUp(true);
    }

    const questionMedia = () => {
        if(questionType === "text") {
            return null;
        }

        if(questionType === "audio"){
            return <audio onCanPlayThrough={mediaLoaded} style={{width: '100%'}} controls src={mediaSrc}/>
        }

        if(questionType === "image"){
            return <img onLoad={mediaLoaded} id="question-image" alt="question" src={mediaSrc}/>
        }
    }

    return (
        <React.Fragment>
            <CssBaseline />
            {
                chances < 1 ? <GameOver seen={questionsSeen} correct={questionsCorrect}/> :
            <React.Fragment>
            <StartScreen isShown={isShown} startGame={startGame}/>
            <Container style={(isShown ? {display: 'none'} : {})} className={classes.root}>
                <Grid sx={{maxWidth: 500, margin: '0 auto'}} display={isShown ? 'none' : ''} container rowSpacing={2}>
                    <Grid item xs={12}>
                        <Typography align="center" variant={(isMobile ? "h5" : "h3")}>Chances Remaining:</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <div className={classes.chanceContainer}>
                            <img className={`${classes.chance} ${chances < 1 ? classes.lostChance : ''}`} src={chance} alt="chances remaining 1" />
                            <img className={`${classes.chance} ${chances < 2 ? classes.lostChance : ''}`} src={chance} alt="chances remaining 2" />
                            <img className={`${classes.chance} ${chances < 3 ? classes.lostChance : ''}`} src={chance} alt="chances remaining 3" />
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
                        <Chip color="success" variant="outlined" label={`Current Run: ${questionsSeen}`} />
                    </Grid>
                    <Grid item xs={12}>
                        <Typography style={{fontSize: '24px'}} align="center">{isQuestionLoading === true ? "Question Loading" : currentQuestion.questionInfo.question}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        {questionMedia()}
                    </Grid>
                    <Grid item xs={12}>
                        <form className={classes.formStyle}>
                            <FormControl className={classes.formControlStyle}>
                                <RadioGroup sx={{ marginBottom: 2 }} aria-label="trivia" name="trivia" value={choice} onChange={handleUserChoice}>
                                    {
                                        isQuestionLoading === false ?
                                        choices.map((option) => {
                                            return (
                                                <FormControlLabel sx={choiceStyle} className={classes.radioStyle} key={option} value={option} control={<Radio />} label={option} />
                                            )
                                        }) :
                                        <FormControlLabel key="Loading" value="Loading" control={<Radio />} label="Loading" />
                                    }
                                </RadioGroup>
                                {
                                    isNextQuestion ? 
                                    <Button sx={{paddingTop: 2, paddingBottom: 2}} variant="contained" color={(isCorrect ? "success" : "secondary")} size="large" onClick={handleNextQuestion}>Next Question</Button>
                                    :
                                    <Button sx={{paddingTop: 2, paddingBottom: 2}} fullWidth disabled={!timeUp} variant="contained" color="primary" size="large" onClick={checkAnswer}>Check Choice</Button>
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