import firebase from "firebase/app";

import React, { useContext, useState, useEffect } from "react";
import { store } from "../firebase";
import { useAuth } from "./AuthContext";

const StoreContext = React.createContext();

export function useStore() {
    return useContext(StoreContext);
}

export function StoreProvider({ children }) {
    const { currentUser } = useAuth();
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);

    function getGroups() {
        if (!currentUser) {
            return;
        }

        setLoading(true);

        const promises = [];
        const grps = [];
        store
            .collection("users")
            .doc(currentUser.uid)
            .get()
            .then((doc) => {
                if (doc.exists) {
                    doc.data().groups.map((grp) => {
                        promises.push(
                            store
                                .collection("groups")
                                .doc(grp)
                                .get()
                                .then((g) => {
                                    grps.push(g.data());
                                })
                        );
                    });
                }
            })
            .finally(() => {
                Promise.all(promises).then(() => {
                    grps.sort((a, b) => {
                        const fa = a.name.toLowerCase();
                        const fb = b.name.toLowerCase();

                        if (fa < fb) {
                            return -1;
                        }
                        if (fa > fb) {
                            return 1;
                        }
                        return 0;
                    });
                    setGroups(grps);
                    setLoading(false);
                });
            });
    }

    useEffect(() => {
        getGroups();
    }, []);

    async function quitGroup(delGroup) {
        let gid = "";

        await store
            .collection("groups")
            .where("id", "==", delGroup)
            .get()
            .then((querySnapshot) => {
                gid = querySnapshot.docs[0].id;
            });

        await store
            .collection("groups")
            .doc(gid)
            .update({
                members: firebase.firestore.FieldValue.arrayRemove(currentUser.uid),
            });

        await store
            .collection("users")
            .doc(currentUser.uid)
            .update({
                groups: firebase.firestore.FieldValue.arrayRemove(gid),
            });

        getGroups();
    }

    async function joinGroup(grpId) {
        let existing = false;
        let group = null;

        // Get the group
        await store
            .collection("groups")
            .where("id", "==", grpId)
            .get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    existing = true;
                    group = querySnapshot.docs[0];
                }
            });

        // Check if group exists
        if (!existing) {
            return;
        }

        await store
            .collection("groups")
            .doc(group.id)
            .update({
                members: firebase.firestore.FieldValue.arrayUnion(currentUser.uid),
            });

        await store
            .collection("users")
            .doc(currentUser.uid)
            .update({
                groups: firebase.firestore.FieldValue.arrayUnion(group.id),
            });

        getGroups();
    }

    const value = {
        groups,
        quitGroup,
        joinGroup,
    };

    return <StoreContext.Provider value={value}>{!loading && children}</StoreContext.Provider>;
}
