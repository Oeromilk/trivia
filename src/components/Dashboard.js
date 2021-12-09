import React, { useState, useEffect } from 'react';
import { db } from './firebase/firebaseConfig';
import { doc, getDoc, getDocs, collection } from "firebase/firestore";
import { useHistory } from "react-router-dom";
import makeStyles from '@mui/styles/makeStyles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import AvatarContainer from './Avatar';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';

const useStyles = makeStyles((theme) => ({
    root: {
        marginBottom: theme.spacing(10),
        [theme.breakpoints.up('md')]: {
            maxWidth: '80%'
        },
        [theme.breakpoints.down('md')]: {
            maxWidth: '90%',
            marginBottom: theme.spacing(3)
        }
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

function FriendsList(props){
    const [friends, setFriends] = React.useState([]);

    const friendsList = friends.slice(0,3).map((friend) => {
        return (
        <ListItem key={friend.username}>
            <Grid container>
                <Grid item xs={3}>
                    <Avatar sx={{width: 48, height: 48}}><AvatarContainer avatar={friend.avatar.toLowerCase()} /></Avatar>
                </Grid>
                <Grid item xs={9}>
                    <Typography sx={{fontSize: 32}}>{friend.username}</Typography>
                </Grid>
            </Grid>
        </ListItem>)
    })

    useEffect(() => {
        getUserFriends();
    }, [])

    async function getUserFriends(){
        const uid = localStorage.getItem("uid");
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if(userSnap.exists()){
            setFriends(userSnap.data().friendsList);
        }
    }

    return (
        <List>{friendsList}</List>
    )
}

export default function Dashboard(props){
    const history = useHistory();
    const classes = useStyles();
    const [activeContributions, setActiveContributions] = useState(0);

    useEffect(() => {
        checkContributions();
    }, [])

    async function checkContributions(){
        const contributionsRef = collection(db, "theOfficeTriviaContributions");

        const snapShot = await getDocs(contributionsRef);

        if(snapShot.size > 1){
            setActiveContributions(snapShot.size - 1);
        }
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

    return (
        <React.Fragment>
            <Container className={classes.root}>
                <Grid container spacing={3} className={classes.grid}>
                    <Grid item xs={12} >
                        <Typography variant="h3">Dashboard</Typography>
                    </Grid>
                    <Grid item lg={4} md={5} xs={12} className={classes.card}>
                        <Card className={classes.paper} elevation={3}>
                            <CardContent>
                                <Typography variant="h5" color="primary">Ready to test your knowledge?</Typography>
                            </CardContent>
                            <CardActions style={{justifyContent: "end"}}>
                                <Button color="secondary" variant="contained" onClick={handleNewGame}>New Game</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item lg={4} md={7} xs={12} className={classes.friendCard}>
                        <Card className={classes.paper} elevation={3}>
                            <CardHeader title="Friends">
                            </CardHeader>
                            <CardContent>
                                <FriendsList user={props.user} />
                            </CardContent>
                            <CardActions style={{justifyContent: "end"}}>
                                <Button color="primary" variant="outlined" className={classes.cardAction} onClick={manageFriends}>Manage Friends</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item lg={4} md={12} xs={12} className={classes.card}>
                        <Card className={classes.paper} elevation={3}>
                            <CardContent>
                                <Typography variant="h6">Achievments</Typography>
                                <List>
                                    <ListItem>Acievments Coming Soon</ListItem>
                                </List>
                            </CardContent>
                            <CardActions style={{justifyContent: "end"}}>
                                <Button disabled color="secondary" variant="outlined" className={classes.cardAction}>See All</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item lg={4} md={6} xs={12}>
                        <Card elevation={3}>
                            <CardContent>
                                <Typography>Ads Go Here</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item lg={4} md={6} xs={12} className={classes.card}>
                        <Card sx={{padding: 1}}  elevation={3}>
                            <CardContent>
                                <Typography variant="h6">Contribute</Typography>
                                <Typography sx={{paddingTop: 2}} variant="subtitle1">Submit your own trivia questions and they will get reviewed by other pro users to be approved!</Typography>
                            </CardContent>
                            <CardActions style={(activeContributions > 0) ? {justifyContent: "space-between"} : {justifyContent: "end"}}>
                                {(activeContributions > 0) ? <Badge badgeContent={activeContributions} color="success">
                                    <Button variant="outlined">Review Contributions</Button>
                                </Badge> : null}
                                <Button variant="contained" onClick={handleContribute}>Contribute</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </React.Fragment>
    )
};