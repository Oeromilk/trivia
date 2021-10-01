import React from "react";
import Avatar from '@mui/material/Avatar';

export default function AvatarContainer(props){
    const [img, setImg] = React.useState("");

    React.useEffect(() => {
        const image = require(`../images/the-office-avatars/${props.avatar}.png`);
        setImg(image.default);
    }, [props.avatar])
    
    return (
        <Avatar style={{ width: '100%', height: '100%' }} alt={props.avatar} src={img} />
    )
}