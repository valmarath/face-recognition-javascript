'use client'
import Image from "next/image";
import { redirect } from 'next/navigation'

import { useEffect } from 'react'

import styles from "../page.module.css";
import { useSettings } from '../config/hooks/useSettings'

export default function dashboard() {
    
    const { settings, saveSettings } = useSettings();

    useEffect(() => {
        if(settings.authorizedUser == false) {
          redirect('/signin');
        }
    }, [])

  return (
    <main className={styles.main}>
      <div className={styles.description}>
        <a
          href="https://github.com/valmarath/face-recognition-login"
          target="_blank"
          rel="noopener noreferrer"
        >
          <p>
            Click here to see the project docs
          </p>
        </a>
        <div>
          <a
            href="https://github.com/valmarath"
            target="_blank"
            rel="noopener noreferrer"
          >
            By Valmarath
          </a>
        </div>
      </div>

      <div className={styles.center}>
        <Image
          className={styles.logo}
          src="/face.svg"
          alt="Next.js Logo"
          width={100}
          height={100}
          priority
        />
        <h1>Face Recognition Login</h1>
      </div>

      <div className={styles.grid}>
        <a
          href="./signin"
          className={styles.card}
          rel="noopener noreferrer"
        >
          <h2>
            Sign in <span>-&gt;</span>
          </h2>
          <p>Login with an existent user.</p>
        </a>

        <a
          href="./signup"
          className={styles.card}
          rel="noopener noreferrer"
        >
          <h2>
            Sign up <span>-&gt;</span>
          </h2>
          <p>Register a new user.</p>
        </a>

      </div>
    </main>
  );
}
