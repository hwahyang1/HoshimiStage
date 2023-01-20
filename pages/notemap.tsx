import { logEvent } from "firebase/analytics";
import Head from "next/head";
import { useEffect } from "react";
import Venue from "../components/live/Venue";
import { analytics } from "../src/firebase/firebase";

export default function Notemap() {
  useEffect(() => {
    logEvent(analytics, "open_notemap")
  }, [])
  return (
    <div>
      <Head>
        <title>Hoshimi Stage - Notemap</title>
      </Head>
      <div>
        <Venue />
      </div>
    </div>
  )
}
