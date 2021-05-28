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
    const [groupError, setGroupError] = useState("");

    function getGroups() {
        if (!currentUser) {
            setGroups([]);
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
                    doc.data().groups.forEach((grp) => {
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(getGroups, [currentUser]);

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
        setGroupError("");

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
            setGroupError("No group with such ID exists!");
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

    async function createGroup(id, name, desc) {
        setGroupError("");
        let existing = false;

        await store
            .collection("groups")
            .where("id", "==", id)
            .get()
            .then((querySnapshot) => {
                if (!querySnapshot.empty) {
                    existing = true;
                }
            });

        if (existing) {
            setGroupError("A team with this ID already exists. Try another one.");
            return;
        }

        const newGroup = {
            id: id,
            name: name,
            desc: desc,
            members: [],
        };

        store
            .collection("groups")
            .add(newGroup)
            .then(() => {
                joinGroup(id);
            })
            .catch(() => {
                setGroupError("Failed to create new group.");
            });
    }

    const value = {
        groups,
        groupError,
        quitGroup,
        joinGroup,
        createGroup,
    };

    return <StoreContext.Provider value={value}>{!loading && children}</StoreContext.Provider>;
}
