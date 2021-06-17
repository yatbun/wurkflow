import React, { useContext, useState, useEffect } from "react";
import firebase, { auth, store } from "../firebase";

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState();
    const [loading, setLoading] = useState(true);

    function signup(name, email, password) {
        return auth.createUserWithEmailAndPassword(email, password).then((res) => {
            const user = firebase.auth().currentUser;

            store.collection("users").doc(user.uid).set({ name: name, orgs: [], groups: [] });

            return user.updateProfile({
                displayName: name,
            });
        });
    }

    function login(email, password) {
        return auth.signInWithEmailAndPassword(email, password);
    }

    function logout() {
        return auth.signOut();
    }

    function resetPassword(email) {
        return auth.sendPasswordResetEmail(email);
    }

    function updateEmail(email) {
        return currentUser.updateEmail(email);
    }

    function updatePassword(password) {
        return currentUser.updatePassword(password);
    }

    function updateName(name) {
        return currentUser.updateProfile({
            displayName: name,
        });
    }

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        signup,
        login,
        logout,
        resetPassword,
        updateEmail,
        updatePassword,
        updateName,
    };

    return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
}
