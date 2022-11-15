<script>
    import {onMount} from "svelte";
    import "./css/alert.css"

    let target
    const close = (newElement) => {
        newElement.className = "outAnimation alert-modal"
        newElement.addEventListener("animationend", () => {
            if (newElement.parentElement === target)
                target.removeChild(newElement)
        }, {once: true})
    }

    const pushAlert = (message, type, onClick, delay = 3500) => {
        let variant
        switch (type) {
            case "success":
                variant = {color: "#03c403", icon: "done"}
                break
            case "alert":
                variant = {color: "#d97a00", icon: "warning"}
                break
            case "info":
                variant = {color: "#0095ff", icon: "info"}
                break
            default:
                variant = {color: "#ff5555", icon: "error"}
                break
        }
        alert.cache.push({
            message,
            type,
            variant
        })
        if (alert.cache.length >= 25)
            alert.cache.shift()

        alert.listeners.forEach(c => c.cb())
        if (!alert.activeAlerts)
            return

        const newElement = document.createElement("div")

        let i = 0
        while (target.children.length > 4) {
            target.removeChild(target.children[i])
            i++
        }

        target.appendChild(newElement)
        target.style.zIndex = "9999"

        setTimeout(() => close(newElement), delay)
        newElement.innerHTML = `
        <div class="alertContainer alert-modal" style="--background: ${variant.color}">
            <div class="content alert-modal">
                <div class="icon alert-modal">
                    <span data-icon="-">${variant.icon}</span>
                </div>
                ${message}
            </div>
            <button class="button alert-modal" data-action="-">
                <span data-icon="-" style="height: 1.1rem; font-size: 1.1rem">close</span>
            </button>
        </div>
      `
        if (onClick)
            newElement.addEventListener("click", onClick, {once: true})

        newElement
            .getElementsByTagName("button")[0]
            .addEventListener(
                "click",
                () => close(newElement),
                {once: true}
            )
    }
    onMount(() => {
        alert.clearCache = () => {
            alert.cache = []
            alert.listeners.forEach(e => e.cb())
        }
        alert.listeners = []
        alert.bindListener = (key, cb) => {
            alert.listeners.push({key, cb})
        }
        alert.removeListener = (key) => {
            alert.listeners = alert.listeners.filter(v => v.key !== key)
        }
        alert.cache = []
        alert.activeAlerts = true
        alert.toggleAlerts = () => {
            alert.activeAlerts = !alert.activeAlerts
        }
        alert.pushAlert = pushAlert
    })
</script>

<div bind:this={target} class="target"></div>
<style>
    .target {
        position: fixed;
        z-index: 9999;
        bottom: 4px;
        left: 50%;

        transform: translateX(-50%);
        display: grid;
        align-items: flex-end;
        justify-items: center;
        gap: 4px;
    }
</style>
