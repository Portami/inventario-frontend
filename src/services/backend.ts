import {get, HelloWorldResponse} from './api';

export const fetchHelloWorld = async (): Promise<string> => {
    try {
        let object = await get<HelloWorldResponse>('/test');
        return object.message;
    } catch (error) {
        console.error('Failed to fetch data from backend:', error);
        throw error;
    }
};
