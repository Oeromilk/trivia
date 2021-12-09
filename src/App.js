import React, { useEffect } from 'react';
import { ReactComponent as MovieWatching } from './images/movie-watching.svg';
import { ReactComponent as TrivibleLogo} from "./images/trivible-logo.svg";
import { ThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import { CssBaseline } from '@mui/material';
import 'fontsource-roboto';
import { auth } from "./components/firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { Container, Grid, AppBar, Button, Drawer, List, ListItem, Typography, Divider, Paper, Accordion, AccordionDetails, AccordionSummary} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ToolBar from '@mui/material/Toolbar';

import Dashboard from './components/Dashboard';
import GameView from './components/GameView';
import GameEnding from './components/GameEnding';
import LeaderBoard from './components/Leaderboard';
import FriendsView from './components/FriendsView';
import UserProfile from './components/UserProfile';
import Contribute from './components/Contribute';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import ForgotPassword from './components/ForgotPassword';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useHistory
} from "react-router-dom";

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#52A5FF'
    },
    secondary: {
      main: '#FF6D1F'
    }
  }
})

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    marginBottom: theme.spacing(8)
  },
  accordionSize: {
    width: '100%',
    marginBottom: theme.spacing(6)
  },
  faqTitle: {
    marginBottom: theme.spacing(3)
  },
  h1Banner: {
    marginTop: theme.spacing(6),
    height: '200px'
  },
  landingTitle: {
    marginTop: theme.spacing(6)
  },
  landingSpacing : {
    marginBottom: theme.spacing(9)
  },
  toolBarStyle: {
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`
  },
  movieWatching: {
    height: '341px',
    width: '265px',
    display: 'block',
    margin: '0 auto',
    //backgroundColor: theme.palette.secondary.main
  },
  callToAction: {
    [theme.breakpoints.up('md')]: {
      paddingLeft: theme.spacing(6)
    },
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    marginBottom: theme.spacing(9),
    //backgroundColor: theme.palette.primary.main
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
    fontWeight: "bolder",
    cursor: "pointer"
  },
  desktopSection: {
    [theme.breakpoints.down('md')]: {
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
  },
  accordionDivider: {
    borderTop: '1px solid #53a6ff',
    paddingTop: theme.spacing(3)
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
  const history = useHistory();

  function handleSignOut(){
    signOut(auth).then(() =>{
      localStorage.setItem("uid", null);
      history.push("/");
    }).catch((error) => {
      console.log(error);
    });
  }
  return (
    <Link to="/" style={noTextDecoration}>
      <Button className={classes.linkStyle} color="inherit" variant="text" onClick={handleSignOut}>Sign Out</Button>
    </Link>
  )
}

function SignInButton(){
  const classes = useStyles();

  return (
    <Link to="/sign-in" style={noTextDecoration}>
      <Button className={classes.linkStyle} color="inherit" variant="outlined" >Sign In</Button>
    </Link>
  )
}

function SignedInLinks(){
  const classes = useStyles();

  return (
    <React.Fragment>
      <Link to="/" style={noTextDecoration}>
        <Button className={classes.linkStyle} color="inherit" variant="outlined">Dashboard</Button>
      </Link>
      <Link to="/leaderboard" style={noTextDecoration}>
        <Button className={classes.linkStyle} color="inherit" variant="outlined">Leader Board</Button>
      </Link>
      <Link to="/profile" style={noTextDecoration}>
        <Button className={classes.linkStyle} color="inherit" variant="outlined">Profile</Button>
      </Link>
    </React.Fragment>
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
        <MenuIcon sx={{color: 'white'}} fontSize="large"/>
      </Button>
      <Drawer anchor={'right'} open={state} onClose={toggleDrawer(false)}>
        <div className={classes.list} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
          <List>
            <ListItem>
              <Link to="/" style={noTextDecoration}>
                <Button className={classes.linkStyle} color="inherit">Dashboard</Button>
              </Link>
            </ListItem>
            <ListItem>
              <Link to="/leaderboard" style={noTextDecoration}>
                <Button className={classes.linkStyle} color="inherit">Leader Board</Button>
              </Link>
            </ListItem>
            <ListItem>
              <Link to="/profile" style={noTextDecoration}>
                <Button className={classes.linkStyle} color="inherit">Profile</Button>
              </Link>
            </ListItem>
            <Divider />
            <ListItem sx={{ paddingTop: 3}}>
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
  const history = useHistory();

  function handleHome(){
    history.push("/");
  }

  return (
    <div className={classes.root}>
          <AppBar position="fixed" sx={{top: 0, left: 0}}>
            <ToolBar>
              <TrivibleLogo style={{height: 32, width: 32, marginRight: 12}} />
              <Typography className={classes.title} variant="h6" onClick={handleHome}>Trivible</Typography>
              <div className={classes.desktopSection}>
                {((props.currentUser !== null) ? <SignedInLinks /> : null)}
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

function FAQ(){
  const classes = useStyles();
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <div className={classes.accordionSize}>
      <Typography className={classes.faqTitle} variant="h4" align="center" color="secondary">FAQ</Typography>
      <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1bh-content"
          id="panel1bh-header"
        >
          <Typography variant="subtitle1">How much does Trivible cost?</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDivider}>
          <Typography variant="subtitle2" >We strive to keep Trivible free to play and don't want to spam you with ads!</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel2bh-content"
          id="panel2bh-header"
        >
          <Typography variant="subtitle1">Will The Office be the only category to play?</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDivider}>
          <Typography variant="subtitle2" >To start we are only offering trivia about The Office.</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel3bh-content"
          id="panel3bh-header"
        >
          <Typography variant="subtitle1">What other shows will I be able to test my trivia knowledge?</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDivider}>
          <Typography variant="subtitle2" >We will introduce modes for Friends and Parks and Recreation. Other shows upon request and popularity will be considered.</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel4bh-content"
          id="panel4bh-header"
        >
          <Typography variant="subtitle1">Can I contribute to the list of trivia questions?</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDivider}>
          <Typography variant="subtitle2" >We would love the community to be able to contribute and are thinking of ways of implementing this feature, stay tuned!</Typography>
        </AccordionDetails>
      </Accordion>
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
            <Typography variant="h1" align="center" className={classes.h1Banner}>Trivible</Typography>
          </Grid> 
          <Grid item xs={12} className={classes.landingSpacing}>
            <Typography variant="h3" align="center">
              <span className={classes.highlightedBlueText}>Bingeable</span> TV Show <span className={classes.highlightedOrangeText}>Trivia</span>
            </Typography>
          </Grid>
          <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', marginBottom: 5 }}>
            <Button variant="contained" color="primary" size="large" href="/sign-up">Sign Up</Button>
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
                After the 3 chances are done, your run is over.
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
            <Typography variant="h6" align="center">Ready to start your <span className={classes.highlightedOrangeText}>trivia</span> adventure and take your place on the leaderboard?</Typography>
          </Grid>
          <Grid item xs={12} className={classes.signUpAction}>
            <Grid container justifyContent="center">
              <Button variant="contained" color="primary" size="large" href="/sign-up">Sign Up</Button>
            </Grid>  
          </Grid>
          <Grid item md={2}></Grid>
          <Grid item xs={12} md={8}>
            <FAQ />
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default function App(){
  const [currentUser, setCurrentUser] = React.useState(null);
  const userStatus = localStorage.getItem("uid");

  useEffect(() => {
    console.log("local storage uid: ", localStorage.getItem("uid"))
    onAuthStateChanged(auth, function(user){
      if(user !== null){
        localStorage.setItem("uid", user.uid);
        setCurrentUser(user);
      } else {
        localStorage.setItem("uid", null)
        setCurrentUser(null)
      }
    })
  }, [])
  
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <Router>
          <CssBaseline />
          <React.Fragment>
            <TopBar currentUser={currentUser} />
          </React.Fragment>

          <Switch>
            <Route path="/profile">
              <UserProfile currentUser={currentUser} />
            </Route>
            <Route path="/friends">
              <FriendsView currentUser={currentUser} />
            </Route>
            <Route path="/leaderboard">
              <LeaderBoard />
            </Route>
            <Route path="/game/ending">
              <GameEnding />
            </Route>
            <Route path="/game">
              <GameView />
            </Route>
            <Route path="/contribute">
              <Contribute />
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
            <Route exact path="/">
              {(userStatus !== "null" ? <Dashboard user={currentUser} /> : <LandingNoUser/>)}
            </Route>
          </Switch>
        </Router>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
