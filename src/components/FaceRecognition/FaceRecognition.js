import React from 'react';
import './FaceRecognition.css';

// display the image and the box around the face detected (coordinates calculated with the calculateFaceLocation function (this function is called in onButtonSubmit)) (FaceRecognition receives imageURL and box props as parameters)
const FaceRecognition = ({imageUrl, box}) => {
    return (
        <div className='center ma'>
            <div className='absolute mt2'>
                <img id='inputimage' alt='' src={imageUrl} width='500px' height='auto'/>
                <div className='bounding-box' style={{top: box.topRow, right: box.rightCol, bottom: box.bottomRow, left: box.leftCol}}></div>
                {/* topRow, righRow... defined in calculateFaceLocation function in App.js */}
            </div>

        </div>
    );
}

export default FaceRecognition;