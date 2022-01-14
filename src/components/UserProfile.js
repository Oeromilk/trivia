import React, { useEffect, useState } from 'react';
import AvatarContainer from './Avatar';
import generateCode from '../utilites/generateCode';
import { db, auth, analytics } from './firebase/firebaseConfig';
import { onAuthStateChanged } from '@firebase/auth';
import { logEvent } from "firebase/analytics";
import { motion } from 'framer-motion/dist/framer-motion';
import { doc, getDoc, addDoc, getDocs, setDoc, updateDoc, collection, query, where, increment, Timestamp } from '@firebase/firestore';
import { useHistory } from "react-router-dom";
import makeStyles from '@mui/styles/makeStyles';
import { Avatar, Container, Button, Input, InputLabel, Grid, Typography, FormHelperText, CircularProgress, TextField, FormControl, Select, MenuItem, Stack, Paper, Tooltip, Collapse, Divider } from '@mui/material';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

function useDebounce(value, delay) {
    // State and setters for debounced value
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(
      () => {
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
      },
      [value, delay] // Only re-call effect if value or delay changes
    );
    return debouncedValue;
  }

const createProfileStyles = makeStyles((theme) => ({
    root: {
        marginTop: theme.spacing(12),
        marginBottom: theme.spacing(12),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        background: theme.palette.secondary.main,
    },
    createAvatar: {
        width: 64,
        height: 64,
        margin: '1em auto 1em auto'
    },
    updateAvatar: {
        width: 64,
        height: 64
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(3)
    },
    createProfile: {
        margin: theme.spacing(3, 0, 2)
    },
    avatarPicker: {
        textAlign: 'center'
    }
}));

function CreateProfile(props){
    const classes = createProfileStyles();
    const avatars = [
        "Andy",
        "Angela",
        "Creed",
        "Dwight",
        "Jim",
        "Kelly",
        "Kevin",
        "Meredith",
        "Michael",
        "Oscar",
        "Pam",
        "Phyllis",
        "Ryan",
        "Stanley",
        "Toby"
    ];
    const history = useHistory();
    const [username, setUsername] = React.useState('');
    const [usernameHelperText, setUsernameHelperText] = React.useState('');
    const [isValid, setIsValid] = React.useState(true);
    const [avatar, setAvatar] = React.useState('Michael');
    const debouncedSearchUsername = useDebounce(username, 500);

    useEffect(() => {
        if(debouncedSearchUsername){
            getUsers(debouncedSearchUsername);
        }
    }, [debouncedSearchUsername])

    async function getUsers(querySearch){
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", querySearch));
        const querySnap = await getDocs(q);
        if(querySnap.size === 0){
            setUsernameHelperText("Username is available!");
            setIsValid(false);
        } else {
            setUsernameHelperText("Username is taken, please select another.");
            setIsValid(true);
        }
    }

    async function updateUser(){
        let temp = new Date();
        temp.setDate(temp.getDate() - 3);
        await setDoc(doc(db, "users", localStorage.getItem("uid")), {
            username: username,
            avatar: avatar,
            achievementPoints: 0,
            dailyCurrentStreak: 0,
            dailyHasPlayed: false,
            dailyLastPlayed: Timestamp.fromDate(temp),
            dailyMaxStreak: 0,
            dailyTimesPlayed: 0,
            dailyTimesWon: 0,
            dailyWinPercentage: 0
        }).then(function(){
            logEvent(analytics, 'profile_created');
            history.push("/");
        })
    }

    function handleUsername(event){
        setUsername(event.target.value);
    }

    function handleAvatar(event){
        setAvatar(event.target.value);
    }

    function handleUserInfo(event){
        event.preventDefault();
        updateUser();
    }

    return (
        <div className={classes.root}>
            <React.Fragment>
                <Typography align="center" variant="h2">Create Profile</Typography>
                <form className={classes.form}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <InputLabel color="primary" htmlFor="username">Choose a Username:</InputLabel>
                            <Input required fullWidth color="primary" name="username" value={username} onChange={handleUsername} />
                            <FormHelperText error={isValid}>{usernameHelperText}</FormHelperText>
                        </Grid>
                        <Grid item xs={12}>
                            <Stack direction="column" justifyContent="space-evenly" alignItems="center" spacing={1}>
                                <Typography variant="h5" align="center">{avatar}</Typography>
                                <Avatar className={classes.createAvatar}>
                                    <AvatarContainer avatar={avatar.toLowerCase()} />
                                </Avatar>
                            </Stack>
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel id="avatar-select-label">Choose an Avatar</InputLabel>
                                <Select
                                labelId="avatar-select-label"
                                id="avatar-select"
                                value={avatar}
                                label="Choose an Avatar"
                                onChange={handleAvatar}
                                >
                                    {avatars.map((avatar) => {
                                        return (
                                            <MenuItem key={avatar} value={avatar}>{avatar}</MenuItem>
                                        )
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                    <Button disabled={isValid} fullWidth variant="contained" color="primary" className={classes.createProfile} onClick={handleUserInfo}>Create Profile</Button>
                </form>
            </React.Fragment>
        </div>
    )
}

function UpdateProfile(){
    const classes = createProfileStyles();
    const history = useHistory();
    const avatars = [
        "Andy",
        "Angela",
        "Creed",
        "Dwight",
        "Jim",
        "Kelly",
        "Kevin",
        "Meredith",
        "Michael",
        "Oscar",
        "Pam",
        "Phyllis",
        "Ryan",
        "Stanley",
        "Toby"
    ]
    const [avatar, setAvatar] = React.useState('Andy');

    async function updateAvatar(){
        const userRef = doc(db, "users", localStorage.getItem("uid"));
        await updateDoc(userRef, {
            avatar: avatar
        }).then(() => {
            logEvent(analytics, 'profile_updated');
            history.push("/")
        }).catch((error) => {
            console.error(error);
        })
    }

    function handleAvatar(event){
        setAvatar(event.target.value)
    }

    function handleUpdate(event){
        event.preventDefault();
        updateAvatar();
    }

    return (
        <form className={classes.form}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Stack direction="column" justifyContent="space-evenly" alignItems="center" spacing={1}>
                        <Typography variant="subtitle1">Selected Avatar</Typography>
                        <Avatar style={{width: 48, height: 48}} >
                            <AvatarContainer avatar={avatar.toLowerCase()} />
                        </Avatar>
                    </Stack>
                </Grid>
                <Grid item xs={12}>
                    <FormControl fullWidth>
                        <InputLabel id="avatar-select-label">Choose an Avatar</InputLabel>
                        <Select
                        labelId="avatar-select-label"
                        id="avatar-select"
                        value={avatar}
                        label="Choose an Avatar"
                        onChange={handleAvatar}
                        >
                            {avatars.map((avatar) => {
                                return (
                                    <MenuItem key={avatar} value={avatar}>{avatar}</MenuItem>
                                )
                            })}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>
            <Button fullWidth variant="contained" color="primary" className={classes.createProfile} onClick={handleUpdate}>Update Profile</Button>
        </form>
    )
}

export default function UserProfile(props){
    const classes = createProfileStyles();
    const history = useHistory();
    const [profileExists, setProfileExists] = useState(false);
    const [currentTitle, setCurrentTitle] = useState(null);
    const [titles, setTitles] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [updateAvatar, setUpdateAvatar] = useState(false);
    const [invitesRemaining, setInvitesRemaining] = useState(0);
    const [inviteEmail, setInviteEmail] = useState('');
    const [isCodeSending, setIsCodeSending] = useState(false);

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
        getTitles();
        onAuthStateChanged(auth, (user) => {
            if(user){
                setCurrentUser(user);
                getUser(user);
            } else {
                history.push('/');
                setCurrentUser(null);
            }
        })
        
          return () => {

          }
    }, [])

    async function getUser(u) {
        const userRef = doc(db, "users", u.uid)
        const userSnap = await getDoc(userRef);
        if(userSnap.exists()){
            setProfileExists(true);
            setUserInfo(userSnap.data());
            setCurrentTitle(userSnap.data().title);
            setInvitesRemaining(userSnap.data().invitesRemaining);
        } else {
            setProfileExists(false);
        }
    }

    async function getTitles(){
        const titlesRef = collection(db, `users/${localStorage.getItem("uid")}/titles`);
        const titlesSnap = await getDocs(titlesRef);
        let arr = [];
        titlesSnap.forEach(doc => {
            arr.push(doc.data())
        })
        setTitles(arr);
    }

    async function updateUserTitle(title){
        const userRef = doc(db, "users", localStorage.getItem("uid"));
        await updateDoc(userRef, {
            title: title
        })
    }

    async function setNewInviteCode(newCode){
        await addDoc(collection(db, "signUpCodes"), {code: newCode, inviter: userInfo.username});
        const userRef = doc(db, "users", currentUser.uid)
        setInvitesRemaining(x => x - 1);
        await updateDoc(userRef, {
            invitesRemaining: increment(-1)
        });
    }

    async function sendUserInvite(invite){
        const docRef = await addDoc(collection(db, "mail"), invite);
        if(docRef.id){
            setIsCodeSending(false);
        }
    }

    const handleInviteEmail = (event) => {
        setInviteEmail(event.target.value);
    }

    const handleTitleUpdate = (data) => {
        setCurrentTitle(data.title);
        updateUserTitle(data.title);
    }

    const createInviteCode = () => {
        setIsCodeSending(true);
        var inviteCode = generateCode();

        let invite = {
            to: inviteEmail,
            template: {
                name: "invite",
                data: {
                  inviterEmail: currentUser.email,
                  inviteCode: inviteCode
                }
              }
        }

        setNewInviteCode(inviteCode);
        sendUserInvite(invite);
    }

    return (
        <motion.div variants={containerVariants} initial="initial" animate="animate" exit="exit">
            <Container sx={{marginTop: 15, marginBottom: 15}} maxWidth="sm">
                {profileExists ?
                <React.Fragment>
                    <Stack spacing={4}>
                        <Paper sx={{padding: 3}} variant="outlined">
                            <Stack direction="column" justifyContent="center" alignItems="center" spacing={2}>
                                <Tooltip title="Update Avatar">
                                    <Avatar sx={{cursor: 'pointer'}} className={classes.updateAvatar} onClick={() => setUpdateAvatar(true)}>
                                        {userInfo === null ? 'A' : <AvatarContainer avatar={userInfo.avatar.toLowerCase()} />}
                                    </Avatar>
                                </Tooltip>
                                <Collapse in={updateAvatar}>
                                    <Tooltip title="Cancel Update">
                                        <CancelRoundedIcon sx={{cursor: 'pointer'}} onClick={() => setUpdateAvatar(false)} />
                                    </Tooltip>
                                    <UpdateProfile />
                                </Collapse>
                                <Typography sx={{fontSize: '1.75em', fontWeight: 'bold'}} >{userInfo !== null ? userInfo.username + " " : "loading"}<span>{currentTitle !== null ? currentTitle : "loading"} </span></Typography>
                                <Typography sx={{fontSize: '1.25em'}}>{userInfo !== null ? userInfo.avatar : "loading"}</Typography>
                            </Stack>
                        </Paper>
                        <Paper sx={{padding: 3}} variant="outlined">
                            <Tooltip placement="top-start" title="Titles can be earned for various things like; completing acheivments, being an early user, completing tasks.">
                                <Typography fontSize={'1.5em'}>Titles</Typography>
                            </Tooltip>
                            <Divider sx={{marginTop: 2, marginBottom: 2}} />
                            <Stack direction="column" spacing={3}>
                                {titles !== null ? titles.map((data) => {
                                    return (
                                        <Stack direction="row" justifyContent="space-between" alignItems="center" key={data.title}>
                                            <Typography sx={{fontSize: '1.5em'}}>{data.title}</Typography>
                                            {
                                                currentTitle !== null && currentTitle !== data.title ? 
                                                <Button variant="outlined" onClick={() => handleTitleUpdate(data)}>Make Title</Button> : 
                                                <Typography sx={{fontSize: '1.25em'}} color="secondary">Current Title</Typography>
                                            }
                                        </Stack>
                                    )
                                }) : null}
                            </Stack>
                        </Paper>
                        <Paper sx={{padding: 3}} variant="outlined">
                            <Typography fontSize={'1.5em'}>Your Invites</Typography>
                            <Divider sx={{marginTop: 2, marginBottom: 2}} />
                            {invitesRemaining > 0 ? 
                            <Stack spacing={3}>
                                <Typography sx={{fontSize: '1.5em'}}>Invites Remaing <Typography sx={{display: 'inline', fontSize: '1.5em', fontWeight: 'bold'}} paragraph={false} color="primary">{invitesRemaining}</Typography></Typography>
                                <TextField id="invite-email" label="Email" variant="outlined" helperText="Email of who you want to invite, choose wisely." value={inviteEmail} onChange={handleInviteEmail} />
                                <Button disabled={isCodeSending} size="large" variant="contained" onClick={createInviteCode}>{isCodeSending ? <CircularProgress /> : 'Send Invite'}</Button>
                            </Stack> : null}
                        </Paper>
                    </Stack>
                </React.Fragment>
                : <CreateProfile />}
            </Container>
        </motion.div>
    )
};