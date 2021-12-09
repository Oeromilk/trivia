import React, { useState, useEffect } from 'react';
import { db } from './firebase/firebaseConfig';
import { collection, getDocs, setDoc, doc, getDoc, query, where } from "firebase/firestore";
import { Container, Grid, Typography, Paper, Avatar, Button, List, ListItem, Divider } from '@mui/material';
import { ThumbUp, ThumbDown } from '@mui/icons-material';
import AvatarContainer from "./Avatar";

export default function Review(){
    const [userInfo, setUserInfo] = useState(null);
    const [contributions, setContributions] = useState([]);
    const [thumbUpColor, setThumbUpColor] = useState("inherit");
    const [thumbDownColor, setThumbDownColor] = useState("inherit");

    useEffect(() => {
        getUserInfo();
        checkContributions();
    }, [])

    async function vote(docId, ballot){
        const subColRef = collection(db, "theOfficeTriviaContributions", docId, "votes");
        
        await setDoc(doc(subColRef, userInfo.username), {
            approve: ballot,
            username: userInfo.username
        })
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
                arr.push({id: doc.id, data: doc.data()})
            });

            setContributions(arr);
        }
    }

    const handleThumbUp = (docId) => {
        setThumbUpColor("success");
        vote(docId, true);
        if(thumbDownColor === "error"){
            setThumbDownColor("inherit");
        }
    }

    const handleThumbDown = (docId) => {
        setThumbDownColor("error");
        vote(docId, false);
        if(thumbUpColor === "success"){
            setThumbUpColor("inherit");
        }
    }

    const contributionList = contributions.map((item) => {
        let choices = item.data.choices;
        console.log(item)
        return (
            <Grid item xs={12} key={item.id}>
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
                        <Grid item xs={10} md={4}>
                            <Typography color="secondary">Choices</Typography>
                            <List>
                                {choices.map((choice, index, choices) => {
                                    return (
                                        <ListItem divider={(index + 1 === choices.length) ? false : true} key={choice}>{choice}</ListItem>
                                    )
                                })}
                            </List>
                        </Grid>
                        <Grid sx={{display: "flex", flexDirection: "column", justifyContent: "flex-end"}} item xs={2} md={1}>
                            <Button sx={{marginBottom: 1}} color={thumbUpColor} variant="outlined" onClick={() => handleThumbUp(item.id)}>
                                <ThumbUp />
                            </Button>
                            <Button color={thumbDownColor} variant="outlined" onClick={() => handleThumbDown(item.id)}>
                                <ThumbDown />
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        )
    })

    return (
        <Container sx={{marginTop: 10}} maxWidth="md">
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Typography variant="h2" color="primary">Community Contributions</Typography>
                </Grid>
                <Grid item xs={12}>
                    {(contributions.size === 0) ? <Typography variant="caption">No new contributions, check back later!</Typography> : contributionList}
                </Grid>
            </Grid>
        </Container>
    )
}