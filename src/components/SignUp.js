import React, { useState } from 'react';
import { auth, analytics, db } from './firebase/firebaseConfig';
import { collection, query, where, getDocs } from "firebase/firestore";
import { logEvent } from "firebase/analytics";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useHistory } from "react-router-dom";
import { Container, Stack, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { motion } from 'framer-motion/dist/framer-motion';

export default function SignUp() {
    const history = useHistory();
    const [code, setCode] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isTrueCode, setIsTrueCode] = useState(false);
    const [signUpError, setSignUpError] = useState(null);

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

    async function searchCode(c){
        const querySnapshot = await getDocs(query(collection(db, "signUpCodes"), where("code", "==", c)));
        if(querySnapshot.empty){
            setIsSearching(false);
            setIsTrueCode(true);
        }
        querySnapshot.forEach((doc) => {
            if(doc.id){
                handleSignInWithGoogle();
            }
        });
    }

    const handleSignInWithGoogle = () => {
        const provider = new GoogleAuthProvider();
        
        signInWithPopup(auth, provider)
        .then((result) => {
          if(result.user){
            setIsSearching(false);
            logEvent(analytics, 'login', { email: "googleAuthProvider"});
            history.push("/profile");
          }
        }).catch((error) => {
          setIsSearching(false);
          if(error.code.includes("auth/popup-closed-by-user")){
            setSignUpError(error);
          } else {
            
          }
        });
      }

    const handleCode = (event) => {
        setCode(event.target.value);
    }

    const handleCheckCode = (event) => {
        event.preventDefault();
        setIsSearching(true);
        searchCode(code)
    }

    const handleSignIn = (event) => {
      event.preventDefault();
      history.push('/sign-in');
    }

  return (
    <motion.div variants={containerVariants} initial="initial" animate="animate" exit="exit">
      <Container maxWidth="xs">
        <Stack sx={{minHeight: '100vh', paddingTop: 10}} direction="column" justifyContent="flex-start" alignItems="center" spacing={3}>
          <Typography sx={{fontSize: '2em'}} textAlign="center">Have a code? Use below to sign up!</Typography>
          <TextField fullWidth id="sign-up-code" label="Sign Up Code" variant="outlined" value={code} onChange={handleCode} />
          <Button size="large" disabled={isSearching} fullWidth variant="contained" onClick={handleCheckCode}>
              {isSearching ? <CircularProgress /> : 'Check Code'}
          </Button>
          {isTrueCode ? <Alert severity="error">Oops, {code} is not valid. Either your entered incorrectly or that code has been used.</Alert> : null}
          <Button size="large" variant="text" onClick={handleSignIn}>Already have an account? Sign In</Button>
          {signUpError !== null ? <Typography>Error: {signUpError.code} occured when signing up.</Typography> : null}
        </Stack>
      </Container>
    </motion.div>
  );
}