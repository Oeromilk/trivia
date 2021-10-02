import React, { useEffect } from 'react';
import { db, auth } from './firebase/firebaseConfig';
import { doc, getDoc } from "firebase/firestore";
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
    paper: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        width: '100%',
        padding: theme.spacing(1)
    }
}))

function FriendsList(){
    const [friends, setFriends] = React.useState(['id1', 'id2', 'id3'])

    const friendsList = friends.map((friend)=> {
        return <ListItem key={friend}>{friend}</ListItem>;
    })

    useEffect(() => {
        getUserFriends();
        // const usersRef = fireStore.collection('users');
        // if(user !== null){
        //     usersRef.doc(user.uid).get().then((doc) => {
        //         if(doc.exists){
        //             setFriends(doc.data().friendsList)
        //         }
        //     })
        // }
    }, [])

    async function getUserFriends(){
        const user = auth.currentUser;
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if(userSnap.exists()){
            setFriends(userSnap.data().friendsList);
        }
    }

    return (
        <List>{friendsList}</List>
    )
}

export default function Dashboard(){
    const history = useHistory();
    const classes = useStyles();

    function handleNewGame(event){
        event.preventDefault();
        history.push("/game");
    }
    return (
        <React.Fragment>
            <Container className={classes.root}>
                <Grid container spacing={3} className={classes.grid}>
                    <Grid item xs={12} >
                        <Typography variant="h3">Dashboard</Typography>
                    </Grid>
                    <Grid item lg={4} sm={5} xs={12} className={classes.card}>
                        <Card className={classes.paper} elevation={3}>
                            <CardContent>
                                <Typography variant="h5" color="primary">Ready to test your knowledge?</Typography>
                            </CardContent>
                            <CardActions style={{justifyContent: "end"}}>
                                <Button color="secondary" variant="contained" onClick={handleNewGame}>New Game</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item lg={4} sm={7} xs={12} className={classes.card}>
                        <Card className={classes.paper} elevation={3}>
                            <CardContent>
                                <Typography variant="h6">Friends</Typography>
                                <FriendsList />
                            </CardContent>
                            <CardActions style={{justifyContent: "end"}}>
                                <Button color="secondary" variant="outlined" className={classes.cardAction}>See All</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item lg={4} sm={12} xs={12} className={classes.card}>
                        <Card className={classes.paper} elevation={3}>
                            <CardContent>
                                <Typography variant="h6">Achievments</Typography>
                                <List>
                                    <ListItem>Acievment Title</ListItem>
                                </List>
                            </CardContent>
                            <CardActions style={{justifyContent: "end"}}>
                                <Button color="secondary" variant="outlined" className={classes.cardAction}>See All</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </React.Fragment>
    )
};