import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';

// const authStyles = makeStyles((theme) => ({
//     root: {
//         margin: theme.spacing(1),
//         [theme.breakpoints.down('sm')]: {
//             width: '90%'
//         },
//         [theme.breakpoints.up('md')]: {
//             width: '50%'
//         },
//     }
// }))

// function SignUp(){
//     const classes = authStyles();
//     const [userInfo, setUserInfo] = React.useState({
//             email: '', 
//             password: '',
//             confrimPassword: ''
//         });
//     const [validInfo, setValidInfo] = React.useState(false);

//     function handleChange(event){
//         setUserInfo({[event.target.name]: event.target.value});
//         if(event.target.name === 'confirmPassword'){
//             if(userInfo.password === userInfo.confrimPassword){
//                 setValidInfo(true);
//             }
//         }
//     }

//     function handleSignUp(event){
//         console.log(userInfo);
//     }

//     return (
//         <form className={classes.root}>
//             <FormControl variant="outlined">
//                 <InputLabel htmlFor="email">Email</InputLabel>
//                 <Input id="email" name="email" value={userInfo.email} onChange={handleChange}/>
//             </FormControl>
//             <FormControl>
//                 <InputLabel htmlFor="password">Password</InputLabel>
//                 <Input id="password" name="password" value={userInfo.password} onChange={handleChange}/>
//             </FormControl>
//             <FormControl>
//                 <InputLabel htmlFor="confirmPassword">Confrim Password</InputLabel>
//                 <Input id="confirmPassword" name="confirmPassword" value={userInfo.confirmPassword} onChange={handleChange}/>
//             </FormControl>
//             <Button onClick={handleSignUp} disabled={validInfo}>Sign Up</Button>
//         </form>
//     )
// }

export default function Auth(){
    
    return (
        <React.Fragment>
            <CssBaseline />
            <Container>
                <Grid container>
                    
                </Grid>
            </Container>
        </React.Fragment>
    )
};