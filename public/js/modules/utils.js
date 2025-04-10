export function debounce(func, wait, immediate) {
    let timeout;
    return function() {
        const context = this, args = arguments;
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

export function getUrlParam(param) {
    const urlParams = new URLSearchParams(window.location.search.toLowerCase());
    return urlParams.get(param.toLowerCase()) || '';
}