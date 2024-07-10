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
        <h1>You are logged in!</h1>
      </div>

      <div className={styles.grid}>


      </div>
    </main>
  );
}
