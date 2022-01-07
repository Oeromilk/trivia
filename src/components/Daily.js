import React, { useState, useEffect } from 'react';
import Timer from './Timer';
import { db } from './firebase/firebaseConfig';
import { getDocs, collection, query, orderBy, addDoc } from "firebase/firestore";
import { Stack, Paper, Typography, Skeleton, FormControl, FormLabel, RadioGroup, Radio, FormControlLabel, Chip, Button, Alert, Collapse } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
    container: {
        maxWidth: '600px',
        margin: `${theme.spacing(15)} auto ${theme.spacing(5)} auto`
    },
    stack: {
        padding: theme.spacing(3)
    },
    timerWrap: {
        width: '100%'
    },
    radioStyle: {
        marginLeft: theme.spacing(1),
        marginBottom: theme.spacing(3)
    },
}))

export default function Daily(){
    const classes = useStyles();
    const [dailyQuestion, setDailyQuestion] = useState(null);
    const [choices, setChoices] = useState(null);
    const [choice, setChoice] = useState(null);
    const [characterCount, setCharacterCount] = useState(0);
    const [isCorrect, setIsCorrect] = useState(null);
    const [timeUp, setTimeUp] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const isNextQuestion = false;
    const choiceStyle = {
        borderRadius: '0.5em',
        border: '1px solid #484848',
        boxShadow: '0px 0px 6px 1px rgba(0,0,0,0.75)',
        paddingTop: '0.25em',
        paddingBottom: '0.25em',
        textAlign: 'center'
    };

    useEffect(() => {
        if(dailyQuestion !== null){
            if(!timeUp && (isCorrect === null || false)){
                updateLocalGameInfo(false);
                setShowAlert(true);
            }
        }
    }, [timeUp])

    useEffect(() => {
        if(dailyQuestion !== null){
           
            if(isCorrect && isCorrect !== null){
                updateIfCorrect();
                updateLocalGameInfo(true);
            } else {
                updateLocalGameInfo(false);
            }
            setShowAlert(true);
        }
    }, [isCorrect])

    useEffect(() => {
        getDailyQuestion();
    }, [])

    async function getDailyQuestion() {
        const questionsRef = query(collection(db, "theOfficeTriviaQuestions"), orderBy("id"));
        const questionsAnsweredRef = collection(db, `users/${localStorage.getItem("uid")}/questions-answered`);
        const questionsSnap = await getDocs(questionsRef);
        const questionsAnsweredSnap = await getDocs(questionsAnsweredRef);
        var newQuestions = [];
        var qsAnswered = [];
        questionsSnap.forEach(doc => {
            newQuestions.push(doc.data())
        })
        questionsAnsweredSnap.forEach(doc => {
            qsAnswered.push(doc.data())
        })
        const questionsToRemove = new Set(qsAnswered);
        const updatedQuestions = newQuestions.filter((question) => {
            return !questionsToRemove.has(question);
        });

        const newQuestion = updatedQuestions[getRandomId(updatedQuestions.length)]

        console.log(newQuestion)
        countCharacters();
        setChoices(newQuestion.questionInfo.choices);
        setDailyQuestion(newQuestion);
        setTimeUp(true);
    }

    async function updateIfCorrect(){
        await addDoc(collection(db, `users/${localStorage.getItem("uid")}/questions-answered`), dailyQuestion)
    }

    const updateLocalGameInfo = (correct) => {
        var dailyGameInfo = JSON.parse(localStorage.getItem("daily-game-info"));
        if(dailyGameInfo === null){
            dailyGameInfo = {
                timesPlayed: 0,
                timesWon: 0,
                winPercentage: 0,
                currentStreak: 0,
                maxStreak: 0
            }
        }
        dailyGameInfo.timesPlayed++;
        if(correct){
            dailyGameInfo.timesWon++;
            dailyGameInfo.currentStreak++;
        }
        if(dailyGameInfo.currentStreak > dailyGameInfo.maxStreak){
            dailyGameInfo.maxStreak = dailyGameInfo.currentStreak;
        }
        dailyGameInfo.winPercentage = dailyGameInfo.timesPlayed / dailyGameInfo.timesWon;

        localStorage.setItem("daily-game-info", JSON.stringify(dailyGameInfo));
    }

    const countCharacters = () => {
        if(dailyQuestion !== null){
            let questionCount = dailyQuestion.questionInfo.question.length;
            let choicesCount = 0;
            dailyQuestion.questionInfo.choices.forEach((option) => {
                choicesCount += option.length;
            })
            
            setCharacterCount(questionCount + choicesCount);
        }
    }

    const handleUserChoice = (event) => {
        setChoice(event.target.value);
    }

    const checkAnswer = (event) => {
        
        event.preventDefault();

        if(choice === dailyQuestion.questionInfo.answer) {
            setIsCorrect(true);
        } else {
            setIsCorrect(false);
        }

        setTimeUp(false);
    }

    const getRandomId = (length) => {
        return  Math.floor(Math.random() * length);
    }

    const loader = 
            <Stack className={classes.stack} direction="column" justifyContent="flex-start" alignItems="center" spacing={5}>
                <Skeleton variant="text" />
                <Skeleton variant="rectangular" />
                <Skeleton variant="text" />
                <Skeleton variant="rectangular" />
                <Skeleton variant="circular" />
            </Stack>

    return (
        <Paper className={classes.container}>
            {dailyQuestion === null ? loader : <Stack className={classes.stack} direction="column" justifyContent="flex-start" alignItems="center" spacing={5}>
                <div className={classes.timerWrap}>
                    <Timer count={characterCount} timeUp={timeUp} setTimeUp={setTimeUp} isNextQuestion={isNextQuestion}/>
                </div>
                <Stack direction="row" spacing={1}>
                    <Chip variant="outlined" size="small" label={"season: " + dailyQuestion.questionInfo.season} />
                    <Chip variant="outlined" size="small" label={"episode: " + dailyQuestion.questionInfo.episode} />
                    <Chip variant="outlined" size="small" label={"difficulty: " + dailyQuestion.questionInfo.difficulty} />
                </Stack>
                <Typography sx={{fontSize: '1.5em'}} >{dailyQuestion.questionInfo.question}</Typography>
                <FormControl sx={{width: '75%'}} component="fieldset">
                    <FormLabel sx={{fontSize: '1.5em', fontWeight: 'bold', marginBottom: 1}} component="legend" color="secondary">Choices</FormLabel>
                    <RadioGroup aria-label="trivia" name="trivia" value={choice} onChange={handleUserChoice}>
                        {
                            choices.map((option) => {
                            return (
                                <FormControlLabel sx={choiceStyle} className={classes.radioStyle} key={option} value={option} control={<Radio />} label={option} />
                            )
                        })}
                    </RadioGroup>
                </FormControl>
                <Button sx={{paddingTop: 2, paddingBottom: 2}} fullWidth disabled={!timeUp} variant="contained" color="primary" size="large" onClick={checkAnswer}>Check Choice</Button>
                <Collapse in={showAlert}>
                    <Alert variant="outlined" severity={isCorrect ? "success" : "warning"}>
                        {isCorrect ? "Nice! You are pretty good at this!" : "Sorry that's wrong, better luck tomorrow!"}
                    </Alert>
                </Collapse>
            </Stack>}
        </Paper>
    )
}