'use client'
import { useState, useEffect, useRef } from 'react';

import styles from "../page.module.css";

import Webcam from "react-webcam";

import Switch from '@mui/material/Switch';



export default function signin() {

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [blobArray, setBlobArray] = useState([]);
  const [loadingText, setLoadingText] = useState('');
  const [permission, setPermission] = useState(null);
  const [activeCamera, setActiveCamera] = useState(false);
  const [visibleCamera, setVisibleCamera] = useState(true);
  const [faceResult, setFaceResult] = useState('-')

  function clearStates() {
    setBlobArray([])
    setLoadingText('')
    setActiveCamera(false)
    setIsLoading(false)
    webcamRef.current = null;
    canvasRef.current = null;
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
        blobArray.forEach((image, index) => {
          formData.append("data", image);
        })

        const result = await fetch('http://localhost:5001/face_recognition', {
          method: "POST",
          mode: "cors", 
          body: formData
        }).then((res) => {
          return res.json();
        });;
  
        if(!result.error) {
          setLoadingText('Face recognition executed successfully!')
          const recognizedUser = result.result;
          setFaceResult(recognizedUser)
          setTimeout(() => {
            setIsLoading(false)
          },2000);
        } else {
          setFaceResult('User not found!')
          alert('Face not recognized, try again!')
        }
        clearStates();

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

  const handleRecognition = async(e) => {
    e.preventDefault();
    setIsLoading(true);

    if(permission == false) {
      setLoadingText('Please, enable the camera in this website to use this feature!');
      setTimeout(() => {
        setIsLoading(false)
      }, 2000)
      return
    }
    setLoadingText('Look at your camera')
    setActiveCamera(true)
    setTimeout(() => {
      runFace()
    }, 500)

  }

  return (
    <main className={styles.main}>
      {isLoading &&
        <div className={styles["loader-container"]}>
          <h4>{loadingText}</h4>
          <br/>
          <div className={styles.loader}></div>
        </div>
      }
      <div className={styles.center}>
        {!isLoading &&
          <form onSubmit={handleRecognition}>
            <span>Face Recognition Demo</span>
            <div>
              <button type='submit'>Recognize Face</button>
            </div>
            <br/>
            <span>Face result: {faceResult}</span>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <Switch label="Visible Camera" color="default" checked={visibleCamera} value={visibleCamera} onChange={(e) => setVisibleCamera(e.target.checked)} />
              <span style={{fontSize: '12px'}}>Visible Camera</span>
            </div>

          </form>
        }
      </div>
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
              zIndex: 99999,
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
              zIndex: 999999,
              width: 250,
              height: 200,
              opacity: visibleCamera ? 1 : 0
            }}
          />
        </div>      
      }     

    </main>
  );
}