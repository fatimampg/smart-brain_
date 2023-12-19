import React, { Component } from 'react';
import Particles from "react-particles";
import type { Engine } from "tsparticles-engine";
import { loadFull } from "tsparticles";
import Navigation from './components/Navigation/Navigation';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import './App.css';

 
// Code - background (particles) (npm tsparticles)
const particlesOptions = {
      fpsLimit: 120,
      particles: {
          color: {
              value: "E3F0F7",
          },
          links: {
              color: "#E3F0F7",
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
          },
          move: {
              direction: "none",
              enable: true,
              outModes: {
                  default: "bounce",
              },
              random: false,
              speed: 2,
              straight: false,
          },
          number: {
              density: {
                  enable: true,
              },
              value: 400,
          },
          shape: {
              type: "circle",
          },
          size: {
              value: { min: 0.5, max: 1 },
          },
      },
}

class ParticlesContainer extends Component { 
  async customInit(engine: Engine): Promise <void> {
    console.log('customInit called');
    await loadFull(engine);
    console.log('customInit completed');
  }

  render() {
    return (
      <Particles className='particles' options={particlesOptions} 
      init={this.customInit} />
    );
  }
}

const initialState = {
    input: '',
    imageUrl: '',
    box: {}, 
    route: 'signin', 
    isSignedIn: false, 
    user: {
        id: '',
        name: '',
        email:'',
        entries: 0,
        joined: ''
    }
}

class App extends Component {
    constructor() {
        super();
        this.state = initialState;
    }

    loadUser = (data) => {
        this.setState({user: {
            id: data.id,
            name: data.name,
            email:data.email,
            entries: data.entries,
            joined: data.joined
        }})
    }
    
    componentDidMount() {
        fetch('https://smart-brain-api-s9s0.onrender.com/')
        .then(response => response.json())
        .then(console.log) 
    }

    // Define limits of the box (face identification) based on the data retrieved by the clarifai model:
    calculateFaceLocation = (data) => {
        const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box; //1st face detected
        const image = document.getElementById('inputimage');
        const width = Number(image.width); //(the output is a % of the image)
        const height = Number(image.height);
        console.log(width, height);
        return {
            leftCol: clarifaiFace.left_col * width, //x (starting from the left)
            // clarifaiFace.left_col - clarifaiFace is the clarifai output and left_col is one of its properties
            topRow: clarifaiFace.top_row * height, //y (starting from the top (y=0)) 
            rightCol: width - (clarifaiFace.right_col * width), //x (right)
            bottomRow: height - (clarifaiFace.bottom_row * height), //y (bottom)
        }
    }

    displayFaceBox = (box) => {
        console.log(box);
        this.setState({box: box});
    }

    onInputChange = (event) => {
        this.setState({input: event.target.value});
    }

    // Trigger an API request to Carifai using the image URL entered by the user and calculate the box coordinates based on the response (using claculateFaceLocation). It also updates the rank of the user (nº of images entered by the user for face detection):  
    onButtonSubmit =() => {
        this.setState({imageUrl: this.state.input});  
        console.log('click');

        fetch('https://smart-brain-api-s9s0.onrender.com/imageurl', {
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ 
                input: this.state.input 
            }) 
        })
        .then(response => response.json())
        .then(response => {
            if (response) {
                fetch('https://smart-brain-api-s9s0.onrender.com/image', {
                    method: 'put',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ id: this.state.user.id }) 
                })
                .then(response => response.json()) 
                // Updating rank:
                .then(count => {
                   this.setState(Object.assign(this.state.user, { entries: count})) 
                })
                .catch(console.log) 
            }
            this.displayFaceBox(this.calculateFaceLocation(response));
        })
        .catch(err => console.log(err))  
    }
  
onRouteChange = (route) => {
    if (route === 'signout') {
        this.setState(initialState) 
    } else if (route === 'home') {
        this.setState({isSignedIn: true})
    }
    this.setState({route: route}); 
}

  render() {
    const { isSignedIn, imageUrl, route, box } = this.state; 

    return (
      <div className="App">
          <ParticlesContainer />
          <Navigation isSignedIn ={isSignedIn} onRouteChange={this.onRouteChange} /> 
            { route === 'home' 
                ?   <div> 
                        <Logo />
                        <Rank name={this.state.user.name} entries={this.state.user.entries}/>
                        <ImageLinkForm 
                            onInputChange={this.onInputChange} 
                            onButtonSubmit={this.onButtonSubmit}
                        />                    
                        <FaceRecognition box={box} imageUrl={imageUrl}/>   
                    </div>
                : (
                    route === 'signin' 
                    ? <Signin loadUser={this.loadUser} onRouteChange = {this.onRouteChange}/> 
                    : <Register loadUser={this.loadUser} onRouteChange = {this.onRouteChange}/>
                  )
            }  
      </div>
    );
  }
}

export default App;
