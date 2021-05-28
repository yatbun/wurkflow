import React, { useContext, useState, useEffect } from "react";
import firebase, { store } from "../firebase";
import { useAuth } from "./AuthContext";

const FireStoreContext = React.createContext();

export function useStore() {
    return useContext(FireStoreContext);
}

export function FirestoreProvider({ children }) {
    const { currentUser } = useAuth();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);

    const groupRef = store.collection("groups");

    function getGroups() {
        setLoading(true);
        groupRef.onSnapshot((querySnapshot) => {
            const items = [];
            querySnapshot.forEach((doc) => {
                items.push(doc.data());
            });
            setSchools(items);
            setLoading(false);
        });
    }

    useEffect(() => {
        getGroups();
    });
}
