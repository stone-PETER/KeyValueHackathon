import React, { useState, createContext, useContext } from "react";
import { auth } from "../firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // Firebase user
  const [admin, setAdmin] = useState(null); // Admin email
  const [isAdmin, setIsAdmin] = useState(false); // <-- Add this line
  const [loading, setLoading] = useState(true); // Loading state

  // Check auth state on mount
  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setIsAdmin(false); // Reset admin status on user login
        setLoading(false);
      } else {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // When admin logs in, set isAdmin true
  const handleSetAdmin = (email) => {
    setAdmin(email);
    setIsAdmin(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        admin,
        setAdmin: handleSetAdmin,
        isAdmin,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

// No context needed for this split auth page

// Main Auth Page
const Authentication = () => {
  const [mode, setMode] = useState("user"); // "user" or "admin"
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mb-8 flex gap-4">
        <button
          className={`px-6 py-2 rounded-lg font-semibold shadow ${
            mode === "user"
              ? "bg-blue-600 text-white"
              : "bg-white text-blue-600 border border-blue-600"
          }`}
          onClick={() => setMode("user")}
        >
          User Sign In / Sign Up
        </button>
        <button
          className={`px-6 py-2 rounded-lg font-semibold shadow ${
            mode === "admin"
              ? "bg-red-600 text-white"
              : "bg-white text-red-600 border border-red-600"
          }`}
          onClick={() => setMode("admin")}
        >
          Admin Sign In
        </button>
      </div>
      {mode === "user" ? <UserAuthForm /> : <AdminAuthForm />}
    </div>
  );
};

// User Sign Up / Sign In (Firebase Auth)
function UserAuthForm() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate(); // Add this line

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccess("Account created! You can now sign in.");
        setTimeout(() => {
          setIsSignup(false);
        }, 1000);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        setSuccess("Signed in successfully!");
        setTimeout(() => navigate("/order"), 1000); // Redirect to order meals after sign in
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4 text-blue-700">
        User {isSignup ? "Sign Up" : "Sign In"}
      </h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-4 px-3 py-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 px-3 py-2 border rounded"
      />
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded mb-2"
      >
        {loading
          ? isSignup
            ? "Signing Up..."
            : "Signing In..."
          : isSignup
          ? "Sign Up"
          : "Sign In"}
      </button>
      <button
        onClick={() => setIsSignup((s) => !s)}
        className="w-full text-blue-600 underline"
      >
        {isSignup
          ? "Already have an account? Sign In"
          : "Don't have an account? Sign Up"}
      </button>
    </div>
  );
}

// Admin Sign In (Firestore admins collection)
function AdminAuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { setAdmin } = useAuth(); // <-- Add this line
  const navigate = useNavigate();

  const handleAdminSignIn = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      // Check admins collection for email and password
      const adminDoc = await getDoc(doc(db, "admins", email));
      if (!adminDoc.exists()) {
        setError("Admin not found");
      } else {
        const data = adminDoc.data();
        if (data.password === password) {
          setIsAuthenticated(true);
          setAdmin(email); // <-- Set admin context (isAdmin true)
          setSuccess("Admin signed in!");
          setTimeout(() => navigate("/dashboard"), 1000);
        } else {
          setError("Incorrect password");
        }
      }
    } catch (err) {
      setError("Error signing in as admin");
    } finally {
      setLoading(false);
    }
  };

  if (isAuthenticated) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-red-700">
          Admin Dashboard
        </h2>
        <p>Welcome, {email}!</p>
        <p className="mt-4">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
      <h2 className="text-2xl font-bold mb-4 text-red-700">Admin Sign In</h2>
      <input
        type="email"
        placeholder="Admin Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-4 px-3 py-2 border rounded"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 px-3 py-2 border rounded"
      />
      {error && <div className="text-red-600 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      <button
        onClick={handleAdminSignIn}
        disabled={loading}
        className="w-full bg-red-600 text-white py-2 rounded mb-2"
      >
        {loading ? "Signing In..." : "Sign In as Admin"}
      </button>
    </div>
  );
}

// Export main authentication page
export default Authentication;
