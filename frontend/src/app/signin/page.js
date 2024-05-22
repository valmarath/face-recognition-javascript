'use client'
import { useState, useEffect } from 'react';

import Image from "next/image";
import { useRouter } from 'next/navigation';

import { useSettings } from '../config/hooks/useSettings'

import styles from "../page.module.css";

export default function signin() {

  const router = useRouter();
  const { settings, saveSettings } = useSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [loginType, setLoginType] = useState('');

  const handleLogin = async(e) => {
    e.preventDefault();
    setIsLoading(true);

    let resultLogin;

    if(loginType == 'face') {
      console.log('face')
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
