import React, { useEffect, useState } from 'react';
import { db } from './firebase/firebaseConfig';
import AvatarContainer from './Avatar';
import { doc, getDoc, getDocs, query, where, collection, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { Grid, Typography, Avatar, Button, Fab, Drawer, TextField, TextareaAutosize, CircularProgress } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme) => ({
    containerSize: {
        margin: '0 auto',
        [theme.breakpoints.down('md')]: {
            maxWidth: '95%'
        },
        [theme.breakpoints.between('md', 'lg')]: {
            maxWidth: '75%'
        },
        [theme.breakpoints.up('lg')]: {
            maxWidth: '50%'
        }
    },
    drawerStyle: {
        borderTopLeftRadius: theme.spacing(2),
        borderTopRightRadius: theme.spacing(2)
    }
}))

export default function FriendsView(props){
    const classes = useStyles();
    const [userInfo, setUserInfo] = useState(null);
    const [isFriendRequests, setIsFriendRequests] = useState(false);
    const [activeRequests, setActiveRequests] = useState(null);
    const [friends, setFriends] = useState(null);
    const [isDrawer, setIsDrawer] = useState(false);
    const [messageCharacterCount, setMessageCharacterCount] = useState(0);
    const [requestMessage, setRequestMessage] = useState('');
    const [requsetUsername, setRequestUsername] = useState('');
    const [isRequestSending, setIsRequestSending] = useState(false);

    useEffect(() => {
        getUserInfo();
    }, [])

    useEffect(() => {
        if(userInfo !== null){
            setFriends(userInfo.friendsList);
            if(userInfo.friendRequests.length >= 1){
                setIsFriendRequests(true);
                setActiveRequests(userInfo.friendRequests);
            }
            if(userInfo.friendRequests.length < 1){
                setIsFriendRequests(false);
                setActiveRequests(null);
            }
        }
    }, [userInfo])

    async function getUserInfo(){
        const userRef = doc(db, "users", props.currentUser.uid);
        const userSnap = await getDoc(userRef);
        if(userSnap.exists()){
            setUserInfo(userSnap.data())
        }
    }

    async function updateFriendsList(request){
        const userRef = doc(db, "users", props.currentUser.uid);
        await updateDoc(userRef, {
            friendsList: arrayUnion({avatar: request.avatar, username: request.username}),
            friendRequests: arrayRemove(request)
        }).then(function(){
            console.log("Approved.")
            getUserInfo();
        })
    }

    async function removeRequest(request){
        console.log("Request info: ", request)
        const userRef = doc(db, "users", props.currentUser.uid);
        await updateDoc(userRef, {
            friendRequests: arrayRemove(request)
        }).then(function(){
            console.log("Denied.")
            getUserInfo();
        })
    }

    async function updateUsersRequests(userId, request){
        const userRef = doc(db, "users", userId);
        await updateDoc(userRef, {
            friendRequests: arrayUnion(request)
        }).then(function(){
            setIsRequestSending(false);
            setRequestMessage('');
            setRequestUsername('');
            setIsDrawer(false);
            console.log("sending requset")
        })
    }

    async function checkForUsername(requestObj){
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", requestObj.username));
        const querySnap = await getDocs(q);
        querySnap.forEach((doc) => {
            if(doc.exists()){
                updateUsersRequests(doc.id, requestObj);
            } else {
                console.log('username doesnt exist')
            }
        })
    }

    function approveRequest(data){
        updateFriendsList(data);
    }

    function denyRequest(data){
        removeRequest(data);
    }

    function openRequest(){
        setIsDrawer(true);
    }

    function closeRequest(){
        setIsDrawer(false);
    }

    function updateRequestUsername(event){
        setRequestUsername(event.target.value);
    }

    function updateRequestMessage(event){
        let messageLength = event.target.value.length;
        setMessageCharacterCount(messageLength);
        if(messageLength >= 200){
            return;
        }
        setRequestMessage(event.target.value);
    }

    function sendRequest(){
        setIsRequestSending(true);
        let requset = {
            avatar: userInfo.avatar,
            date: Date.now().toString(),
            message: requestMessage,
            username: requsetUsername
        }
        checkForUsername(requset);
    }
    
    return (
        <React.Fragment>
            <Grid className={classes.containerSize} sx={{padding: 3}} container spacing={3}>
                <Grid item xs={12}>
                    <Typography variant="h3">Your Friends</Typography>
                </Grid>
                {friends !== null ? friends.map((friend) => {
                    return (
                        <Grid key={friend.username} item xs={12}>
                            <Grid container>
                                <Grid item xs={2}>
                                    <Avatar sx={{width: 48, height: 48}}><AvatarContainer avatar={friend.avatar.toLowerCase()}/></Avatar>
                                </Grid>
                                <Grid item xs={10}>
                                    <Typography>{friend.username}</Typography>
                                </Grid>
                            </Grid>
                        </Grid>
                    )
                }) : null}
                {isFriendRequests !== false ? 
                <Grid sx={{marginLeft: 1}} item xs={12}>
                    <Grid container spacing={3}>
                        <Grid sx={{paddingTop: 2, paddingBottom: 2}} item xs={12}>
                            <Typography variant="h4">Requests</Typography>
                        </Grid>
                        {activeRequests !== null ? activeRequests.map((request) => {
                            let date = new Date(Number(request.date));
                            
                            return (
                                <Grid key={request.username} item xs={12}>
                                    <Grid sx={{boxShadow: 3, maxWidth: 550, borderRadius: 3, backgroundColor: '#363636'}} container spacing={2}>
                                        <Grid item xs={2}>
                                            <Avatar sx={{width: 48, height: 48}}><AvatarContainer avatar={request.avatar.toLowerCase()}/></Avatar>
                                        </Grid>
                                        <Grid item xs={10}>
                                            <Typography sx={{fontSize: 36, fontWieght: 800}}>{request.username}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body1">{request.message}</Typography>
                                        </Grid>
                                        <Grid sx={{display: 'flex'}} item xs={6}>
                                            <Typography sx={{display: 'flex', alignItems: 'center', color: "#9aa0a6"}} variant="caption">{date.toLocaleString()}</Typography>
                                        </Grid>
                                        <Grid sx={{display: 'flex', paddingBottom: 2, paddingRight: 2, justifyContent: 'flex-end'}} item xs={6}>
                                            <Button color="success" onClick={() => approveRequest(request)}>Approve</Button>
                                            <Button color="error" onClick={() => denyRequest(request)}>Deny</Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            )
                        }) : null}
                    </Grid>
                </Grid> : null}
            </Grid>
           <Fab sx={{position: 'absolute', bottom: 12, right: 12}} color="secondary" variant="extended" onClick={openRequest}>New Friend Request</Fab>
           <Drawer className={classes.drawerStyle} anchor="bottom" open={isDrawer} onClose={closeRequest}>
               <Grid sx={{padding: 3}}  container rowSpacing={3}>
                   <Grid item xs={3}>
                       <Typography>User Name:</Typography>
                   </Grid>
                   <Grid item xs={9}>
                       <TextField fullWidth value={requestMessage.username} onChange={updateRequestUsername} />
                   </Grid>
                   <Grid item xs={3}>
                       <Typography>Message:</Typography>
                   </Grid>
                   <Grid item xs={9}>
                        <TextareaAutosize value={requestMessage.message} onChange={updateRequestMessage} style={{width: '100%'}} minRows={5} placeholder="Message to friend..." />
                   </Grid>
                   <Grid item xs={11}></Grid>
                   <Grid item xs={1}>
                       <Typography variant="subtitle2">{messageCharacterCount}/200</Typography>
                   </Grid>
                   <Grid item xs={8}></Grid>
                   <Grid sx={{display: 'flex', justifyContent: 'flex-end'}} item xs={4}>
                       <Button variant="outlined" color="secondary" size="large" onClick={sendRequest}>
                           {isRequestSending ? <CircularProgress color="secondary" /> : "Send Request"}
                        </Button>
                   </Grid>
               </Grid>
           </Drawer>
        </React.Fragment>
    )
}