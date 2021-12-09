import React, { useState, useEffect } from 'react';
import { db } from './firebase/firebaseConfig'
import { collection, addDoc } from "firebase/firestore";
import { Container, Grid, Typography, Button, TextField, Tooltip, InputLabel, Select, MenuItem, FormControl, CircularProgress, Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
})

export default function Contribute(){
    const numberOfEpisodes = {
        1: 6,
        2: 22,
        3: 25,
        4: 19,
        5: 28,
        6: 26,
        7: 26,
        8: 24,
        9: 25
    }
    const [question, setQuestion] = useState("");
    const [questionValidation, setQuestionValidation] = useState({error: false, text: null});
    const [answer, setAnswer] = useState("");
    const [answerValidation, setAnswerValidation] = useState({error: false, text: null});
    const [difficulty, setDifficulty] = useState(1);
    const [season, setSeason] = useState(1);
    const [episode, setEpisode] = useState(1);
    const [episodeCount, setEpisodeCount] = useState(numberOfEpisodes[season]);
    const [choicesField, setChoicesField] = useState([{value: null}]);
    const [isAnswerIncluded, setIsAnswerIncluded] = useState(false);
    const [isChoicesBlank, setIsChoicesBlank] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [snackMessage, setSnackMessage] = React.useState('');
    const [severity, setSeverity] = React.useState('success');
    const [open, setOpen] = useState(false);
    const questionToolTip = "Remember, questions are timed.";
    const answerToolTip = "Keep it simple stupid.";
    const difficultyToolTip = "Rank it 1, 2, 3, 4, 5. 1 being easist and 5 being hardest. Think your question is almost impossible, then rank it 6.";

    useEffect(() => {
        if(question !== ""){
            setQuestionValidation({
                error: false,
                text: null
            })
        }
    }, [question])

    useEffect(() => {
        if(answer !== ""){
            setAnswerValidation({
                error: false,
                text: null
            })
        }
    }, [answer])

    useEffect(() => {
        setEpisodeCount(numberOfEpisodes[season])
    }, [season])

    async function sendNewContribution(data){
        const docRef = await addDoc(collection(db, "theOfficeTriviaContributions"), data);

        if(docRef.id){
            setIsSending(false);
            setOpen(true);
            setSnackMessage(`Contribution saved as #${docRef.id}`);
            setQuestion("");
            setAnswer("");
            setChoicesField([{value: null}]);
        } else {
            setIsSending(false);
            setOpen(true);
            setSeverity('warning');
            setSnackMessage("Error occured trying to save contribution, please try again.");
        }
    }

    const submitNewQuestion = (event) => {
        event.preventDefault();
        var contribution;

        if(question === ""){
            setQuestionValidation({
                error: true,
                text: "Please include a question."
            })
            return;
        } else {
            setQuestionValidation({
                error: false,
                text: null
            })
        }

        if(answer === ""){
            setAnswerValidation({
                error: true,
                text: "Please include an answer."
            })
            return;
        } else {
            setAnswerValidation({
                error: false,
                text: null
            })
        }

        if(choicesField.some(field => field.value === null) === false){
            setIsChoicesBlank(false);
            if(choicesField.some(field => field.value === answer)){
                setIsAnswerIncluded(false);
                setIsSending(true);
                contribution = {
                    creator: localStorage.getItem("uid"),
                    question: question,
                    answer: answer,
                    choices: choicesField.map(field => field.value),
                    season: season,
                    episode: episode,
                    difficulty: difficulty
                }
                sendNewContribution(contribution)
            } else {
                setIsAnswerIncluded(true);
                return;
            }
        } else {
            setIsChoicesBlank(true);
            return;
        }
        
    }

    const handleQuestion = (event) => {
        setQuestion(event.target.value)
    }

    const handleAnswer = (event) => {
        setAnswer(event.target.value)
    }

    const handleDifficultyChange = (event) => {
        setDifficulty(event.target.value)
    }

    const handleSeasonChange = (event) => {
        setSeason(event.target.value)
    }

    const handleEpisodeChange = (event) => {
        setEpisode(event.target.value)
    }

    const handleChoiceChange = (i, event) => {
        const values = [...choicesField];
        values[i].value = event.target.value;
        setChoicesField(values);
    }

    const addChoice = () => {
        const values = [...choicesField];
        values.push({ value: null, error: false, text: null });
        setChoicesField(values);
    }

    const removeChoice = (i) => {
        const values = [...choicesField];
        values.splice(i, 1);
        setChoicesField(values);
    }

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    return (
        <React.Fragment>
            <Container sx={{marginTop: 2, marginBottom: 8}} maxWidth="sm">
                <Typography sx={{marginBottom: 2}} variant="h2" align="center">Create Your Trivia Question</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Tooltip title={questionToolTip} placement="bottom-start">
                            <TextField error={questionValidation.error} helperText={questionValidation.text} fullWidth id="question" label="Question" value={question} onChange={handleQuestion} autoComplete="off"/>
                        </Tooltip>
                    </Grid>
                    <Grid item xs={12}>
                        <Tooltip title={answerToolTip} placement="bottom-start">
                            <TextField error={answerValidation.error} helperText={answerValidation.text} fullWidth id="answer" label="Answer" value={answer} onChange={handleAnswer} autoComplete="off"/>
                        </Tooltip>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container columnSpacing={2}>
                            <Grid item xs={9}>
                                <Tooltip title="List of choices for user to choose from." placement="top-start">
                                    <Typography variant="h4">Choices</Typography>
                                </Tooltip>
                                <span><Typography sx={{color: "#808080"}} variant="caption">3 to 5 choices are the ideal amount, but hey, go crazy if you want!</Typography></span>
                                {(isAnswerIncluded) ? <div><Typography sx={{color: "#f44336"}} variant="caption">Choices must include the answer.</Typography></div> : null}
                                {(isChoicesBlank) ? <div><Typography sx={{color: "#f44336"}} variant="caption">Choices must have some value.</Typography></div> : null}
                            </Grid>
                            <Grid item xs={3}>
                                <Button sx={{paddingTop: 2, paddingBottom: 2}} fullWidth={true} size="small" variant="outlined" color="success" onClick={() => addChoice()}>Add Choice</Button>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12}>
                        {
                            choicesField.map((field, index) => {
                                var margin = (index > 0) ? 2 : 0;
                                return (
                                    <Grid sx={{marginTop: margin}} container columnSpacing={2} key={`${field}-${index}`}>
                                        <Grid item xs={9}>
                                            <TextField fullWidth label="Choice" value={field.value || ""} onChange={e => handleChoiceChange(index, e)} />
                                        </Grid>
                                        <Grid item xs={3}>
                                            <Button sx={{paddingTop: 2, paddingBottom: 2}} size="small" variant="outlined" color="warning" onClick={() => removeChoice(index)}>Remove Choice</Button>
                                        </Grid>
                                    </Grid>
                                )
                            })
                        }
                    </Grid>
                    <Grid item xs={12}>
                        <Tooltip title="Season question took place." placement="top-start">
                            <FormControl fullWidth>
                                <InputLabel id="season">Season</InputLabel>
                                <Select
                                    labelId="season"
                                    id="season-select"
                                    value={season}
                                    label="Season"
                                    onChange={handleSeasonChange}
                                >
                                    <MenuItem value={1}>One</MenuItem>
                                    <MenuItem value={2}>Two</MenuItem>
                                    <MenuItem value={3}>Three</MenuItem>
                                    <MenuItem value={4}>Four</MenuItem>
                                    <MenuItem value={5}>Five</MenuItem>
                                    <MenuItem value={6}>Six</MenuItem>
                                    <MenuItem value={7}>Seven</MenuItem>
                                    <MenuItem value={8}>Eight</MenuItem>
                                    <MenuItem value={9}>Nine</MenuItem>
                                </Select>
                            </FormControl>
                        </Tooltip>
                    </Grid>
                    <Grid item xs={12}>
                        <Tooltip title="Episode question took place." placement="top-start">
                            <FormControl fullWidth>
                                <InputLabel id="episode">Episode</InputLabel>
                                <Select
                                    labelId="episode"
                                    id="episode-select"
                                    value={episode}
                                    label="Episode"
                                    onChange={handleEpisodeChange}
                                >
                                    {
                                        Array.from({length: episodeCount}).map((x, i) =>
                                        <MenuItem value={i + 1} key={`${i} + ${x}`}>{i + 1}</MenuItem>)
                                    }
                                </Select>
                            </FormControl>
                        </Tooltip>
                    </Grid>
                    <Grid item xs={12}>
                        <Tooltip title={difficultyToolTip} placement="top-start">
                            <FormControl fullWidth>
                                <InputLabel id="difficulty">Difficulty</InputLabel>
                                <Select
                                    labelId="difficulty"
                                    id="difficulty-select"
                                    value={difficulty}
                                    label="Difficulty"
                                    onChange={handleDifficultyChange}
                                >
                                    <MenuItem value={1}>One</MenuItem>
                                    <MenuItem value={2}>Two</MenuItem>
                                    <MenuItem value={3}>Three</MenuItem>
                                    <MenuItem value={4}>Four</MenuItem>
                                    <MenuItem value={5}>Five</MenuItem>
                                    <MenuItem value={6}>Six</MenuItem>
                                </Select>
                            </FormControl>
                        </Tooltip>
                    </Grid>
                    <Grid item xs={12}>
                        <Button sx={{width: "100%", paddingTop: 2, paddingBottom: 2}} disabled={isSending} variant="outlined" color="primary" onClick={submitNewQuestion}>
                            {(isSending) ? <CircularProgress /> : "Contribute"}
                        </Button>
                    </Grid>
                </Grid>
                <Snackbar sx={{mt: 7}} open={open} anchorOrigin={{ horizontal: 'center', vertical: 'top' }} autoHideDuration={2500} onClose={handleClose} key={question + answer}>
                    <Alert onClose={handleClose} severity={severity}>{snackMessage}</Alert>
                </Snackbar>
            </Container>
        </React.Fragment>
    )
}