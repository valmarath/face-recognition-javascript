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

  const handleLogin = (e) => {
    e.preventDefault();
    setIsLoading(true);
    if(loginType == 'face') {
      console.log('face')
    } else if (loginType === 'password') {
      if(!e.target.elements.password.value) {
        console.log('sem senha')
      }
    }

    if(true) {
      const newSettings = {authorizedUser: true}
      saveSettings(newSettings)
    }

    setIsLoading(false);

    router.push('/dashboard');
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
