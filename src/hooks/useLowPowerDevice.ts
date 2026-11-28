import { useSyncExternalStore } from "react";
import useIsTouchScreen from "@/hooks/useIsTouchScreen";

let cached: boolean | null = null;

function subscribe() {
    return () => {};
}

function detect(): boolean {
    if (cached !== null) return cached;
    const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
    cached =
        (nav.hardwareConcurrency ?? 8) <= 4 ||
        (nav.deviceMemory ?? 8) <= 4 ||
        nav.connection?.saveData === true ||
        isSoftwareRendering();
    return cached;
}

export default function useLowPowerDevice(): boolean {
    const touch = useIsTouchScreen();
    const weak = useSyncExternalStore(subscribe, detect, () => false);
    return touch || weak;
}

function isSoftwareRendering(): boolean {
    try {
        const gl = document.createElement("canvas").getContext("webgl");
        if (!gl) return true;
        const info = gl.getExtension("WEBGL_debug_renderer_info");
        const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
        gl.getExtension("WEBGL_lose_context")?.loseContext();
        return /swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer);
    } catch {
        return false;
    }
}
