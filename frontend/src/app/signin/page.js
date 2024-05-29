'use client'
import { useState, useEffect, useRef } from 'react';

import Image from "next/image";
import { useRouter } from 'next/navigation';

import { useSettings } from '../config/hooks/useSettings'

import styles from "../page.module.css";

import Webcam from "react-webcam";


export default function signin() {

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const router = useRouter();
  const { settings, saveSettings } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState('');
  const [blobArray, setBlobArray] = useState([])

  const runFaceMesh = async () => {
    const interval = setInterval(() => {
      detect();
    }, 2500); 

    return () => clearInterval(interval);
  };

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
        console.log(blob)
        setBlobArray(prevBlobArray => [...prevBlobArray, { blob }]);
        const formData = new FormData();
        formData.append("username", 'valmarath');
        formData.append("data", blob);

/*         // Send buffer to API
        const response = await fetch('http://localhost:5001/face_login', {
          method: "POST",
          mode: "cors", 
          body: formData
        }).then((res) => {
          return res.json();
        });;

        console.log(response) */

      }, 'image/jpeg');

    }
  };

  const handleLogin = async(e) => {
    e.preventDefault();
    setIsLoading(true);

    let resultLogin;

    if(loginType == 'face') {
      runFaceMesh()
    } else if (loginType === 'password') {
      if(!e.target.elements.password.value) {
        alert('Password is required!')
      } else {
        const reqBody = {
          username: e.target.elements.username.value,
          password: e.target.elements.password.value
        }

        let basePath = process.env.NEXT_PUBLIC_API_URL;

        let headers = {
          'Accept-Encoding': 'gzip, deflate, br',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': '*',
          'Content-Type': 'application/json',
          'Connection': 'keep-alive',
          'Accept': '*/*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36',
        };

        resultLogin = await fetch(`${basePath}/login`, { headers: headers, method: 'POST', body: JSON.stringify(reqBody) }).then((res) => {
          return res.json();
        });
      }
    }

    if(!resultLogin.error) {
      const newSettings = {authorizedUser: true}
      saveSettings(newSettings)
      router.push('/dashboard');
    } else {
      alert(resultLogin.error)
    }

    setIsLoading(false);
  }

  return (
    <main className={styles.main}>
      <div className="canvas-container">
        <Webcam
          ref={webcamRef}
          style={{
            //display: 'none',
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />

        <canvas
          ref={canvasRef}
          style={{
            //display: 'none',
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 9,
            width: 640,
            height: 480,
          }}
        />
      </div>
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
          </form>
        }
      </div>
    </main>
  );
}
