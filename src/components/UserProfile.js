import React, { useEffect } from 'react';
import { auth, fireStore } from './firebase/firebaseConfig';
import { useHistory } from "react-router-dom";

import { makeStyles } from '@material-ui/core/styles';
//import IconButton from '@material-ui/core/IconButton';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
//import FaceIcon from '@material-ui/icons/Face';
import Avatar from '@material-ui/core/Avatar';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
//import Paper from '@material-ui/core/Paper';
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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        background: theme.palette.secondary.main,
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
                <AccountCircleIcon />
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
                                <FormControlLabel value="Michael" control={<Radio />} label="Michael" />
                                <FormControlLabel value="Dwight" control={<Radio />} label="Dwight" />
                                <FormControlLabel value="Jim" control={<Radio />} label="Jim" />
                                <FormControlLabel value="Pam" control={<Radio />} label="Pam" />
                            </RadioGroup>
                        </FormControl>
                    </Grid>
                </Grid>
                <Button disabled={isValid} fullWidth variant="contained" color="primary" className={classes.createProfile} onClick={handleUserInfo}>Create Profile</Button>
            </form>
        </div>
    )
}

function UpdateProfile(){
    return (
        <div>Update</div>
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