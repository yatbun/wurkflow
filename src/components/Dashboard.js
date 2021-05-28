import { useStore } from "../contexts/StoreContext";

export default function Dashboard() {
    const { groups } = useStore();
    return (
        <>
            <div className="d-flex">
                <p>Testing Testing Hello</p>
            </div>
        </>
    );
}
