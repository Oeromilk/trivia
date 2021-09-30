import React, { useEffect, useState } from 'react';
import AvatarContainer from './Avatar';
import { auth, fireStore } from './firebase/firebaseConfig';
import { useHistory } from "react-router-dom";
import { makeStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';

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
        var usersRef = fireStore.collection('users');
        usersRef.where("username", "==", username).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                if(doc.exists){
                    setUsernameHelperText("Username is taken, please select another.")
                    setIsValid(true)
                }
            })
        })

        if(username !== ''){
            setUsernameHelperText("Username is available!")
            setIsValid(false)
        }

    }, [username])

    function handleUsername(event){
        setUsername(event.target.value)
    }

    function handleAvatar(event){
        setAvatar(event.target.value)
    }

    function handleUserInfo(event){
        event.preventDefault()
        fireStore.collection("users").doc(props.user.uid).set({
            username: username,
            avatar: avatar,
            achievementPoints: 0,
            friendsList: [],
            questionsAnswered: []
        }).then(() => {
            history.push("/");
            console.log("Success");
        }).catch((error) => {
            console.error("Error Writing Document: ", error)
        })
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
    const [userInfo, setUserInfo] = useState(null);
    const [avatar, setAvatar] = React.useState('Andy');

    useEffect(() => {
        fireStore.collection("users").doc(props.user.uid).get().then((doc) => {
            if(doc.exists){
                setUserInfo(doc.data())
            }
        })
    }, [])

    function handleAvatar(event){
        setAvatar(event.target.value)
    }

    function handleUpdate(event){
        event.preventDefault();
        if(avatar !== ''){
            if(avatar !== userInfo.avatar){
                fireStore.collection("users").doc(props.user.uid).update({
                    avatar: avatar
                }).then(() => {
                    console.log("Document successfully updated!");
                    history.push("/")
                }).catch((error) => {
                    // The document probably doesn't exist.
                    console.error("Error updating document: ", error);
                })
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
        auth.onAuthStateChanged((user) => {
            if(user !== null){
                setCurrentUser(user);
                var userRef = fireStore.collection("users").doc(user.uid);

                userRef.get().then((doc) => {
                    if(doc.exists){
                        setProfileExists(true)
                    } else {
                        setProfileExists(false)
                    }
                })
            } else {
                setCurrentUser(null)
            }
          })
        
          return () => {

          }
    }, [])

    return (
        <React.Fragment>
            <CssBaseline />
            <Container maxWidth="xs">
                {((profileExists !== false) ? <UpdateProfile user={currentUser} /> : <CreateProfile user={currentUser}/>)}
            </Container>
        </React.Fragment>
    )
};