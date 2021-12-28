import React, { useState } from 'react';
import { auth, analytics, db } from './firebase/firebaseConfig';
import { collection, query, where, getDocs } from "firebase/firestore";
import { logEvent } from "firebase/analytics";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useHistory } from "react-router-dom";
import { Container, Stack, TextField, Button, Typography, CircularProgress, Alert } from '@mui/material';

export default function SignUp() {
    const history = useHistory();
    const [code, setCode] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isTrueCode, setIsTrueCode] = useState(false);

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
            history.push("/");
          }
        }).catch((error) => {
          console.log(error)
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

  return (
      <Container sx={{marginTop: 15}} component="main" maxWidth="xs">
        <Stack direction="column" justifyContent="center" alignItems="center" spacing={3}>
            <Typography sx={{fontSize: '2em'}} textAlign="center">Have a code? Use below to sign up!</Typography>
            <TextField fullWidth id="sign-up-code" label="Sign Up Code" variant="outlined" value={code} onChange={handleCode} />
            <Button size="large" disabled={isSearching} fullWidth variant="contained" onClick={handleCheckCode}>
                {isSearching ? <CircularProgress /> : 'Check Code'}
            </Button>
            {isTrueCode ? <Alert severity="error">Oops, {code} is not valid. Either your entered incorrectly or that code has been used.</Alert> : null}
        </Stack>
      </Container>
  );
}