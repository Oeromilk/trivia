import React from 'react';
import { useHistory } from "react-router-dom";

import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { auth } from './firebase/firebaseConfig';

const forgotStyles = makeStyles((theme) => ({
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
      heading: {
        marginBottom: theme.spacing(6)
      },
      form: {
        width: '100%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
      },
      submit: {
        margin: theme.spacing(3, 0, 2),
      },
}))

export default function ForgotPassword(){
    const history = useHistory();
    const [email, setEmail] = React.useState('');
    const classes = forgotStyles();

    function handleEmail(event){
        setEmail(event.target.value)
    }
    function handleRequest(event){
        event.preventDefault();
        auth.sendPasswordResetEmail(email).then(function() {
            history.push("/sign-in");
        }).catch(function(error) {
            console.log(error);
        });
    }
    return (
        <React.Fragment>
            <Container component="main" maxWidth="xs">
                <div className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <LockOutlinedIcon />
                    </Avatar>
                    <Typography className={classes.heading} component="h1" variant="h5">
                        Forgot Password
                    </Typography>
                    <form className={classes.form} noValidate>
                        <InputLabel htmlFor="email">Verify Email</InputLabel>
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
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            className={classes.submit}
                            onClick={handleRequest}
                        >
                            Request New Password
                        </Button>
                    </form>
                </div>
            </Container>
        </React.Fragment>
        
    )
};