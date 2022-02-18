import React from "react";

export default function AvatarContainer(){
    const [img, setImg] = React.useState("");

    React.useEffect(() => {
        const image = require(`../images/thats-what-she-said/${getRandomNumber()}.gif`);
        setImg(image.default);
    }, [])

    const getRandomNumber = () => {
        return Math.floor(Math.random() * 5) + 1;
    }
    
    return (
        <img style={{width: '100%'}} alt="thats what she said" src={img} />
    )
}