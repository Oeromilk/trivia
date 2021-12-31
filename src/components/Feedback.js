import React, { useEffect, useState } from 'react';
import { useHistory } from "react-router-dom";
import { db, analytics, auth } from './firebase/firebaseConfig';
import { logEvent } from "firebase/analytics";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { motion } from 'framer-motion/dist/framer-motion';
import { Container, Stack, Typography, Paper, Alert, Collapse, IconButton, Button, TextField, CircularProgress, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

export default function Feedback(){
    const [option, setOption] = useState('');
    const [description, setDescription] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [alertSeverity, setAlertSeverity] = useState('info');
    const history = useHistory();

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
        if(!auth.currentUser){
            history.push('/')
        }
    }, [])

    async function submitFeedback() {
        const feedbackRef = await addDoc(collection(db, 'feedback'), {
            option: option,
            description: description,
            submittedBy: localStorage.getItem('uid'),
            provided: Timestamp.now()
        })

        if(feedbackRef.id){
            setShowAlert(true);
            setIsSending(false);
            setAlertSeverity('success');
            setAlertMessage(`Feedback successfully submitted with an id of ${feedbackRef.id}`);
            logEvent(analytics, 'feedback', {option})
        } else {
            setShowAlert(true);
            setIsSending(false);
            setAlertSeverity('error');
            setAlertMessage(`There was an issue submitting feedback, please try again.`);
        }
    }

    const handleOption = (event) => {
        setOption(event.target.value)
    }

    const handleDescription = (event) => {
        setDescription(event.target.value)
    }

    const handleFeedback = (event) => {
        event.preventDefault();
        setIsSending(true);
        submitFeedback();
    }

    return (
        <motion.div variants={containerVariants} initial="initial" animate="animate" exit="exit">
            <Container sx={{marginTop: 15}} maxWidth="sm">
                <Paper sx={{padding: 3}} variant="outlined">
                    <Stack direction="column" justifyContent="space-evenly" alignItems="center" spacing={3}>
                        <Typography sx={{fontSize: '3em'}}>Share your Feedback</Typography>
                        <Typography>Have you experienced a bug, want to suggest a new idea, or have just general feedback? Choose an option below and share as much detail as possible.</Typography>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Option</FormLabel>
                            <RadioGroup row aria-label="opton" name="row-radio-buttons-group" value={option} onChange={handleOption}>
                                <FormControlLabel value="bug" control={<Radio />} label="Bug" />
                                <FormControlLabel value="idea" control={<Radio />} label="Idea" />
                                <FormControlLabel value="feedback" control={<Radio />} label="Feedback" />
                            </RadioGroup>
                        </FormControl>
                        <TextField id="feeback-description" label="Description" fullWidth multiline minRows={5} value={description} onChange={handleDescription} />
                        <Button size="large" disabled={isSending} fullWidth variant="outlined" onClick={handleFeedback}>
                            {isSending ? <CircularProgress /> : 'Submit Feedback'}
                        </Button>
                        <Collapse in={showAlert}>
                            <Alert variant="outlined" severity={alertSeverity}
                                action={<IconButton aria-label="close" color="inherit" size="small" onClick={() => {setShowAlert(false)}}>
                                    <CloseRoundedIcon fontSize="inherit" />
                                </IconButton>}
                            >{alertMessage}</Alert>
                        </Collapse>
                    </Stack>
                </Paper>
            </Container>
        </motion.div>
    )
}