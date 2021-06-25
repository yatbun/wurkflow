// General imports
import React, { useContext, useState, useEffect } from "react";
import firebase, { auth, store } from "../firebase";

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

/**
 * @classdesc
 * A global context for the handling of authentication.
 *
 * Exports all the methods for authenticating and interfacing with firebase.
 *
 * Exports `CurrentUser` of type `firebase.auth.UserCredential`.
 *
 * @category Contexts
 * @hideconstructor
 * @component
 */
export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState();
    const [loading, setLoading] = useState(true);

    /**
     * Creates a new user account with the provided information and adds the user to
     * the provided organisation.
     *
     * @param {string} name The display name of the user
     * @param {string} email The email address of the user
     * @param {string} password The password used by the user
     * @param {string} ouid The unique document ID of the organisation to add the user to
     * @returns {Promise<firebase.auth.UserCredential>} The user credentials
     */
    function signup(name, email, password, ouid) {
        return auth.createUserWithEmailAndPassword(email, password).then(() => {
            const user = firebase.auth().currentUser;

            const o = store.collection("orgs").doc(ouid);

            store
                .collection("users")
                .doc(user.uid)
                .set({ currentOrg: o, orgs: [o], teams: [] });

            return user.updateProfile({
                displayName: name,
            });
        });
    }

    /**
     * Creates a new user account with the provided information and make it the owner of the organisation.
     * Used in the cases when the user creates an organisation on sign up.
     *
     * @param {string} name The display name of the user
     * @param {string} email The email address of the user
     * @param {string} password The password used by the user
     * @param {string} ouid The uniuqe ID of the organisation to make the user the owner of
     * @returns {Promise<firebase.auth.UserCredential>} The user credentials
     */
    function signupMakeAdmin(name, email, password, ouid) {
        return auth.createUserWithEmailAndPassword(email, password).then(() => {
            const user = firebase.auth().currentUser;

            const o = store.collection("orgs").doc(ouid);

            store
                .collection("users")
                .doc(user.uid)
                .set({ currentOrg: o, orgAdmin: o, orgs: [o], teams: [] });

            return user.updateProfile({
                displayName: name,
            });
        });
    }

    /**
     * Logs in the user using the provided email and password.
     * @param {string} email The email address of the user
     * @param {string} password The password of the user
     * @returns {Promise<firebase.auth.UserCredential>} The user credentials
     */
    function login(email, password) {
        return auth.signInWithEmailAndPassword(email, password);
    }

    /**
     * Logs out the current user.
     *
     * @returns {void}
     */
    function logout() {
        return auth.signOut();
    }

    /**
     * Sends a reset password link to the provided email if an account is associated
     * with the email.
     *
     * @param {string} email The email address to send the password reset link to
     * @returns {void}
     */
    function resetPassword(email) {
        return auth.sendPasswordResetEmail(email);
    }

    /**
     * Updates the currentUser's email to the one provided.
     *
     * @param {string} email The new email address to be updated to
     * @returns {void}
     */
    function updateEmail(email) {
        return currentUser.updateEmail(email);
    }

    /**
     * Update the currentUser's password to the one provided.
     * @param {string} password The new password to be updated to
     * @returns {void}
     */
    function updatePassword(password) {
        return currentUser.updatePassword(password);
    }

    /**
     * Update the currentUser's displayName to the one provided.
     * @param {string} name The new name to be updated to
     * @returns {void}
     */
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
        signupMakeAdmin,
        login,
        logout,
        resetPassword,
        updateEmail,
        updatePassword,
        updateName,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
