import React, { useState, useEffect } from 'react';
import { db, analytics } from './firebase/firebaseConfig';
import { logEvent } from "firebase/analytics";
import { motion } from 'framer-motion/dist/framer-motion';
import { collection, getDocs, setDoc, doc, getDoc, query, where } from "firebase/firestore";
import { Container, Grid, Typography, Paper, Avatar, Button, List, ListItem, Divider } from '@mui/material';
import { ThumbUp, ThumbDown } from '@mui/icons-material';
import AvatarContainer from "./Avatar";

export default function Review(){
    const [userInfo, setUserInfo] = useState(null);
    const [votes, setVotes] = useState([]);
    const [contributions, setContributions] = useState([]);

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
        checkContributions();
    }, [])

    useEffect(() => {
        const promises = [];
        contributions.forEach((contribution) => {
            promises.push(getVotes(contribution.id));
        })

        Promise.all(promises).then((responses) => {
            const votes = responses.map((vote) => vote);
            setVotes(votes);
        })

    }, [contributions]);

    async function vote(docId, ballot){
        const subColRef = collection(db, "theOfficeTriviaContributions", docId, "votes");
        
        await setDoc(doc(subColRef, userInfo.username), {
            approve: ballot,
            username: userInfo.username
        })
    }

    async function getVotes(docId){
        var votes = {total: 0, approve: 0, voters: []};
        
        const subColRef = collection(db, "theOfficeTriviaContributions", docId, "votes");
        const snapShot = await getDocs(subColRef);
        votes.total = snapShot.size;

        snapShot.forEach((vote) => {
            votes.voters.push(vote.data());
            if(vote.data().approve){
                votes.approve++;
            }
        })

        if(snapShot){
            return votes;
        }
    }

    async function getUserInfo(){
        const userSnap = await getDoc(doc(db, "users", localStorage.getItem("uid")));
        if(userSnap.exists()){
            setUserInfo(userSnap.data());
        }
    }

    async function checkContributions(){
        const contributionsRef = query(collection(db, "theOfficeTriviaContributions"), where("question", "!=", null));

        const snapShot = await getDocs(contributionsRef);

        var arr = [];
        if(snapShot.size > 0){
            snapShot.forEach((doc) => {
                arr.push({id: doc.id, data: doc.data(), thumbUpColor: "inherit", thumbDownColor: "inherit"})
            });

            setContributions(arr);
        }
    }

    const handleThumbUp = (docId, index) => {
        let current = [...contributions];
        let obj = {...current[index]};
        obj.thumbUpColor = "success";
        
        if(obj.thumbDownColor === "error"){
            obj.thumbDownColor = "inherit";
        }

        current[index] = obj;
        logEvent(analytics, 'voted_yes')
        setContributions(current);
        vote(docId, true);
    }

    const handleThumbDown = (docId, index) => {
        let current = [...contributions];
        let obj = {...current[index]};
        obj.thumbDownColor = "error";

        if(obj.thumbUpColor === "success"){
            obj.thumbUpColor = "inherit";
        }

        current[index] = obj;
        logEvent(analytics, 'voted_no')
        setContributions(current);
        vote(docId, false);
    }

    const contributionList = contributions.map((item, index) => {
        let choices = item.data.choices;
        var ballot;

        if(votes[index] !== undefined){
            ballot = votes[index].voters.find(x => x.username === userInfo.username);
        }
        
        return (
            <Grid item xs={12} key={index}>
                <Paper sx={{padding: 2}} elevation={3}>
                    <Grid container spacing={2}>
                        <Grid sx={{display: "flex", flexDirection: "column", justifyContent: "space-around", alignItems: "flex-start"}} item xs={3} md={2}>
                            <Typography color="secondary">Contributor</Typography>
                            <Avatar sx={{width: 48, height: 48}}><AvatarContainer avatar={item.data.avatar.toLowerCase()}/></Avatar>
                            <Typography>{item.data.creator}</Typography>
                        </Grid>
                        <Grid sx={{display: "flex", flexDirection: "column", justifyContent: "space-evenly", alignItems: "flex-start"}} item xs={9} md={5}>
                            <Typography color="secondary">Question</Typography>
                            <Divider flexItem/>
                            <Typography>{item.data.question}</Typography>
                        </Grid>
                        <Grid item xs={9} md={4}>
                            <Typography color="secondary">Choices</Typography>
                            <List>
                                {choices.map((choice, index, choices) => {
                                    return (
                                        <ListItem divider={(index + 1 === choices.length) ? false : true} key={index}>{choice}</ListItem>
                                    )
                                })}
                            </List>
                        </Grid>
                        <Grid sx={{display: "flex", flexDirection: "column", justifyContent: "flex-end"}} item xs={3} md={1}>
                            <Button color={(ballot) ? (ballot.approve) ? "success" : "inherit" : item.thumbUpColor} variant="outlined" onClick={() => handleThumbUp(item.id, index)}>
                                <ThumbUp />
                            </Button>
                            <Typography align="center" variant="subtitle2">{(votes[index] === undefined) ? 0 : votes[index].total + " / " + votes[index].approve}</Typography>
                            <Button color={(ballot) ? (!ballot.approve) ? "error" : "inherit" : item.thumbDownColor} variant="outlined" onClick={() => handleThumbDown(item.id, index)}>
                                <ThumbDown />
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        )
    })

    return (
        <motion.div  variants={containerVariants} initial="initial" animate="animate" exit="exit">
            <Container sx={{marginTop: 10, marginBottom: 2}} maxWidth="md">
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h2" color="primary">Community Contributions</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container rowSpacing={2}>
                            {(contributions.size === 0) ? <Typography variant="caption">No new contributions, check back later!</Typography> : contributionList}
                        </Grid>
                    </Grid>
                </Grid>
            </Container>
        </motion.div>
    )
}