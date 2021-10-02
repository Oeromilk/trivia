import React from 'react';
import { useHistory } from "react-router-dom";
import { auth } from './firebase/firebaseConfig';
import { sendPasswordResetEmail } from "firebase/auth";
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Input from '@mui/material/Input';
import InputLabel from '@mui/material/InputLabel';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import makeStyles from '@mui/styles/makeStyles';
import Container from '@mui/material/Container';

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
        sendPasswordResetEmail(auth, email).then(() => {
            history.push("/sign-in");
        }).catch((error) => {
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