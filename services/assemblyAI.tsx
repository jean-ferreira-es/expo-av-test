import axios from 'axios';

const apiKey = '976e7a9c494044309f2b9e60f9bca932';
const endpoint = 'https://api.assemblyai.com/v2/transcript';

const headers = {
    'authorization': `Bearer ${apiKey}`,
    'content-type': 'application/json',
};

export async function speechToText(audioData: string) {
    const data = {
        'audio_url': 'data:audio/wav;base64,' + audioData,
        'auto_highlights': true,
    };

    const assembly = axios.create({
        baseURL: "https://api.assemblyai.com/v2",
        headers: {
        //   "Authorization": "c2a41970d9d811ec9d640242ac12",
            "Authorization": '976e7a9c494044309f2b9e60f9bca932',
            "Content-Type": "application/json"
        }
      });
    
    try {
        const response = await axios.post("/transcript", data);
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}