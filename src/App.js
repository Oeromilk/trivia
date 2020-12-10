import React, { useEffect } from 'react';
import { ReactComponent as MovieWatching } from './images/movie-watching.svg';
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
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';

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
  movieWatching: {
    height: '341px',
    width: '265px',
    display: 'block',
    margin: '0 auto'
  },
  callToAction: {
    [theme.breakpoints.up('md')]: {
      paddingLeft: theme.spacing(6)
    },
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    marginBottom: theme.spacing(9)
  },
  signUpAction: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(9)
  },
  highlightedOrangeText: {
    color: '#FF8E53'
  },
  highlightedBlueText: {
    color: '#53a6ff',
    fontSize: '4rem'
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
  ruleStyle: {
    paddingTop: theme.spacing(1),
    paddingRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingBottom: theme.spacing(3),
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3)
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
              <Link to="/leaderboard" style={noTextDecoration}>
                <Button className={classes.linkStyle}>Leader Board</Button>
              </Link>
            </ListItem>
            <Divider />
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
              <Typography variant="h1" align="center" className={classes.landingTitle}>Trivible</Typography>
            </Grid>
            
            <Grid item xs={12} className={classes.landingSpacing}>
              <Typography variant="h3" align="center">
                <span className={classes.highlightedBlueText}>Bingeable</span> TV Show <span className={classes.highlightedOrangeText}>Trivia</span>
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} className={classes.callToAction}>
              <Typography variant="h4" align="justify">Are you always trying to stump your friends and family with <span className={classes.highlightedOrangeText}>trivia</span> questions from your favorite shows?</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <MovieWatching className={classes.movieWatching}/>
            </Grid>
            <Grid item xs={12} className={classes.landingTitle}>
              <Typography variant="h5" align="center">Here is how it works!</Typography>
            </Grid>
            <Grid item xs={false} md={3}></Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" className={classes.ruleStyle}>
                <Typography variant="h6" align="center" color="primary">1st</Typography>
                <Typography variant="subtitle1" align="center">
                  When you start a new game you get 3 chances.
                  <br/>
                  A wrong answer or not answering in time loses you a chance.
                  <br/>
                  After the 3 chances are gone your run is over.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={false} md={3}></Grid>
            <Grid item xs={false} md={3}></Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" className={classes.ruleStyle}>
                <Typography variant="h6" align="center" color="primary">2nd</Typography>
                <Typography variant="subtitle1" align="center">
                  You have several seconds to answer the question, if you don't choose in time, you get it wrong.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={false} md={3}></Grid>
            <Grid item xs={false} md={3}></Grid>
            <Grid item xs={12} md={6}>
              <Paper variant="outlined" className={classes.ruleStyle}>
                <Typography variant="h6" align="center" color="primary">3rd</Typography>
                <Typography variant="subtitle1" align="center">
                  You will continue to get new questions until your run out of chances.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" align="center">Ready to start your <span className={classes.highlightedOrangeText}>trivia</span> adventure and take your place on the leaderboard?</Typography>
            </Grid>
            <Grid item xs={12} className={classes.signUpAction}>
              <Grid container justify="center">
                <Button variant="contained" color="primary" size="large" href="/sign-up">Sign Up</Button>
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
