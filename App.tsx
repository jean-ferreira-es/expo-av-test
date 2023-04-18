import { StatusBar } from 'expo-status-bar';
import { View, Pressable, Text, Alert, Button } from 'react-native';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid  } from 'expo-av';
import { useEffect, useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { styles } from './styles';

import * as FileSystem from 'expo-file-system';
import axios from 'axios';

const GCP_SPEECH_TO_TEXT_KEY = 'AIzaSyBKanvvHseuKNF8HjU4fubUkNXqSS_lREM';
const TOKEN = "VEF*1rTVIq4&z^02*dVO2gf79";

export default function App() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingFileURI, setRecordingFileURI] = useState<string | null>(null);

  const recordingOptions = {
    android: {
      extension: '.flac',
      outputFormat: Audio.AndroidOutputFormat.DEFAULT,
      audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
      // sampleRate: 44100,
      // numberOfChannels: 2,
      // bitRate: 128000,
    },
    ios: {
      extension: '.caf',
    },
    web: {}
  }
  
  useEffect(() => {
    getPermission();

    function getPermission(){
      Audio
      .requestPermissionsAsync()
      .then(({ granted }) => {
        if(granted){
          Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
            playThroughEarpieceAndroid: true
          })
        }
      })
    }
  }, []);

  async function handleRecordingStart() {
    const { granted } = await Audio.getPermissionsAsync();
    
    if(granted){
      try {
        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync(recordingOptions);
        await recording.startAsync();
        setRecording(recording);
      } catch (error) {
        Alert.alert('Erro ao gravar', 'Não possível iniciar a gravação.');
        console.error(error);
      }
    }
  }

  async function handleRecordingStop() {
    try {
      if(recording) {
        recording.stopAndUnloadAsync();
        const fileUri = recording.getURI();
        setRecordingFileURI(fileUri);
        console.log(fileUri);
        setRecording(null);
      }
    } catch (error) {
      Alert.alert('Erro ao pausar', 'Não foi possível pausar a gravação.');
    }
  }

  async function handleAudioPlay() {
    if(recordingFileURI){
      try {
        const { sound } = await Audio.Sound.createAsync({ uri: recordingFileURI }, { shouldPlay: true });
        await sound.setPositionAsync(0);
        await sound.playAsync();
        getTranscription();
      } catch (error) {
        Alert.alert('Erro ao dar play', 'Não foi possível tocar o audio');
      }
    }
  }

  async function getTranscription() {
    const base64File = await FileSystem.readAsStringAsync(recordingFileURI, { encoding: FileSystem?.EncodingType?.Base64 });
    await FileSystem.deleteAsync(recordingFileURI);

    console.log(base64File);

    try {
      const response = await axios.post('https://smart.indt.org.br:4200/transcribe', 
        { audio_base64: base64File },
        { headers: {  'x-api-token': TOKEN }}
      );

      console.log(response);
    } catch (error) {
      console.log(error);
    }

    // fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${GCP_SPEECH_TO_TEXT_KEY}`, {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     cofig: {
    //       languageCode: "pt-BR",
    //       encoding: "LINEAR16",
    //       sampleRateHertz: 41000,
    //     },
    //     audio: {
    //       content: base64File
    //     }
    //   })
    // })
    // .then(response => response.json())
    // .then((data) => {
    //   console.log(data.results[0].alternatives[0].transcript);
    //   // setDescription(data.results[0].alternatives[0].transcript);
    // })
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />

      <Pressable 
        style={[styles.button, recording && styles.recording]}
        onPressIn={() => handleRecordingStart()}
        onPressOut={() => handleRecordingStop()}
      >
        <MaterialCommunityIcons 
          name='microphone' 
          color={recording ? '#fff' :'#212121'}
          size={44} 
        />
      </Pressable>

      <Text style={styles.label}>
        {recording ? 'Gravando...': 'Gravar'}
      </Text>

      <Button
        onPress={() => handleAudioPlay()}
        title='Ouvir audio'
        disabled={!recordingFileURI}
      />
    </View>
  );
}