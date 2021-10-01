import React from 'react';
import { auth, firebase } from './firebase/firebaseConfig';
import { useHistory } from "react-router-dom";

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
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

  function handleEmail(event){
    setEmail(event.target.value);
  }

  function handlePassword(event){
    setPassword(event.target.value);
  }

  function handleSignIn(event){
    event.preventDefault();
    auth.signInWithEmailAndPassword(email, password);
    history.push("/");
  }

  function handleForgotPassword(event){
    event.preventDefault();
    history.push("/forgot-password");
  }

  function handleSignInWithGoogle(){
    var provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
    .then((result) => {
      if(result.user){
        history.push("/");
      }
    }).catch((error) => {
      console.log(error)
    });
  }

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
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
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
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
            <Grid item>
              <Link href="/sign-up" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
}