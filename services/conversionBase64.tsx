import base64 from 'react-native-base64';

export function conversion(data: any){
    const base64Data = base64.encode(data);
    return base64Data;
}