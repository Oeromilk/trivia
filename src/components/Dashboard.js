import React from 'react';
import { auth } from './firebase/firebaseConfig';
import { makeStyles } from '@material-ui/core/styles';

import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

const useStyles = makeStyles((theme) => ({
    root: {
        [theme.breakpoints.up('md')]: {
            maxWidth: '80%'
        },
        [theme.breakpoints.down('sm')]: {
            maxWidth: '90%',
            marginBottom: theme.spacing(3)
        }

    },
    grid: {
        marginTop: theme.spacing(3)
    },
    card: {
        [theme.breakpoints.up('md')]: {
            height: '400px'
        },
        [theme.breakpoints.down('sm')]: {
            height: '250px'
        }
    },
    paper: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        width: '100%',
        padding: theme.spacing(1)
    }
}))

export default function Dashboard(){
    const classes = useStyles();
    return (
        <React.Fragment>
            <Container className={classes.root}>
                <Grid container spacing={3} className={classes.grid}>
                    <Grid item xs={12} >
                        <Typography variant="h3">Dashboard</Typography>
                    </Grid>
                    <Grid item md={4} sm={5} xs={12} className={classes.card}>
                        <Card className={classes.paper} elevation={3}>
                            <CardContent>
                                <Typography variant="h5" color="primary">Ready to test your knowledge?</Typography>
                            </CardContent>
                            <CardActions>
                                <Button color="secondary" variant="outlined">New Game</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item md={4} sm={7} xs={12} className={classes.card}>
                        <Card className={classes.paper} elevation={3}>
                            <CardContent>
                                <Typography variant="h6">Friends</Typography>
                                <List>
                                    <ListItem>User Name</ListItem>
                                </List>
                            </CardContent>
                            <CardActions>
                            <Button color="secondary" variant="outlined" className={classes.cardAction}>See All</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                    <Grid item md={4} sm={12} xs={12} className={classes.card}>
                        <Card className={classes.paper} elevation={3}>
                            <CardContent>
                                <Typography variant="h6">Achievments</Typography>
                                <List>
                                    <ListItem>Acievment Title</ListItem>
                                </List>
                            </CardContent>
                            <CardActions>
                                <Button color="secondary" variant="outlined" className={classes.cardAction}>See All</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </React.Fragment>
    )
};