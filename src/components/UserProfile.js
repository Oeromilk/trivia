import React, { useEffect, useState } from 'react';
import AvatarContainer from './Avatar';
import { db, auth, analytics } from './firebase/firebaseConfig';
import { onAuthStateChanged, sendEmailVerification } from '@firebase/auth';
import { logEvent } from "firebase/analytics";
import { doc, getDoc, getDocs, setDoc, updateDoc, collection, query, where } from '@firebase/firestore';
import { useHistory } from "react-router-dom";
import makeStyles from '@mui/styles/makeStyles';
import { Avatar, Container, CssBaseline, Button, Input, InputLabel, Grid, Typography, FormHelperText, FormControl, Select, MenuItem, Stack } from '@mui/material';

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

function Verify(){
    const classes = createProfileStyles();
    const history = useHistory();

    const handleVerify = () => {
        sendEmailVerification(auth.currentUser).then(() => {
            history.push("/");
        })
    }

    return (
        <div className={classes.root}>
            <Typography variant="h3" gutterBottom>Verify your email address.</Typography>
            <Typography gutterBottom>Didn't receive a verification email? Click below to send a new one.</Typography>
            <Button sx={{marginTop: 4}} variant="outlined" onClick={handleVerify}>Send Verification Email</Button>
        </div>
    )
}

function CreateProfile(props){
    const user = auth.currentUser;
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
    const [verified, setVerified] = React.useState(false);
    const debouncedSearchUsername = useDebounce(username, 500);

    useEffect(() => {
        if(!user){
            history.push('/sign-in');
        } else {
            if(user.emailVerified){
                setVerified(true);
            } else {
                setVerified(false);
            }
        }
    }, [])

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
        await setDoc(doc(db, "users", props.user.uid), {
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
            {(verified) ? 
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
            : <Verify />}
        </div>
    )
}

function UpdateProfile(props){
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
    const userRef = doc(db, "users", props.user.uid);
    const [userInfo, setUserInfo] = useState(null);
    const [avatar, setAvatar] = React.useState('Andy');

    useEffect(() => {
        getUserInfo();
    }, [])

    async function getUserInfo(){
        const userSnap = await getDoc(userRef);
        if(userSnap.exists()){
            setUserInfo(userSnap.data());
        }
    }

    async function updateAvatar(){
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
        if(avatar !== ''){
            if(avatar !== userInfo.avatar){
                updateAvatar();
            } else {
                console.log(`Selected avatar: ${avatar} matches current avatar: ${userInfo.avatar}`)
            }
        }
    }

    return (
        <div className={classes.root}>
            <Typography gutterBottom={true} align="center" variant="h2">Update Profile</Typography>
            <Avatar className={classes.updateAvatar}>
                {userInfo != null ? <AvatarContainer avatar={userInfo.avatar.toLowerCase()} /> : null}
            </Avatar>
            <form className={classes.form}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h5" align="center">Username: {userInfo != null ? userInfo.username : "loading"}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h5" align="center">Avatar: {userInfo != null ? userInfo.avatar : "loading"}</Typography>
                    </Grid>
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
        </div>
    )
}

export default function UserProfile(props){
    const [profileExists, setProfileExists] = React.useState(false);
    const [currentUser, setCurrentUser] = React.useState(null);

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
        } else {
            setProfileExists(false);
        }
    }

    return (
        <React.Fragment>
            <CssBaseline />
            <Container maxWidth="xs">
                {((profileExists !== false) ? <UpdateProfile user={currentUser} /> : <CreateProfile user={currentUser}/>)}
            </Container>
        </React.Fragment>
    )
};