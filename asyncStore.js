import AsyncStorage from '@react-native-async-storage/async-storage';
export const storeData = async (value) => {
    try {
        await AsyncStorage.setItem('my-key', value);
    } catch (e) {
        // saving error
        console.log(e);
        return;
    }
};
export const getData = async () => {
    try {
        const value = await AsyncStorage.getItem('my-key');
        if (value !== null) {
            // value previously stored
            return value;
        }else{return;}
        
    } catch (e) {
        // error reading value
        console.log(e);
        return;
    }
};