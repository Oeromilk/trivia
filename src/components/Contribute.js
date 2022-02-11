import React, { useState, useEffect } from 'react';
import { db, analytics } from './firebase/firebaseConfig';
import { logEvent } from "firebase/analytics";
import { collection, addDoc, getDoc, doc } from "firebase/firestore";
import { motion } from 'framer-motion/dist/framer-motion';
import { Container, Grid, Typography, Button, TextField, Tooltip, InputLabel, Select, MenuItem, FormControl, CircularProgress, Snackbar, Autocomplete } from '@mui/material';
import MuiAlert from '@mui/material/Alert';

function useDebounce(value, delay) {
    // State and setters for debounced value
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        // Update debounced value after delay
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        // Cancel the timeout if value changes (also on delay change or unmount)
        // This is how we prevent debounced value from updating if value is changed ...
        // .. within the delay period. Timeout gets cleared and restarted.
        return () => {
            clearTimeout(handler);
        };
    // Only re-call effect if value or delay changes
    },[value, delay] );

    return debouncedValue;
}

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
    const [userInfo, setUserInfo] = useState(null);
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
    const [tagList, setTagList] = useState([]);
    const [tagHelperText, setTagHelperText] = useState(null);
    const debouncedQuestion = useDebounce(question, 1000);
    const debouncedAnswer = useDebounce(answer, 1000);
    const questionToolTip = "Remember, questions are timed.";
    const answerToolTip = "Keep it simple stupid.";
    const difficultyToolTip = "Rank it 1, 2, 3, 4, 5. 1 being easist and 5 being hardest. Think your question is almost impossible, then rank it 6.";
    const tagOptions = [
        {label: "Michael"},
        {label: "Dwight"},
        {label: "Jim"},
        {label: "Pam"},
        {label: "Andy"},
        {label: "Angela"},
        {label: "Creed"},
        {label: "Stanley"},
        {label: "Toby"},
        {label: "Darryl"},
        {label: "Oscar"},
        {label: "Kevin"},
        {label: "Meredith"},
        {label: "Phyllis"},
        {label: "Kelly"},
        {label: "Ryan"},
        {label: "Erin"},
        {label: "Packer"},
        {label: "Gabe"},
        {label: "Holly"},
        {label: "Robert"},
        {label: "Nellie"},
        {label: "Clark"},
        {label: "Pete"},
        {label: "Roy"},
        {label: "David"},
        {label: "Jo"},
        {label: "Charles"},
        {label: "Karen"}
    ]
    const containerVariants = {
        initial: {
            opacity: 0,
            x: '100vw'
        },
        animate: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.5,
                type: 'spring',
                bounce: 0.25
            }
        },
        exit: {
            x: '-100vw',
            transition: {
                duration: 0.5,
                type: 'spring',
                bounce: 0.25
            }
        }
    }

    useEffect(() => {
        getUserInfo();
    }, [])

    useEffect(() => {
        if(tagList !== null && tagList.length === 0 && question !== ""){
            setTagHelperText("At least one tag needs to be included.")
        } else {
            setTagHelperText(null);
        }
    }, [tagList])

    useEffect(() => {
        for(const tag of tagOptions){
            var search = question.toLowerCase();
            var label = tag.label.toLowerCase();
            if(search.includes(label)){
                if(tagList.findIndex(x => x.label === tag.label)){
                    setTagList(prev => [...prev, tag]);
                }
            }
        }
    }, [debouncedQuestion])

    useEffect(() => {
        for(const tag of tagOptions){
            var search = answer.toLowerCase();
            var label = tag.label.toLowerCase();
            if(search.includes(label)){
                if(tagList.findIndex(x => x.label === tag.label)){
                    setTagList(prev => [...prev, tag]);
                }
            }
        }
    }, [debouncedAnswer])

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
    
    async function getUserInfo(){
        const userSnap = await getDoc(doc(db, "users", localStorage.getItem("uid")));
        if(userSnap.exists()){
            setUserInfo(userSnap.data());
        }
    }

    async function sendNewContribution(data){
        const docRef = await addDoc(collection(db, "theOfficeTriviaContributions"), data);

        if(docRef.id){
            logEvent(analytics, 'contribution_added');
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
                    creator: userInfo.username,
                    avatar: userInfo.avatar,
                    question: question,
                    answer: answer,
                    choices: choicesField.map(field => field.value),
                    season: season,
                    episode: episode,
                    difficulty: difficulty,
                    tags: tagList
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

    const handleTagChange = (event, values) => {
        console.log(values)
        setTagList(values);
    }


    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    return (
        <motion.div variants={containerVariants} initial="initial" animate="animate" exit="exit">
            <Container sx={{marginTop: 10, marginBottom: 8}} maxWidth="sm">
                <Typography sx={{marginBottom: 2}} variant="h2" align="center">Create Your Trivia Question</Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12}>
                        <Typography variant="h4">Question Tags</Typography>
                        <Typography sx={{color: "#808080"}} variant="caption">Tags should include the topic of the question. For Example, if your question is about Michael, the question should at least have a tag for Michael. Questions need at least one tag to be valid.</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Tooltip title="When you stop typing for a question or answer, we will search and apply tags automagically." placement="top-start">
                            <Autocomplete
                                multiple
                                id="tags"
                                options={tagOptions}
                                getOptionLabel={(option) => option.label}
                                value={tagList}
                                onChange={handleTagChange}
                                isOptionEqualToValue={(option, value) => option.label === value.label}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        error={tagHelperText !== null}
                                        helperText={tagHelperText}
                                        variant="outlined"
                                        label="Question Tags"
                                        placeholder="Tags"
                                    />
                                )}
                            />
                        </Tooltip>
                    </Grid>
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
                                            <Button sx={{paddingTop: 2, paddingBottom: 2}} fullWidth={true} size="small" variant="outlined" color="warning" onClick={() => removeChoice(index)}>Remove</Button>
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
        </motion.div>
    )
}