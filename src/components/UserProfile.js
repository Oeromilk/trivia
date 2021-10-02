import React, { useEffect, useState } from 'react';
import AvatarContainer from './Avatar';
import { db, auth } from './firebase/firebaseConfig';
import { onAuthStateChanged } from '@firebase/auth';
import { doc, getDoc, getDocs, updateDoc, collection, query, where } from '@firebase/firestore';
import { useHistory } from "react-router-dom";
import makeStyles from '@mui/styles/makeStyles';
import Avatar from '@mui/material/Avatar';
import Container from '@mui/material/Container';
import CssBaseline from '@mui/material/CssBaseline';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

const createProfileStyles = makeStyles((theme) => ({
    root: {
        marginTop: theme.spacing(6),
        marginBottom: theme.spacing(6),
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
        height: 64
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
    ]
    const history = useHistory();
    const [username, setUsername] = React.useState('');
    const [usernameHelperText, setUsernameHelperText] = React.useState('');
    const [isValid, setIsValid] = React.useState(true);
    const [avatar, setAvatar] = React.useState('Michael');

    useEffect(() => {
        getUsers()

    }, [username])

    async function getUsers(){
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", username));
        const querySnap = await getDocs(q);
        querySnap.forEach((doc) => {
            if(doc.exists()){
                setUsernameHelperText("Username is taken, please select another.");
                setIsValid(true);
            }
        })
        if(username !== ""){
            setUsernameHelperText("Username is available!")
            setIsValid(false)
        }
    }

    async function updateUser(){
        const userRef = doc(db, "users", props.user.uid);
        await updateDoc(userRef, {
            username: username,
            avatar: avatar,
            achievementPoints: 0,
            friendsList: [],
            questionsAnswered: []
        }).then(() => {
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
            <Avatar className={classes.avatar}>
                <AvatarContainer avatar={avatar.toLowerCase()} />
            </Avatar>
            <Typography variant="h2">Create Profile</Typography>
            <form className={classes.form}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <InputLabel color="primary" htmlFor="username">Choose a Username:</InputLabel>
                        <Input required fullWidth color="primary" name="username" value={username} onChange={handleUsername} />
                        <FormHelperText error={isValid}>{usernameHelperText}</FormHelperText>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h5" align="center">{avatar}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Select an Avatar:</FormLabel>
                            <RadioGroup aria-label="Avatar" name="avatar" value={avatar} onChange={handleAvatar}>
                                {
                                    avatars.map((avatar) => {
                                        return (
                                            <FormControlLabel key={avatar} value={avatar} control={<Radio />} label={avatar} />
                                        )
                                    })
                                }
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                </Grid>
                <Button disabled={isValid} fullWidth variant="contained" color="primary" className={classes.createProfile} onClick={handleUserInfo}>Create Profile</Button>
            </form>
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
            <Avatar className={classes.updateAvatar}>
                {userInfo != null ? <AvatarContainer avatar={userInfo.avatar.toLowerCase()} /> : null}
            </Avatar>
            <Typography variant="h2">Update Profile</Typography>
            <form className={classes.form}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <Typography variant="h5" align="center">Username: {userInfo != null ? userInfo.username : "loading"}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="h5" align="center">Avatar: {userInfo != null ? userInfo.avatar : "loading"}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography variant="subtitle1">Selected Avatar</Typography>
                        <Avatar style={{width: 48, height: 48}} >
                            <AvatarContainer avatar={avatar.toLowerCase()} />
                        </Avatar> 
                    </Grid>
                    <Grid item xs={12}>
                        <FormControl component="fieldset">
                            <FormLabel component="legend">Select an Avatar:</FormLabel>
                            <RadioGroup aria-label="Avatar" name="avatar" value={avatar} onChange={handleAvatar}>
                                {
                                    avatars.map((avatar) => {
                                        return (
                                            <FormControlLabel key={avatar} value={avatar} control={<Radio />} label={avatar} />
                                        )
                                    })
                                }
                            </RadioGroup>
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