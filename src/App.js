import React, { useEffect } from 'react';
import { ReactComponent as MovieWatching } from './images/movie-watching.svg';
import { ReactComponent as TrivibleLogo} from "./images/trivible-logo.svg";
import { ThemeProvider, StyledEngineProvider, createTheme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import { CssBaseline } from '@mui/material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { auth, analytics } from "./components/firebase/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { logEvent } from "firebase/analytics";
import { AnimatePresence, motion } from 'framer-motion/dist/framer-motion';

import { AppBar, Button, Drawer, List, ListItem, Typography, Divider, Paper, Accordion, AccordionDetails, AccordionSummary, Stack} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ToolBar from '@mui/material/Toolbar';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import FeedbackRoundedIcon from '@mui/icons-material/FeedbackRounded';

import Dashboard from './components/Dashboard';
import GameView from './components/GameView';
import GameEnding from './components/GameEnding';
import LeaderBoard from './components/Leaderboard';
import FriendsView from './components/FriendsView';
import UserProfile from './components/UserProfile';
import Review from './components/Review';
import Contribute from './components/Contribute';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import ForgotPassword from './components/ForgotPassword';
import Feedback from './components/Feedback';
import leaderboardImage from './images/leaderboard.jpg';
import landingImage from './images/landingImage.svg';
import { Switch, Route, Link, useHistory, useLocation } from "react-router-dom";


const theme = createTheme({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#6b6b6b #2b2b2b",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: "#2b2b2b",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: "#6b6b6b",
            minHeight: 24,
            border: "3px solid #2b2b2b",
          },
          "&::-webkit-scrollbar-thumb:focus, & *::-webkit-scrollbar-thumb:focus": {
            backgroundColor: "#959595",
          },
          "&::-webkit-scrollbar-thumb:active, & *::-webkit-scrollbar-thumb:active": {
            backgroundColor: "#959595",
          },
          "&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#959595",
          },
          "&::-webkit-scrollbar-corner, & *::-webkit-scrollbar-corner": {
            backgroundColor: "#2b2b2b",
          },
        },
      },
    },
  },
  palette: {
    mode: (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'),
    primary: {
      main: '#3b82f6'
    },
    secondary: {
      main: '#10b981'
    },
    tertiary: {
      main: '#9A68F8'
    }
  }
})

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1
  },
  appBar: {
    marginBottom: theme.spacing(6)
  },
  accordionSize: {
    maxWidth: '500px',
    padding: theme.spacing(3)
  },
  faqTitle: {
    marginBottom: theme.spacing(3)
  },
  landingBackground: {
    flexGrow: 1,
    width: '100%',
    height: '100%',
    backgroundImage: `url(${landingImage})`,
    backgroundAttachment: 'fixed',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    // backdropFilter: `blur(5px)`
    // filter: `blur(2px) grayscale(50%)`
  },
  h1Banner: {
    [theme.breakpoints.down('sm')]: {
      fontSize: '10vh'
    },
    marginTop: theme.spacing(6),
    fontWeight: 'bolder',
    fontSize: '15vw',
    background: `linear-gradient(to right, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  landingTitle: {
    marginTop: theme.spacing(9)
  },
  landingSpacing : {
    marginBottom: theme.spacing(9)
  },
  toolBarStyle: {
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`
  },
  blueFrostedBackground: {
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    backdropFilter: 'blur(2px)'
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
    padding: theme.spacing(3),
    display: 'flex',
    justifyContent: 'center',
    flexDirection: 'column',
    borderRadius: '0.5em',
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    backdropFilter: 'blur(2px)'
  },
  signUpAction: {
    marginTop: theme.spacing(6),
    marginBottom: theme.spacing(9)
  },
  highlightedOrangeText: {
    color: theme.palette.secondary.main
  },
  highlightedBlueText: {
    color: theme.palette.primary.main
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
    padding: `${theme.spacing(3)} ${theme.spacing(1)}`,
    maxWidth: '500px'
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
    width: 300,
    height: '100%',
    background: theme.palette.primary.main
  },
  fullList: {
    width: 'auto'
  },
  accordionDivider: {
    borderTop: `1px solid ${theme.palette.secondary.main}`,
    paddingTop: theme.spacing(3)
  },
  drawerColor: {
    background: theme.palette.primary.main
  },
  coloredShadow: {
    boxShadow: `0 -0.25em 1em 0 ${theme.palette.primary.main},
                0.25em 0.25em 0.75em 0 ${theme.palette.tertiary.main},
                -0.25em 0.25em 0.75em 0 ${theme.palette.secondary.main}`
  },
  leaderboardText: {
    [theme.breakpoints.down('md')]: {
      marginBottom: theme.spacing(5)
    },
    padding: theme.spacing(3),
    borderRadius: '0.5em',
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    backdropFilter: 'blur(2px)'
  },
  rankText: {
    [theme.breakpoints.up('md')]: {
      maxWidth: '50%',
      margin: `${theme.spacing(5)} auto`
    },
    
    marginTop: theme.spacing(5),
    padding: theme.spacing(3),
    borderRadius: '0.5em',
    backgroundColor: 'rgba(16, 185, 129, 0.5)',
    backdropFilter: 'blur(2px)'
  },
  leaderboardImage: {
    [theme.breakpoints.up('sm')]: {
      maxWidth: '500px'
    },
    paddingBottom: theme.spacing(3),
    display: 'block',
    margin: '0 auto',
    width: '90%'
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

function SignOut(props){
  const classes = useStyles();
  const history = useHistory();

  function handleSignOut(){
    signOut(auth).then(() =>{
      logEvent(analytics, 'sign_out');
      localStorage.setItem("uid", null);
      history.push("/");
    }).catch((error) => {
      console.log(error);
    });
  }
  return (
    <Link to="/" style={noTextDecoration}>
      <Button className={classes.linkStyle} color="inherit" variant={props.variant} onClick={handleSignOut}>Sign Out</Button>
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
  const location = useLocation();

  return (
    <React.Fragment>
      <Link to="/" style={noTextDecoration}>
        <Button className={classes.linkStyle} color={location.pathname === '/' ? "primary" : "inherit"} variant="outlined">Dashboard</Button>
      </Link>
      <Link to="/leaderboard" style={noTextDecoration}>
        <Button className={classes.linkStyle} color={location.pathname === '/leaderboard' ? "primary" : "inherit"} variant="outlined">Leader Board</Button>
      </Link>
      <Link to="/profile" style={noTextDecoration}>
        <Button className={classes.linkStyle} color={location.pathname === '/profile' ? "primary" : "inherit"} variant="outlined">Profile</Button>
      </Link>
      <Link to="/feedback" style={noTextDecoration}>
        <Button className={classes.linkStyle} color={location.pathname === '/feedback' ? "primary" : "inherit"} variant="outlined">Feedback</Button>
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
                <Stack direction="row" justifyContent="space-around" alignItems="center" spacing={2}>
                  <DashboardRoundedIcon />
                  <Button color="inherit">Dashboard</Button>
                </Stack> 
              </Link>
            </ListItem>
            <ListItem>
              <Link to="/leaderboard" style={noTextDecoration}>
                <Stack direction="row" justifyContent="space-around" alignItems="center" spacing={2}>
                  <LeaderboardRoundedIcon />
                  <Button color="inherit">Leader Board</Button>
                </Stack>
              </Link>
            </ListItem>
            <ListItem>
              <Link to="/profile" style={noTextDecoration}>
                <Stack direction="row" justifyContent="space-around" alignItems="center" spacing={2}>
                  <AccountCircleRoundedIcon />
                  <Button color="inherit">Profile</Button>
                </Stack>
              </Link>
            </ListItem>
            <Divider />
            <ListItem>
              <Link to="/feedback" style={noTextDecoration}>
              <Stack direction="row" justifyContent="space-around" alignItems="center" spacing={2}>
                  <FeedbackRoundedIcon />
                  <Button color="inherit">Feedback</Button>
                </Stack>
              </Link>
            </ListItem>
            <Divider />
            <ListItem sx={{ paddingTop: 3}}>
            {((props.currentUser !== null) ? <SignOut variant={"outlined"} /> : <SignInButton />)}
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
    <div className={classes.appBar}>
      <AppBar position="fixed" sx={{top: 0, left: 0}}>
        <ToolBar>
          <div className={classes.title}  onClick={handleHome}>
            <Stack direction="row" justifyContent="flex-start" alignItems="center" spacing={1}>
              <TrivibleLogo style={{height: 32, width: 32, marginRight: 12}} />
              <Typography variant="h6" >Trivible</Typography>
            </Stack>
          </div>
          <div className={classes.desktopSection}>
            {((props.currentUser !== null) ? <SignedInLinks /> : null)}
            {((props.currentUser !== null) ? <SignOut variant={"text"} /> : <SignInButton />)}
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
          <Typography variant="body2">Trivible is free to play/use/share!</Typography>
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
          <Typography variant="body2" >We are focusing on The Office to get the base functionality and features developed.</Typography>
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
          <List>
            <ListItem>
              <Typography variant="body2">Parks and Recreation</Typography>
            </ListItem>
            <Divider />
            <ListItem>
              <Typography variant="body2">Friends</Typography>
            </ListItem>
          </List>
          <Typography variant="body2" >Other shows will be considered based upon request and popularity.</Typography>
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
          <Typography variant="body2">Contributions are something we are excited about, once a user reachs a certain rank, they will unlock the ability to contribute trivia questions.</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded === 'panel5'} onChange={handleChange('panel5')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel5bh-content"
          id="panel1bh-header"
        >
          <Typography variant="subtitle1">Why is Trivible invite only?</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDivider}>
          <Typography variant="body2">We are limiting users from joining so we can develop and scale at a slower pace to start.</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion expanded={expanded === 'panel6'} onChange={handleChange('panel6')}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel56h-content"
          id="panel1bh-header"
        >
          <Typography variant="subtitle1">How many invites can I give once I join?</Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDivider}>
          <Typography variant="body2">Two! So choose wisely on who you invite.</Typography>
        </AccordionDetails>
      </Accordion>
    </div>
  )
}

const containerVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.75
    }
  },
  exit: {
    x: '-100vw',
    transition: { 
      ease: 'easeInOut'
    }
  }
}

function LandingNoUser(){
  const classes = useStyles();
  const history = useHistory();
  
  const handleSignUp = (event) => {
    event.preventDefault();
    history.push("/sign-up");
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible" exit="exit">
      <div className={classes.landingBackground}>
        <div style={{backdropFilter: 'blur(5px) grayscale(0.5)'}} >
          <Stack sx={{minHeight: '100vh'}} direction="column" alignItems="center" spacing={10}>
            <Typography align="center" className={classes.h1Banner}>Trivible</Typography>
            <Typography sx={{padding: 2}} variant="h2" align="center">
              <span className={classes.highlightedBlueText}>Bingeable</span> TV Show <span className={classes.highlightedOrangeText}>Trivia</span>
            </Typography>
            <Button sx={{padding: '1em 2em'}} className={classes.coloredShadow} variant="contained" color="primary" size="large" onClick={handleSignUp}>Sign Up</Button>
          </Stack>
          <Stack sx={{minHeight: '100vh', paddingTop: 5}} direction="column" alignItems="center" spacing={5}>
            <Typography sx={{padding: 3, maxWidth: '500px', fontSize: '2.5em'}}>
              Do you love asking others questions about your favorite shows to test their knowledge? 
            </Typography>
            <MovieWatching className={classes.movieWatching}/>
            <Typography sx={{padding: 3, maxWidth: '500px', fontSize: '2.5em'}}>
              Trivible is the place where you can prove how much you know about your favorite shows!
            </Typography>
          </Stack>
          <Stack sx={{minHeight: '100vh', margin: '0 auto', paddingTop: 5}} direction="column" justifyContent="space-evenly" alignItems="center" spacing={3}>
            <Typography sx={{fontSize: '2em'}} align="center">Here is how the game works!</Typography>
            <Paper variant="outlined" className={classes.ruleStyle}>
              <Typography sx={{fontSize: '1.5em'}} align="center" color="primary">1st</Typography>
              <Typography variant="subtitle1" align="center">
                When a game starts you will be given a random question, excluding questions you have answered before.
              </Typography>
            </Paper>
            <Paper variant="outlined" className={classes.ruleStyle}>
              <Typography sx={{fontSize: '1.5em'}} align="center" color="primary">2nd</Typography>
              <Typography variant="subtitle1" align="center">
                You have several seconds to answer the question, if you don't choose in time, you will get it wrong.
              </Typography>
            </Paper>
            <Paper variant="outlined" className={classes.ruleStyle}>
              <Typography sx={{fontSize: '1.5em'}} align="center" color="primary">3rd</Typography>
              <Typography variant="subtitle1" align="center">
                You will continue to get new questions until your run out of chances. You have 3 to start!
              </Typography>
            </Paper>
          </Stack>
          <Stack sx={{minHeight: '100vh', paddingTop: 5}} direction="column" alignItems="center" spacing={5}>
            <Typography sx={{padding: 3, maxWidth: '500px', fontSize: '2.5em'}}>
              Each question has it's own difficulty, this makes some questions worth more points than others.
            </Typography>
            <Typography sx={{padding: 3, maxWidth: '500px', fontSize: '2.5em'}}>
              The leaderboard will update with the top 10 users after they finish their games, fight for your place to be shown in the top 10!
            </Typography>
            <img className={classes.leaderboardImage} src={leaderboardImage} alt="Showing first, second, and third place users on a leaderboard." loading="lazy"/>
          </Stack>
          <Stack sx={{minHeight: '100vh', paddingTop: 5}} direction="column" alignItems="center" spacing={5}>
            <Typography sx={{fontSize: '2em'}} align="center" color="primary">Ready to start your journey?</Typography>
            <Button sx={{padding: '1em 2em'}} className={classes.coloredShadow} variant="contained" color="primary" size="large" onClick={handleSignUp}>Sign Up</Button>
            <Typography>Have some questions?</Typography>
            <FAQ />
          </Stack>
        </div>
      </div>
    </motion.div>
  );
}

export default function App(){
  const [currentUser, setCurrentUser] = React.useState(null);
  const userStatus = localStorage.getItem("uid");
  const location = useLocation();

  useEffect(() => {
    logEvent(analytics, 'page_view');
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
        <CssBaseline />
        <React.Fragment>
          {userStatus !== "null" ? <TopBar currentUser={currentUser} />:  null}
        </React.Fragment>
        
        <AnimatePresence exitBeforeEnter>
          <Switch location={location} key={location.key}>
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
            <Route path="/review">
              <Review />
            </Route>
            <Route path="/contribute">
              <Contribute />
            </Route>
            <Route path="/feedback">
              <Feedback />
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
        </AnimatePresence>
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
