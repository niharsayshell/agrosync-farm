import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import AgroSync from './App.jsx'
import { onAuthChange, getCurrentUser } from './firebase.js'

function Root() {
  const [authReady, setAuthReady] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthChange((user) => {
      setFirebaseUser(user);
      setAuthReady(true);
    });
    return unsub;
  }, []);

  // Show minimal loading while Firebase checks auth state
  if (!authReady) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#080E0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: "linear-gradient(135deg, #4ADE80, #22C55E)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: 24
          }}>🌿</div>
          <div style={{ color: "#5F8A6A", fontSize: 14 }}>Loading AgroSync...</div>
        </div>
      </div>
    );
  }

  return <AgroSync firebaseUser={firebaseUser} />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)
