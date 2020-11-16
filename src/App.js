import React, { useEffect } from 'react';
import { makeStyles, ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { CssBaseline } from '@material-ui/core';
import 'fontsource-roboto';
import { auth } from './components/firebase/firebaseConfig';

import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import AppBar from '@material-ui/core/AppBar';
import ToolBar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';

import Dashboard from './components/Dashboard';
import GameView from './components/GameView';
import LeaderBoard from './components/Leaderboard';
import UserProfile from './components/UserProfile';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import ForgotPassword from './components/ForgotPassword';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#53a6ff'
    },
    secondary: {
      main: '#FF8E53'
    }
  }
})

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  landingTitle: {
    marginTop: theme.spacing(6)
  },
  landingSpacing : {
    marginBottom: theme.spacing(9)
  },
  toolBarStyle: {
    background: 'linear-gradient(45deg, #53a6ff 30%, #FF8E53 90%)'
  },
  title: {
    marginRight: theme.spacing(2),
    flexGrow: 1,
    color: "white",
    fontWeight: "bolder"
  },
  desktopSection: {
    [theme.breakpoints.down('sm')]: {
      display: 'none'
    }
  },
  mobileSection: {
    [theme.breakpoints.up('md')]: {
      display: 'none'
    }
  },
  linkStyle: {
    marginLeft: '12px'
  },
  list: {
    width: 300
  },
  fullList: {
    width: 'auto'
  }
}))

const noTextDecoration = {
  color: 'white',
  textDecoration: 'none',
  focus: 'none',
  active: 'none',
  visited: 'none',
  link: 'none'
};

function SignOut(){
  const classes = useStyles();

  function handleSignOut(){
    auth.signOut();
  }
  return (
    <Link to="/" style={noTextDecoration}>
      <Button className={classes.linkStyle} variant="outlined" onClick={handleSignOut}>Sign Out</Button>
    </Link>
  )
}

function SignInButton(){
  const classes = useStyles();

  return (
    <Link to="/sign-in" style={noTextDecoration}>
      <Button className={classes.linkStyle} variant="outlined" >Sign In</Button>
    </Link>
  )
}

function MobileDrawer(props){
  const [state, setState] = React.useState(false);
  const classes = useStyles();

  const toggleDrawer = (open) => (event) => {
    if(event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')){
      return;
    }
    setState(open);
  }

  return (
    <React.Fragment>
      <Button onClick={toggleDrawer(true)}>
        <MenuIcon fontSize="large"/>
      </Button>
      <Drawer anchor={'right'} open={state} onClose={toggleDrawer(false)}>
        <div className={classes.list} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
          <List>
            <ListItem>
              <Link to="/" style={noTextDecoration}>
                <Button className={classes.linkStyle}>Dashboard</Button>
              </Link>
            </ListItem>
            
            <ListItem>
            {((props.currentUser !== null) ? <SignOut /> : <SignInButton />)}
            </ListItem>
          </List>
        </div>
      </Drawer>
    </React.Fragment>
  )
}

function TopBar(props){
  const classes = useStyles();

  return (
    <div className={classes.root}>
          <AppBar position="static">
            <ToolBar className={classes.toolBarStyle}>
              <Typography className={classes.title} variant="h6">Trivible</Typography>
              <div className={classes.desktopSection}>
                <Link to="/" style={noTextDecoration}>
                  <Button className={classes.linkStyle} variant="outlined">Dashboard</Button>
                </Link>
                <Link to="/game" style={noTextDecoration}>
                  <Button className={classes.linkStyle} variant="outlined">New Game</Button>
                </Link>
                <Link to="/leaderboard" style={noTextDecoration}>
                  <Button className={classes.linkStyle} variant="outlined">Leader Board</Button>
                </Link>
                <Link to="/profile" style={noTextDecoration}>
                  <Button className={classes.linkStyle} variant="outlined">Profile</Button>
                </Link>
                {((props.currentUser !== null) ? <SignOut /> : <SignInButton />)}
              </div>
              <div className={classes.mobileSection}>
                <MobileDrawer currentUser={props.currentUser}/>
              </div>
            </ToolBar>
          </AppBar>
        </div>
  )
}

function LandingNoUser(){
  const classes = useStyles();

  return (
      <div className={classes.root}>
        <Container>
          <Grid container>
            <Grid item xs={12} className={classes.landingSpacing}>
              <Typography variant="h1" className={classes.landingTitle}>Trivible</Typography>
            </Grid>
            <Grid item xs={3}></Grid>
            <Grid item xs={9} className={classes.landingSpacing}>
              <Typography variant="h3" align="right">Bingeable TV Show Trivia</Typography>
            </Grid>
            <Grid item xs={9} className={classes.landingSpacing}>
              <Typography variant="h5">Are you always trying to stump your friends and family with trivia questions from your favorite shows?</Typography>
            </Grid>
            <Grid item xs={3}></Grid>
            <Grid item xs={3}></Grid>
            <Grid item xs={9} className={classes.landingSpacing}>
              <Typography variant="h5" align="right">Do you have what it takes to claim first place on the leaderboards?</Typography>
            </Grid>
            <Grid item xs={12} className={classes.landingSpacing}>
              <Typography variant="subtitle1" align="center">Ready to start your trivia adventure and take your place on the leaderboard?</Typography>
            </Grid>
            <Grid item xs={12} className={classes.landingSpacing}>
              <Grid container justify="center">
                <Button variant="outlined" size="large" href="/sign-up">Sign Up</Button>
              </Grid>  
            </Grid>
          </Grid>
        </Container>
      </div>
  )
}

export default function App(){
  const [currentUser, setCurrentUser] = React.useState(null);

  useEffect(() => {
    auth.onAuthStateChanged(function(user){
      if(user !== null){
        setCurrentUser(user);
      } else {
        setCurrentUser(null)
      }
    })
  }, [])
  useEffect(()=>{
    console.log(currentUser)
  })
  return (
      <ThemeProvider theme={theme}>
        <Router>
          <CssBaseline />
          <React.Fragment>
            <TopBar currentUser={currentUser} />
          </React.Fragment>

          <Switch>
            <Route path="/profile">
              <UserProfile />
            </Route>
            <Route path="/leaderboard">
              <LeaderBoard />
            </Route>
            <Route path="/game">
              <GameView />
            </Route>
            <Route path="/sign-up">
              <SignUp />
            </Route>
            <Route path="/sign-in">
              <SignIn />
            </Route>
            <Route path="/forgot-password">
              <ForgotPassword />
            </Route>
            <Route path="/">
              {((currentUser !== null) ? <Dashboard /> : <LandingNoUser/>)}
            </Route>
          </Switch>
        </Router>
      </ThemeProvider>
  )
}
