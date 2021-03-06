import React from 'react';
import { auth, analytics } from './firebase/firebaseConfig';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { logEvent } from "firebase/analytics";
import { useHistory } from "react-router-dom";
import { motion } from 'framer-motion/dist/framer-motion';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import Container from '@mui/material/Container';

const useStyles = makeStyles((theme) => ({
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(1),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
  input: {
      marginBottom: theme.spacing(3)
  },
  forgotPassword: {
      cursor: 'pointer'
  }
}));

export default function SignIn() {
  let history = useHistory();
  const classes = useStyles();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

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

  function handleEmail(event){
    setEmail(event.target.value);
  }

  function handlePassword(event){
    setPassword(event.target.value);
  }

  function handleSignIn(event){
    event.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        if(userCredential){
          logEvent(analytics, 'login', { email: "email"});
          history.push("/");
        }
      });
  }

  function handleForgotPassword(event){
    event.preventDefault();
    history.push("/forgot-password");
  }

  function handleSignInWithGoogle(){
    var provider = new GoogleAuthProvider();
    
    signInWithPopup(auth, provider)
      .then((result) => {
        if(result.user){
          logEvent(analytics, 'login', { email: "googleAuthProvider"});
          history.push("/");
        }
      }).catch((error) => {
        console.log(error)
      });
  }

  return (
    <motion.div variants={containerVariants} initial="initial" animate="animate" exit="exit">
      <Container component="main" maxWidth="xs">
        <div className={classes.paper}>
          <Avatar className={classes.avatar}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          <form className={classes.form} noValidate>
              <InputLabel htmlFor="email">Email</InputLabel>
              <Input
                  className={classes.input}
                  required
                  fullWidth
                  id="email"
                  name="email"
                  autoComplete="email"
                  value={email}
                  onChange={handleEmail}
              />
              <InputLabel htmlFor="password">Password</InputLabel>
                  <Input
                      className={classes.input}
                      required
                      fullWidth
                      name="password"
                      type="password"
                      id="password"
                      autoComplete="current-password"
                      value={password}
                      onChange={handlePassword}
                  />
            <Button
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={handleSignIn}
            >
              Sign In
            </Button>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              className={classes.submit}
              onClick={handleSignInWithGoogle}
            >
              Sign In With Google
            </Button>
            <Grid container>
              <Grid item xs>
                <Typography className={classes.forgotPassword} variant="body2">
                    <Link onClick={handleForgotPassword}>Forgot password?</Link>
                </Typography>
              </Grid>
            </Grid>
          </form>
        </div>
      </Container>
    </motion.div>
  );
}