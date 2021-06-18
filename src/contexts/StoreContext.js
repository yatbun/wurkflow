import firebase from "firebase/app";

import React, { useContext, useState, useEffect } from "react";
import { store } from "../firebase";
import { useAuth } from "./AuthContext";
import { sub } from "date-fns";

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
    const [completedTasks, setCompletedTasks] = useState([]);

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
                    .where("hidden", "==", false)
                    .where(
                        "users",
                        "array-contains",
                        store.collection("users").doc(currentUser.uid)
                    )
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

        Promise.all(promises).then(() => {
            allTasks.sort((a, b) => {
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
            setTasks(allTasks.filter((task) => !task.completed));
            setCompletedTasks(allTasks.filter((task) => task.completed));
        });
    }

    async function createTask(name, uids, desc, tuid, dueDate) {
        const userRefs = uids.map((uid) => store.collection("users").doc(uid));

        const newTask = {
            name: name,
            users: userRefs,
            desc: desc,
            team: store.collection("teams").doc(tuid),
            due: firebase.firestore.Timestamp.fromDate(dueDate),
            completed: false,
            hidden: false,
            creator: store.collection("users").doc(currentUser.uid),
        };

        store
            .collection("tasks")
            .add(newTask)
            .then(() => {
                getTasks();
            });
    }

    async function deleteTask(tuid) {
        store
            .collection("tasks")
            .doc(tuid)
            .delete()
            .then(() => {
                getTasks();
            });
    }

    async function getTeamUsers(tuid) {
        const tempUsers = [];

        await store
            .collection("users")
            .where("teams", "array-contains", store.collection("teams").doc(tuid))
            .get()
            .then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    const tempUser = doc.data();
                    tempUser.uid = doc.id;
                    tempUsers.push(tempUser);
                });
            });
        return tempUsers;
    }

    async function completeTask(tuid) {
        store
            .collection("tasks")
            .doc(tuid)
            .get()
            .then((doc) => {
                store.collection("tasks").doc(tuid).update({
                    completed: true,
                });

                const tempDoc = doc.data();

                if (tempDoc.workflow) {
                    if (tempDoc.nextTask) {
                        store
                            .collection("tasks")
                            .doc(tempDoc.nextTask.id)
                            .update({
                                hidden: false,
                            })
                            .then(() => {
                                getTasks();
                            });
                    }
                    getTasks();
                }

                store
                    .collection("workflows")
                    .doc(tempDoc.workflow.id)
                    .update({
                        currentTask: firebase.firestore.FieldValue.increment(1),
                    });
            })
            .then(() => {
                getTasks();
            });
    }

    async function createWorkflowTemplate(name, desc, tuid, data) {
        for (let i = 0; i < data.length; ++i) {
            delete data[i].dueDate;
            data[i].users = data[i].users.map((user) => store.collection("users").doc(user.uid));
        }

        await store
            .collection("teams")
            .doc(tuid)
            .get()
            .then(async (doc) => {
                const newTemplate = {
                    name: doc.data().name + ": " + name,
                    desc: desc,
                    team: store.collection("teams").doc(tuid),
                    data: data,
                    creator: store.collection("users").doc(currentUser.uid),
                };

                await store.collection("wfTemplates").add(newTemplate);
            });
    }

    async function createWorkflow(name, desc, team, dueDate, data) {
        const newTemplate = {
            currentTask: 1,
            desc: desc,
            length: data.length,
            name: name,
            creator: store.collection("users").doc(currentUser.uid),
            team: team,
        };

        let lastUid = "";

        await store
            .collection("workflows")
            .add(newTemplate)
            .then(async (docRef) => {
                for (let i = data.length; i > 0; --i) {
                    const task = data[i - 1];

                    const newTask = {
                        completed: false,
                        hidden: i === 1 ? false : true,
                        desc: task.desc,
                        due: firebase.firestore.Timestamp.fromDate(
                            sub(dueDate, { days: task.daysBefore })
                        ),
                        name: task.name,
                        order: i,
                        team: team,
                        users: task.users,
                        creator: store.collection("users").doc(currentUser.uid),
                        workflow: store.collection("workflows").doc(docRef.id),
                    };

                    if (lastUid !== "") {
                        newTask.nextTask = store.collection("tasks").doc(lastUid);
                    }

                    await store
                        .collection("tasks")
                        .add(newTask)
                        .then((docRef) => {
                            lastUid = docRef.id;
                        });
                }
            })
            .finally(() => {
                getTasks();
            });
    }

    async function deleteWorkflow(wuid) {
        var batch = store.batch();

        store
            .collection("tasks")
            .where("workflow", "==", store.collection("workflows").doc(wuid))
            .get()
            .then((querySnapshot) => {
                querySnapshot.docs.forEach((doc) => {
                    batch.delete(store.collection("tasks").doc(doc.id));
                });
            })
            .finally(() => {
                batch.commit();
            });

        store.collection("workflows").doc(wuid).delete();
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
        completedTasks,
        createTask,
        deleteTask,
        completeTask,
        getTeamUsers,
        createWorkflowTemplate,
        createWorkflow,
        deleteWorkflow,
    };

    return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
