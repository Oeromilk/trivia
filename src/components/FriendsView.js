import React, { useEffect, useState } from 'react';
import { db } from './firebase/firebaseConfig';
import AvatarContainer from './Avatar';
import { doc, getDoc, getDocs, query, where, collection, Timestamp, addDoc, deleteDoc } from "firebase/firestore";
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
    const uid = localStorage.getItem("uid");
    const [userInfo, setUserInfo] = useState(null);
    const [isFriendRequests, setIsFriendRequests] = useState(false);
    const [activeRequests, setActiveRequests] = useState(null);
    const [friends, setFriends] = useState(null);
    const [isDrawer, setIsDrawer] = useState(false);
    const [messageCharacterCount, setMessageCharacterCount] = useState(0);
    const [requestMessage, setRequestMessage] = useState('');
    const [requestUsername, setRequestUsername] = useState('');
    const [isRequestSending, setIsRequestSending] = useState(false);
    const [usernameValidation, setUsernameValidation] = useState('');

    useEffect(() => {
        getUserInfo();
    }, [])

    useEffect(() => {
        getFriends();
        getFriendRequests();
    }, [userInfo])

    async function getFriendRequests(){
        const requestsPath = `users/${localStorage.getItem("uid")}/friend-requests`;
        const requestsRef = collection(db, requestsPath);
        const snapShot = await getDocs(requestsRef);
        var requests = [];

        if(snapShot.size > 0){
            setIsFriendRequests(true);
            snapShot.forEach(doc => {
                requests.push({id: doc.id, data: doc.data()})
                console.log(doc.data())
            })
            setActiveRequests(requests);
        } else {
            setIsFriendRequests(false);
            setActiveRequests(null);
        }
    }

    async function getFriends(){
        const friendsPath = `users/${uid}/friends`;
        const friendsRef = collection(db, friendsPath);
        const snapShot = await getDocs(friendsRef);
        var friends = [];

        if(snapShot.size === 0){
            return;
        }
        snapShot.forEach(doc => {
            friends.push(doc.data())
        })

        setFriends(friends);
    }

    async function getUserInfo(){
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);
        if(userSnap.exists()){
            setUserInfo(userSnap.data())
        }
    }

    async function updateRequestorsFriendList(request){
        const friendsPath = `users/${request.data.requestorId}/friends`;
        const friendsRef = collection(db, friendsPath);
        await addDoc(friendsRef, {
            avatar: userInfo.avatar,
            username: userInfo.username,
            since: Timestamp.now()
        })
    }

    async function updateFriendsList(request){
        const friendsPath = `users/${uid}/friends`;
        const friendsRef = collection(db, friendsPath);
        const docRef = await addDoc(friendsRef, {
            avatar: request.data.requestorAvatar,
            username: request.data.requestorUsername,
            since: Timestamp.now()
        })

        if(docRef.id){
            updateRequestorsFriendList(request);
            removeRequest(request);
        }
    }

    async function removeRequest(request){
        console.log(request);
        const requestsPath = `users/${uid}/friend-requests`; 
        const requestRef = doc(db, requestsPath, request.id);

        await deleteDoc(requestRef).then(() => {
            getUserInfo();
        })
    }

    async function updateUsersRequests(userId, request){
        const requestsPath = `users/${userId}/friend-requests`;
        const requestsRef = collection(db, requestsPath);
        const docRef = await addDoc(requestsRef, request);

        if(docRef){
            setIsRequestSending(false);
            setRequestMessage('');
            setRequestUsername('');
            setIsDrawer(false);
        }
    }

    async function checkForUsername(requestObj){
        if(userInfo.username === requestUsername){
            setIsRequestSending(false);
            setUsernameValidation("You are always your own bestfried, sorry though, can't send requests to yourself.");
            return;
        }
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("username", "==", requestUsername));
        const querySnap = await getDocs(q);
        if(querySnap.size > 0){
            querySnap.forEach((doc) => {
                if(doc.exists()){
                    updateUsersRequests(doc.id, requestObj);
                }
            })
        } else {
            setIsRequestSending(false);
            setUsernameValidation("Username not found, check spelling or confirm with the user.");
            return;
        }
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
        let request = {
            requestDate: Timestamp.now(),
            requestorAvatar: userInfo.avatar,
            requestorId: uid,
            requestorMessage: requestMessage,
            requestorUsername: userInfo.username
        }
        
        checkForUsername(request);
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
                        {activeRequests !== null ? activeRequests.map((r) => {
                            let request = r.data
                            let date = new Date(request.requestDate.seconds * 1000).toLocaleDateString("en-US");
                            
                            return (
                                <Grid key={request.date} item xs={12}>
                                    <Grid sx={{boxShadow: 3, maxWidth: 550, borderRadius: 3, backgroundColor: '#363636'}} container spacing={2}>
                                        <Grid item xs={2}>
                                            <Avatar sx={{width: 48, height: 48}}><AvatarContainer avatar={request.requestorAvatar.toLowerCase()}/></Avatar>
                                        </Grid>
                                        <Grid item xs={10}>
                                            <Typography sx={{fontSize: 36, fontWieght: 800}}>{request.requestorUsername}</Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body1">{request.requestorMessage}</Typography>
                                        </Grid>
                                        <Grid sx={{display: 'flex'}} item xs={6}>
                                            <Typography sx={{display: 'flex', alignItems: 'center', color: "#9aa0a6"}} variant="caption">{date}</Typography>
                                        </Grid>
                                        <Grid sx={{display: 'flex', paddingBottom: 2, paddingRight: 2, justifyContent: 'flex-end'}} item xs={6}>
                                            <Button color="success" onClick={() => approveRequest(r)}>Approve</Button>
                                            <Button color="error" onClick={() => denyRequest(r)}>Deny</Button>
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
                       <TextField fullWidth value={requestMessage.username} helperText={usernameValidation} onChange={updateRequestUsername} />
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