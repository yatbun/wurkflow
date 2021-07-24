// Firebase imports
import firebase from "firebase/app";

// General imports
import React, { useContext, useState, useEffect } from "react";
import { store } from "../firebase";
import { useAuth } from "./AuthContext";
import { sub } from "date-fns";

export const StoreContext = React.createContext();

export function useStore() {
    return useContext(StoreContext);
}

/**
 * @classdesc
 * A global context for the handling of firestore
 *
 * Exports all the methods for interfacing with firestore.
 *
 * @category Contexts
 * @hideconstructor
 * @component
 */
export function StoreProvider({ children }) {
    const { currentUser } = useAuth();

    // ------------------------------------------------------------------------
    // userData
    //
    // Additional data for the current user
    // ------------------------------------------------------------------------

    const [userData, setUserData] = useState(null);

    /**
     * Updates the `userData` state.
     * @returns {void}
     */
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

    /**
     * Updates the current active organisation of the user.
     * @param {string} oid The unique document ID of the new current active
     * organisation
     * @returns {void}
     */
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

    // ------------------------------------------------------------------------
    // currentOrg
    //
    // The current working organisation of the user
    // ------------------------------------------------------------------------

    const [currentOrg, setCurrentOrg] = useState(null);

    /**
     * Updates the `currentOrg` state.
     * @returns {void}
     */
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

    // ------------------------------------------------------------------------
    // Organisations
    //
    // A list of all the organisation that the current user belongs to
    // ------------------------------------------------------------------------

    const [orgs, setOrgs] = useState([]);

    /**
     * Gets the list of organisations that the user is part of and updates the
     * `orgs` state.
     *
     * @returns {void}
     */
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

    /**
     * Checks if an organistaion exists based on the given unique document ID
     * of the organistaion.
     *
     * @param {string} ouid The unique document ID of the organisation
     * @returns {void}
     */
    async function orgExistsFromUid(ouid) {
        const res = await store.collection("orgs").doc(ouid).get();
        return res.exists;
    }

    /**
     * Checks if an organisation exists based on the given ID of the
     * organisation.
     *
     * @param {string} oid The unique ID of the organisation
     * @returns {void}
     */
    async function orgExistsFromId(oid) {
        const res = await store.collection("orgs").where("id", "==", oid).get();
        return !res.empty;
    }

    /**
     * Creates a new organisation with the given unique ID and name
     *
     * @param {string} oid The unique ID of the organisation
     * @param {string} name The name of the organisation
     * @returns {string} The unique document ID of the newly created
     * organisation
     */
    async function createOrg(oid, name) {
        const res = await store.collection("orgs").add({
            id: oid,
            name: name,
        });
        return res.id;
    }

    /**
     * Makes the `currentUser` a member of the organisation provided.
     *
     * @param {string} ouid The unique document ID of the organistaion
     * @returns {void}
     */
    async function joinOrg(ouid) {
        store
            .collection("users")
            .doc(currentUser.uid)
            .update({
                orgs: firebase.firestore.FieldValue.arrayUnion(
                    store.collection("orgs").doc(ouid)
                ),
            })
            .then(() => {
                updateCurrentOrg(ouid);
            });
    }

    // ------------------------------------------------------------------------
    // Teams
    //
    // The teams that the user is part of in their current active organisation
    // ------------------------------------------------------------------------

    const [teams, setTeams] = useState([]);
    const [teamsMessage, setTeamsMessage] = useState("");
    const [teamsError, setTeamsError] = useState("");

    /**
     * Gets the list of teams that the user is part of in their current active
     * organisation, then updates the `teams` state.
     *
     * @returns {void}
     */
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

    /**
     * Removes the current user from the team provided.
     *
     * @param {string} tuid The unique document ID of the team
     * @returns {void}
     */
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

    /**
     * Adds the current user to the team provided.
     *
     * @param {string} tid The unique ID of the team
     * @returns {void}
     */
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

    /**
     * Creates a new team with the provided information.
     *
     * @param {string} id The unique ID of the team
     * @param {string} name The name of the team
     * @param {string} desc The team description
     * @returns {void}
     */
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
                    setTeamsError(
                        "A team with this ID already exists. Try another one."
                    );
                    return;
                }
            });
    }

    // ------------------------------------------------------------------------
    // Tasks
    //
    // The list of tasks belonging to the teams that is currently active for
    // the user
    // ------------------------------------------------------------------------

    const [tasks, setTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);

    /**
     * Gets the list of tasks belonging to the teams that is currently active
     * for the user and updates the `tasks` state.
     *
     * @returns {void}
     */
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
                    .where(
                        "team",
                        "==",
                        store.collection("teams").doc(team.uid)
                    )
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

    /**
     * Creates a new task with the provided information.
     *
     * @param {string} name The name of the task
     * @param {string[]} uids The users involved in the task
     * @param {string} desc The task description
     * @param {string} tuid The unique document ID of the team that the task
     * belongs to
     * @param {firebase.firestore.Timestamp} dueDate The due date of the task
     * @returns {void}
     */
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

    /**
     * Deletes the provided task.
     *
     * @param {string} tuid The unique document ID of the task
     * @returns {void}
     */
    async function deleteTask(tuid) {
        store
            .collection("tasks")
            .doc(tuid)
            .delete()
            .then(() => {
                getTasks();
            });
    }

    /**
     * Retrieves all the users belonging to the provided team.
     *
     * @param {string} tuid The unique document id of the team that belong to
     * @returns {firebase.firestore.DcoumentData[]} All users
     * the team
     */
    async function getTeamUsers(tuid) {
        const tempUsers = [];

        await store
            .collection("users")
            .where(
                "teams",
                "array-contains",
                store.collection("teams").doc(tuid)
            )
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

    /**
     * Marks the provided task as completed.
     *
     * @param {string} tuid The unique document ID of the task
     * @returns {void}
     */
    async function completeTask(tuid) {
        store
            .collection("tasks")
            .doc(tuid)
            .update({
                completed: true,
            })
            .then(() => {
                getTasks();
            });
        store
            .collection("tasks")
            .doc(tuid)
            .get()
            .then((doc) => {
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
                    store
                        .collection("workflows")
                        .doc(tempDoc.workflow.id)
                        .update({
                            currentTask:
                                firebase.firestore.FieldValue.increment(1),
                        })
                        .then(() => {
                            getTasks();
                        });
                }
            });
    }

    function updateTaskName(name, tid) {
        return store.collection("tasks").doc(tid).update({
            name: name,
        });
    }

    function updateTaskDesc(desc, tid) {
        return store.collection("tasks").doc(tid).update({
            desc: desc,
        });
    }

    function updateTaskProgress(progress, tid) {
        return store.collection("tasks").doc(tid).update({
            completed: progress,
        });
    }

    function updateTaskDueDate(dueDate, tid) {
        return store
            .collection("tasks")
            .doc(tid)
            .update({
                due: firebase.firestore.Timestamp.fromDate(dueDate),
            });
    }

    // ------------------------------------------------------------------------
    // Workflow
    //
    // ------------------------------------------------------------------------

    /**
     * Creates a new workflow template with the information provided.
     *
     * @param {string} name The name of the workflow template
     * @param {string} desc Workflow template description
     * @param {string} tuid The unique document ID of the team that the
     * workflow template belongs to
     * @param {Object[]} data List of tasks within the workflow template
     * @returns {void}
     */
    async function createWorkflowTemplate(name, desc, tuid, data) {
        for (let i = 0; i < data.length; ++i) {
            delete data[i].dueDate;
            data[i].users = data[i].users.map((user) =>
                store.collection("users").doc(user.uid)
            );
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

    /**
     * Creates a new workflow instance with the provided informattion.
     *
     * @param {string} name The name of the workflow instance
     * @param {string} desc Workflow instance description
     * @param {firebase.firestore.DocumentReference} team The team reference of
     * the team that the workflow instance belongs to
     * @param {firebase.firestore.Timestamp} dueDate The final due date of the
     * workflow instance
     * @param {Object[]} data The list of tasks within the workflow instance
     * @returns {void}
     */
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
                        newTask.nextTask = store
                            .collection("tasks")
                            .doc(lastUid);
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

    /**
     * Deletes the workflow instance that was provided and all its associated
     * tasks.
     *
     * @param {string} wuid The unique document ID of the workflow
     */
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
        updateTaskName,
        updateTaskDesc,
        updateTaskProgress,
        updateTaskDueDate,
        getTeamUsers,
        createWorkflowTemplate,
        createWorkflow,
        deleteWorkflow,
    };

    return (
        <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
    );
}
