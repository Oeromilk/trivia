import React, { useEffect, useState } from 'react';
import AvatarContainer from './Avatar';
import { db, auth, analytics } from './firebase/firebaseConfig';
import { onAuthStateChanged, sendEmailVerification } from '@firebase/auth';
import { logEvent } from "firebase/analytics";
import { doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where } from '@firebase/firestore';
import { useHistory } from "react-router-dom";
import makeStyles from '@mui/styles/makeStyles';
import { Avatar, Container, Button, Input, InputLabel, Grid, Typography, FormHelperText, FormControl, Select, MenuItem, Stack, Paper, Tooltip, Collapse, Divider } from '@mui/material';
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
        await setDoc(doc(db, "users", localStorage.getItem("uid")), {
            username: username,
            avatar: avatar,
            achievementPoints: 0
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
    const [profileExists, setProfileExists] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [updateAvatar, setUpdateAvatar] = useState(false);
    const [invitesRemaining, setInvitesRemaining] = useState(0);

    useEffect(() => {
        onAuthStateChanged(auth, (user) => {
            if(user){
                setCurrentUser(user);
                getUser(user);
            } else {
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
            setInvitesRemaining(userSnap.data().invitesRemaining);
        } else {
            setProfileExists(false);
        }
    }

    const createInviteCode = () => {
        var length = 8;
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
          result += characters.charAt(Math.floor(Math.random() * charactersLength));
       }
       console.log(result)
    }

    return (
        <Container sx={{marginTop: 15}} maxWidth="sm">
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
                            <Typography variant="h5" align="center">Username: {userInfo != null ? userInfo.username : "loading"}</Typography>
                            <Typography variant="h5" align="center">Avatar: {userInfo != null ? userInfo.avatar : "loading"}</Typography>
                        </Stack>
                    </Paper>
                    <Paper sx={{padding: 3}} variant="outlined">
                        <Typography fontSize={'1.5em'}>Your Invites</Typography>
                        <Divider sx={{marginTop: 2, marginBottom: 2}} />
                        {invitesRemaining > 0 ? 
                        <Stack spacing={3}>
                            <Typography sx={{fontSize: '1.5em'}}>Invites Remaing <span>{invitesRemaining}</span></Typography>
                            <Button variant="contained" onClick={createInviteCode}>Create Invite</Button>
                        </Stack> : null}
                    </Paper>
                </Stack>
            </React.Fragment>
            : <CreateProfile />}
        </Container>
    )
};