import React, { useEffect } from 'react';
import { auth } from './firebase/firebaseConfig';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useHistory } from "react-router-dom";

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import FormHelperText from '@mui/material/FormHelperText';
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
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignUp() {
    const history = useHistory();
    const classes = useStyles();
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [confirmPassword, setConfirmPassword] = React.useState('');
    const [validPassword, setValidPassword] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');
    const [passwordLength, setPasswordLength] = React.useState('');

    useEffect(() => {
        validatePassword();
    }, [confirmPassword, password])

    function handleEmail(event){
        setEmail(event.target.value);
    }

    function handlePassword(event){
        setPassword(event.target.value);
    }

    function handleConfrimPassword(event){
        setConfirmPassword(event.target.value);
    }

    function handleSignUp(event){
        event.preventDefault();
        createUserWithEmailAndPassword(auth, email, password).then((userCred) => {
            history.push("/profile");
        })
    }
    
    function validatePassword(){
        if(password !== '' && password === confirmPassword){
            setValidPassword(true);
        }

        if(email !== '' && password === confirmPassword){
            setErrorMessage("Passwords match!");
        } else {
            setErrorMessage("Passwords must match!");
        }

        if(password.length !== 6 && confirmPassword.length !== 6){
            setPasswordLength('Password must be at lest 6 characters!')
        } else {
            setPasswordLength('Valid Password!')
        }
    }

  return (
      <Container component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper}>
              <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
              Sign up
              </Typography>
              <form className={classes.form} >
              <Grid container spacing={2}>
                  <Grid item xs={12}>
                      <InputLabel htmlFor="email">Email</InputLabel>
                      <Input
                          required
                          fullWidth
                          id="email"
                          name="email"
                          autoComplete="email"
                          value={email}
                          onChange={handleEmail}
                      />
                  </Grid>
                  <Grid item xs={12}>
                      <InputLabel htmlFor="password">Password</InputLabel>
                      <Input
                          required
                          fullWidth
                          name="password"
                          type="password"
                          id="password"
                          autoComplete="current-password"
                          value={password}
                          onChange={handlePassword}
                      />
                  </Grid>
                  <Grid item xs={12}>
                      <InputLabel htmlFor="confirmPassword">Confirm Password</InputLabel>
                      <Input
                          variant="outlined"
                          required
                          fullWidth
                          name="confirmPassword"
                          type="password"
                          id="confirmPassword"
                          autoComplete="current-password"
                          value={confirmPassword}
                          onChange={handleConfrimPassword}
                      />
                  </Grid>
                  <Grid item xs={12}>
                      <FormHelperText error={!validPassword}>{errorMessage}</FormHelperText>
                  </Grid>
                  <Grid item xs={12}>
                      <FormHelperText error={!validPassword}>{passwordLength}</FormHelperText>
                  </Grid>
              </Grid>
              <Button
                  disabled={!validPassword}
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  onClick={handleSignUp}
              >
                  Sign Up
              </Button>
              <Grid container justifyContent="flex-end">
                  <Grid item>
                  <Link href="/sign-in" variant="body2">
                      Already have an account? Sign in
                  </Link>
                  </Grid>
              </Grid>
              </form>
          </div>
      </Container>
  );
}