import React, { useState, useEffect } from 'react';
import { db } from './firebase/firebaseConfig';
import { getDocs, query, orderBy, collection, limit } from '@firebase/firestore';
import { motion } from 'framer-motion/dist/framer-motion';
import AvatarContainer from './Avatar';
import makeStyles from '@mui/styles/makeStyles';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CssBaseline from '@mui/material/CssBaseline';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const leaderboardStyles = makeStyles((theme) => ({
    leaderBoardContainer: {
        marginBottom: theme.spacing(6)
    },
    heading: {
        backgroundColor: '#242424',
        marginTop: theme.spacing(3),
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
        paddingLeft: theme.spacing(3),
        borderRadius: theme.spacing(1)
    },
    item: {
        marginTop: theme.spacing(3)
    },
    userInfo: {
        padding: theme.spacing(2)
    },
    largerFont: {
        fontSize: '1.5em'
    },
    firstPlace: {
        backgroundColor: '#fcba03',
        color: 'black'
    },
    secondPlace: {
        backgroundColor: '#b0b5b5',
        color: 'black'
    },
    thirdPlace: {
        backgroundColor: '#6e3b0b'
    }
}))

export default function LeaderBoard(){
    const classes = leaderboardStyles();
    const [topTenUsers, setTopTenUsers] = useState([]);

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

    const topTenUsersList = topTenUsers.map((user, index) => {
        let bgColor;
        if(index === 0){
            bgColor = classes.firstPlace;
        }
        if(index === 1){
            bgColor = classes.secondPlace;
        }
        if(index === 2){
            bgColor = classes.thirdPlace;
        }
        
        return (
        <Grid item xs={12} key={user.username} className={classes.item}>
            <Paper className={bgColor}>
                <Grid container className={classes.userInfo}>
                    <Grid item xs={2}>
                        <Avatar style={{width: 48, height: 48}}><AvatarContainer avatar={user.avatar.toLowerCase()} /></Avatar>
                    </Grid>
                    <Grid item xs={7} style={{ display: "flex", alignItems: "center"}}>
                        {index < 3 &&
                            <EmojiEventsIcon style={{ fontSize: 36, paddingRight: '0.25em' }}/>
                        }
                        <Typography>{user.username}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                        <Typography align="right" className={classes.largerFont}>{user.achievementPoints}</Typography>
                    </Grid>
                </Grid>
            </Paper>
        </Grid>
        )
    })

    useEffect(() => {
        getUsers();
    }, [])

    async function getUsers(){
        let newList = [];
        const q = query(collection(db, "users"), orderBy("achievementPoints", "desc"), limit(10));
        const querySnap = await getDocs(q);
        querySnap.forEach((doc) => {
            newList.push(doc.data());
        })
        setTopTenUsers(newList);
    }

    return (
        <motion.div variants={containerVariants} initial="initial" animate="animate" exit="exit">
            <CssBaseline />
            <Container maxWidth="md">
                <Grid container className={classes.leaderBoardContainer}>
                    <Grid sx={{boxShadow: 8}} item xs={12} className={classes.heading}>
                        <Typography variant="h3">Leaderboard</Typography>
                    </Grid>
                    {topTenUsersList}
                </Grid>
            </Container>
        </motion.div>
    )
};