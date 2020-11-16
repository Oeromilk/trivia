import React from 'react';
import { auth } from './firebase/firebaseConfig';

import Container from '@material-ui/core/Container';

export default function Dashboard(){
    return (
        <React.Fragment>
            <Container>
                <h1>Dashboard</h1>
            </Container>
        </React.Fragment>
        
    )
};