import { useSyncExternalStore } from "react";
const QUERY = "(hover: none)";

function subscribe(callback: () => void) {
    const media = window.matchMedia(QUERY);
    media.addEventListener("change", callback);
    return () => media.removeEventListener("change", callback);
}

export default function useIsTouchScreen(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(QUERY).matches,
        () => false,
    );
}
