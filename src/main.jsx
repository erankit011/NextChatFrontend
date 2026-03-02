import { createRoot } from 'react-dom/client'
import { BrowserRouter, useRouteError } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastContainer, Bounce } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import App from './App.jsx'



createRoot(document.getElementById('root')).render(
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={2500}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          limit={3}
          transition={Bounce}
          style={{ 
            fontSize: '14px',
            zIndex: 9999 
          }}
        />
      </AuthProvider>
    </BrowserRouter>
)
