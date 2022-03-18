import { useEffect, useRef } from 'react';

const useInterval = (callback: any, delay: null | number) => {
    const savedCallback = useRef<any>();

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        const tick = () => savedCallback.current();

        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

export default useInterval;