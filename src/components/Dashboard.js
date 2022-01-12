import React, { useState, useEffect } from 'react';
import { db } from './firebase/firebaseConfig';
import { getDocs, collection, query, orderBy, limit } from "firebase/firestore";
import { useHistory } from "react-router-dom";
import { motion } from 'framer-motion/dist/framer-motion';
import { Container, Grid, Button, Typography, List, ListItem, Card, CardActions, CardContent, CardHeader, Avatar, Badge, Stack, Divider } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import AvatarContainer from './Avatar';

const useStyles = makeStyles((theme) => ({
    root: {
        [theme.breakpoints.up('md')]: {
            maxWidth: '80%',
        },
        [theme.breakpoints.down('md')]: {
            maxWidth: '90%',
            marginBottom: theme.spacing(3)
        },
        marginBottom: theme.spacing(10)
    },
    grid: {
        marginTop: theme.spacing(3)
    },
    card: {
        [theme.breakpoints.up('md')]: {
            height: '400px'
        },
        [theme.breakpoints.down('md')]: {
            height: '300px'
        }
    },
    friendCard: {
        height: '400px'
    },
    paper: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        width: '100%',
        padding: theme.spacing(1)
    }
}))

function DailyCountdown(){
    const [timeLeft, setTimeLeft] = useState("0:00:00");

    useEffect(() => {
        const intervalId = setInterval(() => {
            setTimeLeft(countDown());
          }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft])

    const twoDigits = (number) => {
        return (number < 10 ? '0' : '') + number;
    }

    const countDown = () => {
        var reset = new Date();
        var now = new Date();
        reset.setHours(8, 0, 0)
        if(now > reset){
            reset.setDate(reset.getDate() + 1);
        }

        var timeToReset = ((reset - now) / 1000);

        var hours = ~~(timeToReset / 60 / 60) % 60;
        var minutes = ~~(timeToReset / 60) % 60;
        var seconds = ~~timeToReset % 60;

        return `${twoDigits(hours)}: ${twoDigits(minutes)}: ${twoDigits(seconds)}`;
    }
    
    return (
        <Typography variant="body1" color="secondary">Next question ready in: {timeLeft}</Typography>
    )
}

function FriendsList(){
    const [friends, setFriends] = React.useState([]);

    const friendsList = friends.map((friend, index) => {
        return (    
            <Grid container key={index}>
                <Grid item xs={3}>
                    <Avatar sx={{width: 48, height: 48}}><AvatarContainer avatar={friend.avatar.toLowerCase()} /></Avatar>
                </Grid>
                <Grid item xs={9}>
                    <Typography sx={{fontSize: 32}}>{friend.username}</Typography>
                </Grid>
            </Grid>
        )
    })

    useEffect(() => {
        getUserFriends();
    }, [])

    async function getUserFriends(){
        const friendsPath = `users/${localStorage.getItem("uid")}/friends`;
        const q = query(collection(db, friendsPath), orderBy("username"), limit(3));
        const friendsSnap = await getDocs(q);

        var friends = [];
        friendsSnap.forEach(doc => {
            friends.push(doc.data())
        })

        setFriends(friends);
    }

    return (
        <Stack spacing={2} divider={<Divider />}>{friendsList}</Stack>
    )
}

export default function Dashboard(props){
    const history = useHistory();
    const classes = useStyles();
    const hasPlayedToday = checkTimeDifference();
    const [activeContributions, setActiveContributions] = useState(0);
    const [activeFriendRequests, setActiveFriendRequests] = useState(0);

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
        checkContributions();
        checkFriendRequests();
    }, [])

    async function checkFriendRequests(){
        const requestsPath = `users/${localStorage.getItem("uid")}/friend-requests`;
        const requestsRef = collection(db, requestsPath);
        const snapShot = await getDocs(requestsRef);

        if(snapShot.size > 0){
            setActiveFriendRequests(snapShot.size);
        }
    }

    async function checkContributions(){
        const contributionsRef = collection(db, "theOfficeTriviaContributions");

        const snapShot = await getDocs(contributionsRef);

        if(snapShot.size > 1){
            setActiveContributions(snapShot.size - 1);
        }
    }

    function checkTimeDifference(){
        const itemStr = localStorage.getItem("user-has-played-today")
        if(!itemStr) {
            return null;
        }

        var item = JSON.parse(itemStr);
        var now = new Date();
        
        if(now > item.expiry) {
            item.haveThey = false;
            item.expiry = ""
            localStorage.setItem("user-has-played-today", JSON.stringify(item));
            return item;
        }

        return item;
    }

    function handleNewGame(event){
        event.preventDefault();
        history.push("/game");
    }

    function manageFriends(event){
        event.preventDefault();

        history.push("/friends");
    }

    const handleContribute = (event) => {
        event.preventDefault();

        history.push("/contribute");
    }

    const handleReview = (event) => {
        event.preventDefault();

        history.push("/review");
    }

    const handleDaily = (event) => {
        event.preventDefault();
        var now = new Date();
        var reset = new Date();
        reset.setHours(7, 59, 59);

        if(now > reset){
            reset.setDate(reset.getDate() + 1);
        }
        
        localStorage.setItem("user-has-played-today", JSON.stringify({ haveThey: true, expiry: reset }));
        history.push("/daily");
    }

    return (
        <motion.div variants={containerVariants} initial="initial" animate="animate" exit="exit">
            <Container className={classes.root}>
                <Grid container spacing={3} className={classes.grid}>
                    <Grid item xs={12} >
                        <Typography variant="h3">Dashboard</Typography>
                    </Grid>
                    <Grid item lg={4} md={6} xs={12} className={classes.card}>
                        <Card className={classes.paper} elevation={3}>
                            <CardHeader title="Ready to test your knowledge?"></CardHeader>
                            <CardContent>
                                <Typography color="primary">Start a new game and see how long you can last!</Typography>
                                <Typography variant="subtitle2">Thats what she said!</Typography>
                            </CardContent>
                            <CardActions style={{justifyContent: "end"}}>
                                <Button color="secondary" variant="contained" onClick={handleNewGame}>New Game</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item lg={4} md={6} xs={12} className={classes.friendCard}>
                        <Card className={classes.paper} elevation={3}>
                            <CardHeader title="Friends"></CardHeader>
                            <CardContent>
                                <FriendsList />
                            </CardContent>
                            <CardActions style={{justifyContent: "end"}}>
                                <Badge badgeContent={activeFriendRequests} color="success">
                                    <Button color="primary" variant="outlined" className={classes.cardAction} onClick={manageFriends}>Manage Friends</Button>
                                </Badge>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item lg={4} md={6} xs={12} className={classes.card}>
                        <Card className={classes.paper} elevation={3}>
                            <CardHeader title="Daily Question"></CardHeader>
                            <CardContent>
                                {hasPlayedToday === null ? <Typography color="secondary" variant="body1">Daily question is ready!</Typography>  : <DailyCountdown />}
                            </CardContent>
                            <CardActions style={{justifyContent: "end"}}>
                                <Button disabled={hasPlayedToday === null ? false : true} color="secondary" variant="outlined" className={classes.cardAction} onClick={handleDaily}>Play</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item lg={4} md={6} xs={12} className={classes.card}>
                        <Card className={classes.paper} elevation={3}>
                            <CardHeader title="Achievments"></CardHeader>
                            <CardContent>
                                <List>
                                    <ListItem>Acievments Coming Soon</ListItem>
                                </List>
                            </CardContent>
                            <CardActions style={{justifyContent: "end"}}>
                                <Button disabled color="secondary" variant="outlined" className={classes.cardAction}>See All</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item lg={4} md={6} xs={12} className={classes.card}>
                        <Card className={classes.paper} elevation={3}>
                            <CardHeader title="Contributions"></CardHeader>
                            <CardContent>
                                <Typography sx={{paddingTop: 2}} variant="subtitle1">Create and submit your own <Typography sx={{display: "inline"}} variant="subtitle1" color="primary">trivia</Typography> questions and the community can review and rate to be approved.</Typography>
                            </CardContent>
                            <CardActions style={(activeContributions > 0) ? {justifyContent: "space-between"} : {justifyContent: "end"}}>
                                {(activeContributions > 0) ? <Badge badgeContent={activeContributions} color="success">
                                    <Button variant="outlined" onClick={handleReview}>Review</Button>
                                </Badge> : null}
                                <Button variant="contained" onClick={handleContribute}>Create</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                    {/* <Grid item lg={4} md={6} xs={12}>
                        <Card elevation={3}>
                            <CardContent>
                                <Typography>Ads Go Here</Typography>
                            </CardContent>
                        </Card>
                    </Grid> */}
                </Grid>
            </Container>
        </motion.div>
    )
};