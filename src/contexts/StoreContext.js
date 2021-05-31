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
    const [groupNameToUidMap, setGroupNameToUidMap] = useState(new Map());
    const [groupLoading, setGroupLoading] = useState(false);
    const [groupError, setGroupError] = useState("");

    async function getGroups() {
        if (!currentUser) {
            setGroups([]);
            setGroupNameToUidMap(new Map());
            return;
        }

        setGroupLoading(true);

        const promises = [];
        const grps = [];
        const groupMap = new Map();
        await store
            .collection("users")
            .doc(currentUser.uid)
            .get()
            .then((doc) => {
                doc.data().groups.forEach((grp) => {
                    promises.push(
                        store
                            .collection("groups")
                            .doc(grp)
                            .get()
                            .then((g) => {
                                const newGroup = g.data();
                                newGroup.uid = g.id;
                                groupMap.set(newGroup.name, newGroup.uid);
                                grps.push(newGroup);
                            })
                    );
                });
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
                    setGroupNameToUidMap(groupMap);
                    setGroupLoading(false);
                });
            });
    }

    async function quitGroup(gid) {
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

    const [tasks, setTasks] = useState([]);
    const [taskLoading, setTaskLoading] = useState(false);

    async function getTasks() {
        if (!currentUser) {
            setTasks([]);
            return;
        }

        setTaskLoading(true);

        const tsks = [];

        for (const group of groups) {
            await store
                .collection("tasks")
                .where("group", "==", group.uid)
                .get()
                .then((querySnapshot) => {
                    if (!querySnapshot.empty) {
                        const tempTask = querySnapshot.docs[0];
                        const newTask = tempTask.data();

                        newTask.uid = tempTask.id;
                        newTask.groupName = group.name;
                        newTask.dueDate = tempTask.data().due.toDate();

                        tsks.push(newTask);
                    }
                })
                .finally(() => {
                    tsks.sort((a, b) => {
                        const da = a.dueDate;
                        const db = b.dueDate;

                        if (da < db) {
                            return -1;
                        }
                        if (da > db) {
                            return 1;
                        }
                        return 0;
                    });
                });
        }

        setTasks(tsks);
        setTaskLoading(false);
    }

    function createTask(name, desc, group, dueDate) {
        const newTask = {
            name: name,
            desc: desc,
            group: groupNameToUidMap.get(group),
            due: firebase.firestore.Timestamp.fromDate(dueDate),
            completed: false,
        };

        store
            .collection("tasks")
            .add(newTask)
            .then(() => {
                getTasks();
            });
    }

    function deleteTask(task) {
        store
            .collection("tasks")
            .doc(task)
            .delete()
            .then(() => {
                getTasks();
            });
    }

    useEffect(() => {
        getGroups();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        getGroups();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    useEffect(() => {
        getTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groups]);

    const value = {
        groups,
        groupError,
        quitGroup,
        joinGroup,
        createGroup,
        tasks,
        createTask,
        deleteTask,
    };

    return (
        <StoreContext.Provider value={value}>
            {!groupLoading && !taskLoading && children}
        </StoreContext.Provider>
    );
}
