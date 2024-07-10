'use client'
import { useState, useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';

import { useSettings } from '../config/hooks/useSettings'

import styles from "../page.module.css";

import Webcam from "react-webcam";
import Switch from '@mui/material/Switch';


export default function signin() {

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const router = useRouter();
  const { settings, saveSettings } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState('');
  const [blobArray, setBlobArray] = useState([]);
  const [loadingText, setLoadingText] = useState('');
  const [username, setUsername] = useState('');
  const [permission, setPermission] = useState(null);
  const [activeCamera, setActiveCamera] = useState(false);
  const [visibleCamera, setVisibleCamera] = useState(true);

  function clearStates() {
    setBlobArray([])
    setLoadingText('')
    setUsername('')
    setActiveCamera(false)
    setIsLoading(false)
  }

  useEffect(() => {
    const checkCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setPermission(true);
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        setPermission(false);
      }
    };

    checkCameraPermission();

  }, [])

  const runFace = async () => {
    let count = 0;
    const maxRuns = 5;
  
    const interval = setInterval(() => {
      detect();
      count += 1;
  
      if (count >= maxRuns) {
        clearInterval(interval);
      }
    }, 250); 
  
    return () => clearInterval(interval);
  };

  useEffect(() => {
    if(blobArray.length >= 5) {
      
      async function faceLogin () {
        setLoadingText('Verifying face...')

        const formData = new FormData();
        formData.append("username", username);
        blobArray.forEach((image, index) => {
          formData.append("data", image);
        })

        const resultLogin = await fetch('http://localhost:5001/face_login', {
          method: "POST",
          mode: "cors", 
          body: formData
        }).then((res) => {
          return res.json();
        });;
  
        if(!resultLogin.error) {
          setLoadingText('User successfully authenticated!')
          const newSettings = {authorizedUser: true}
          saveSettings(newSettings)
          setTimeout(() => {
            router.push('/dashboard');
            setIsLoading(false)
          },2000);
        } else {
          alert('Face not recognized, try again!')
          clearStates()
        }
      }

      faceLogin()

    }
  }, [blobArray])

  const detect = async () => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      
      const ctx = canvasRef.current.getContext("2d");

      ctx.drawImage(video, 0, 0, canvasRef.current.width, canvasRef.current.height);

      canvasRef.current.toBlob(async (blob) => {
          setBlobArray(prevBlobArray => [...prevBlobArray, blob]);
      }, 'image/jpeg');

    }
  };

  const handleLogin = async(e) => {
    e.preventDefault();
    setIsLoading(true);

    let resultLogin;

    if(loginType == 'face') {
      if(permission == false) {
        setLoadingText('Please, enable the camera in this website to use this feature!');
        setTimeout(() => {
          setIsLoading(false)
        }, 2000)
        return
      }
      setLoadingText('Look at your camera')
      setActiveCamera(true)
      setUsername(e.target.elements.username.value)
      setTimeout(() => {
        runFace()
      }, 1000)
    } else if (loginType === 'password') {
      if(!e.target.elements.password.value) {
        alert('Password is required!')
        setIsLoading(false);
      } else {
        const reqBody = {
          username: e.target.elements.username.value,
          password: e.target.elements.password.value
        }

        let basePath = process.env.NEXT_PUBLIC_API_URL;

        let headers = {
          'Content-Type': 'application/json',
        };

        resultLogin = await fetch(`${basePath}/login`, { headers: headers, method: 'POST', body: JSON.stringify(reqBody) }).then((res) => {
          return res.json();
        });

        if(!resultLogin.error) {
          setLoadingText('User successfully authenticated!')
          const newSettings = {authorizedUser: true}
          saveSettings(newSettings);
          setTimeout(() => {
            router.push('/dashboard');
            setIsLoading(false);
          }, 2000);
        } else {
          alert(resultLogin.error);
          setIsLoading(false);
        }

      }
    }

  }

  return (
    <main className={styles.main}>
      {activeCamera &&
        <div className="canvas-container">
          <Webcam
            ref={webcamRef}
            style={{
              //display: 'none',
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              bottom: 50,
              left: 0,
              right: 0,
              textAlign: "center",
              zIndex: 9,
              width: 250,
              height: 200,
              opacity: visibleCamera ? 1 : 0
            }}
          />

          <canvas
            ref={canvasRef}
            style={{
              //display: 'none',
              position: "absolute",
              marginLeft: "auto",
              marginRight: "auto",
              bottom: 50,
              left: 0,
              right: 0,
              textAlign: "center",
              zIndex: 9,
              width: 250,
              height: 200,
              opacity: visibleCamera ? 1 : 0
            }}
          />
        </div>      
      }     
{/* <Image
            className={styles.logo}
            src="./face.svg"
            alt="Next.js Logo"
            width={100}
            height={100}
            priority
          /> */}
      {isLoading &&
        <div className={styles["loader-container"]}>
          <h4>{loadingText}</h4>
          <br/>
          <div className={styles.loader}></div>
        </div>
      }
      <div className={styles.center}>
        {!isLoading &&
          <form onSubmit={handleLogin}>
            <span>Sign In</span>
            <label htmlFor="fusername">Username</label>
            <input type="text" id="fusername" name="username" required />
            <label htmlFor="fpassword">Password</label>
            <input type="password" id="fpassword" name="password" />
            <div>
              <button type="submit" onClick={() => setLoginType('password')}>Password Sign In</button>
              <button type="submit" onClick={() => setLoginType('face')}>Face Sign In</button>
            </div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Switch label="Visible Camera" color="default" checked={visibleCamera} value={visibleCamera} onChange={(e) => setVisibleCamera(e.target.checked)} />
              <span style={{fontSize: '12px'}}>Visible Camera</span>
            </div>
          </form>
        }
      </div>
    </main>
  );
}