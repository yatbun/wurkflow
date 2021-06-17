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

    // -------------------------
    // Manages the user document

    const [userData, setUserData] = useState(null);

    async function getUserData() {
        if (!currentUser) {
            setUserData(null);
            return;
        }

        store
            .collection("users")
            .doc(currentUser.uid)
            .get()
            .then((doc) => {
                setUserData(doc.data());
            });
    }

    async function updateCurrentOrg(oid) {
        store
            .collection("users")
            .doc(currentUser.uid)
            .update({
                currentOrg: store.collection("orgs").doc(oid),
            })
            .then(() => {
                getUserData();
            });
    }

    const [currentOrg, setCurrentOrg] = useState(null);

    async function getCurrentOrg() {
        if (userData) {
            userData.currentOrg.get().then((doc) => {
                const temp = doc.data();
                temp.uid = doc.id;
                temp.ref = store.doc(doc.ref.path);
                setCurrentOrg(temp);
            });
        }
    }

    // -----------------------------------------
    // Gets the list of orgs that the user is in

    const [orgs, setOrgs] = useState([]);

    async function getOrgs() {
        if (userData === null) {
            setOrgs([]);
            return;
        }

        const tempOrgs = [];

        userData.orgs.forEach((o) => {
            o.get().then((doc) => {
                const temp = doc.data();
                temp.uid = doc.id;
                tempOrgs.push(temp);
            });
        });

        setOrgs(tempOrgs);
    }

    async function orgExistsFromUid(uid) {
        const res = await store.collection("orgs").doc(uid).get();
        return res.exists;
    }

    async function orgExistsFromId(oid) {
        const res = await store.collection("orgs").where("id", "==", oid).get();
        return !res.empty;
    }

    async function createOrg(oid, name) {
        const res = await store.collection("orgs").add({
            id: oid,
            name: name,
        });
        return res.id;
    }

    async function joinOrg(ouid) {
        store
            .collection("users")
            .doc(currentUser.uid)
            .update({
                orgs: firebase.firestore.FieldValue.arrayUnion(store.collection("orgs").doc(ouid)),
            })
            .then(() => {
                updateCurrentOrg(ouid);
            });
    }

    // -----------------------------------------
    // Get the list of teams that the user is in
    // Note: Only the teams in the currentOrg

    const [teams, setTeams] = useState([]);
    const [teamsMessage, setTeamsMessage] = useState("");
    const [teamsError, setTeamsError] = useState("");

    async function getTeams() {
        if (userData === null || userData.teams === undefined) {
            setTeams([]);
            return;
        }

        const promises = [];
        const tempTeams = [];

        userData.teams.forEach((t) => {
            promises.push(
                t.get().then((doc) => {
                    if (doc.data().org.id === userData.currentOrg.id) {
                        const temp = doc.data();
                        temp.uid = doc.id;
                        tempTeams.push(temp);
                    }
                })
            );
        });

        Promise.all(promises).then(() => {
            tempTeams.sort((a, b) => {
                const na = a.name;
                const nb = b.name;

                if (na < nb) {
                    return -1;
                }
                if (na > nb) {
                    return 1;
                }
                return 0;
            });

            setTeams(tempTeams);
        });
    }

    async function quitTeam(tuid) {
        setTeamsMessage("");
        setTeamsError("");

        const tempTeam = store.collection("teams").doc(tuid);

        store
            .collection("users")
            .doc(currentUser.uid)
            .update({
                teams: firebase.firestore.FieldValue.arrayRemove(tempTeam),
            })
            .then(() => {
                getUserData();
            })
            .catch((e) => {
                setTeamsError(e);
            });

        setTeamsMessage("Successfully quit team.");
    }

    async function joinTeam(tid) {
        setTeamsMessage("");
        setTeamsError("");

        store
            .collection("teams")
            .where("id", "==", tid)
            .get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    setTeamsError("No team with such ID exists.");
                    return;
                } else {
                    store
                        .collection("users")
                        .doc(currentUser.uid)
                        .update({
                            teams: firebase.firestore.FieldValue.arrayUnion(
                                store.doc(querySnapshot.docs[0].ref.path)
                            ),
                        })
                        .then(() => {
                            getUserData();
                        });
                }
            });
    }

    async function createTeam(id, name, desc) {
        setTeamsMessage("");
        setTeamsError("");

        store
            .collection("teams")
            .where("id", "==", id)
            .get()
            .then((querySnapshot) => {
                if (querySnapshot.empty) {
                    // Create new team
                    const newTeam = {
                        id: id,
                        name: name,
                        desc: desc,
                        org: currentOrg.ref,
                    };
                    store
                        .collection("teams")
                        .add(newTeam)
                        .then(() => {
                            joinTeam(id);
                        });
                } else {
                    setTeamsError("A team with this ID already exists. Try another one.");
                    return;
                }
            });
    }

    // -------------------------------------------
    // Gets the list of tasks for the user's teams

    const [tasks, setTasks] = useState([]);

    async function getTasks() {
        if (teams.length === 0) {
            setTasks([]);
            return;
        }

        const promises = [];
        const allTasks = [];

        for (const team of teams) {
            promises.push(
                store
                    .collection("tasks")
                    .where("team", "==", store.collection("teams").doc(team.uid))
                    .get()
                    .then((querySnapshot) => {
                        if (!querySnapshot.empty) {
                            querySnapshot.forEach((doc) => {
                                const newTask = doc.data();
                                newTask.uid = doc.id;
                                newTask.teamName = team.name;
                                newTask.dueDate = newTask.due.toDate();

                                allTasks.push(newTask);
                            });
                        }
                    })
            );
        }

        let completedTasks = [];
        let incompleteTasks = [];

        Promise.all(promises).then(() => {
            completedTasks = allTasks.filter((arr) => {
                return arr.completed === true;
            });

            if (completeTask.length < allTasks.length) {
                incompleteTasks = allTasks.filter((arr) => {
                    return arr.completed === false;
                });
            }

            if (incompleteTasks.length > 0) {
                incompleteTasks.sort((a, b) => {
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
            }
            const combinedTasks = incompleteTasks.concat(completedTasks);

            setTasks(combinedTasks);
        });
    }

    function createTask(name, users, desc, tuid, dueDate) {
        const refUsers = [];

        users.forEach((id) => {
            refUsers.push(store.collection("users").doc(id));
        });

        const newTask = {
            name: name,
            users: refUsers,
            desc: desc,
            team: store.collection("teams").doc(tuid),
            due: firebase.firestore.Timestamp.fromDate(dueDate),
            completed: false,
            creator: store.collection("users").doc(currentUser.uid),
        };

        store
            .collection("tasks")
            .add(newTask)
            .then(() => {
                getTasks();
            });
    }

    function deleteTask(tuid) {
        store
            .collection("tasks")
            .doc(tuid)
            .delete()
            .then(() => {
                getTasks();
            });
    }

    // Retrieves the names of the users involved in the team specificed with the input team uid
    // Used in Tasks.js
    function getUsers(tuid) {
        const userNames = [];
        store
            .collection("users")
            .where("teams", "array-contains-any", [store.collection("teams").doc(tuid)])
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    let userName;
                    store
                        .collection("users")
                        .doc(doc.id)
                        .get()
                        .then((doc) => {
                            userName = doc.data().name;
                            userNames.push({
                                label: userName,
                                value: doc.id,
                            });
                        });
                });
            });
        return userNames;
    }

    const [userNames, setUserNames] = useState([]);

    // Retrieves the names of the users involved in a task specified by the task uid
    // Used in TaskDetails.js
    function getNames(tuid) {
        const names = [];
        store
            .collection("tasks")
            .doc(tuid)
            .get()
            .then((doc) => {
                const creatorId = doc.data().creator.id;
                const refArray = [];
                refArray.push(creatorId);
                doc.data().users.forEach((query) => {
                    refArray.push(query.id);
                });

                refArray.forEach((id, index) => {
                    if (index > 0 && id === creatorId) {
                    } else {
                        store
                            .collection("users")
                            .doc(id)
                            .get()
                            .then((doc) => {
                                names.push(doc.data().name);
                            });
                    }
                });
            });

        setUserNames(names);
    }

    // Updates the "field" of the task (specified by the task uid) in firestore to be true
    // Used in Tasks.js
    function completeTask(tuid) {
        store
            .collection("tasks")
            .doc(tuid)
            .update({
                completed: true,
            })
            .then(() => {
                getTasks();
            });
    }

    useEffect(() => {
        getUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    useEffect(() => {
        getCurrentOrg();
        getOrgs();
        getTeams();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userData]);

    useEffect(() => {
        getTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teams]);

    const value = {
        userData,
        currentOrg,
        orgs,
        orgExistsFromUid,
        orgExistsFromId,
        createOrg,
        joinOrg,
        updateCurrentOrg,
        teams,
        teamsMessage,
        teamsError,
        quitTeam,
        joinTeam,
        createTeam,
        tasks,
        createTask,
        deleteTask,
        completeTask,
        getUsers,
        getNames,
        userNames,
    };

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
