import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Switch, FlatList, Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const SITES = [
  {name: 'Shikho', url: 'https://api.shikho.com/api/v1/otp/send', field: 'phone'},
  {name: 'Chorki', url: 'https://api.chorki.com/api/auth/send-otp', field: 'phone'},
  {name: 'Binge', url: 'https://api.binge.buzz/api/v1/auth/request-otp/', field: 'mobile'},
  {name: 'Toffee', url: 'https://api.toffeelive.com/api/v1/send-otp', field: 'mobile'},
];

export default function App() {
  const [number, setNumber] = useState('');
  const [logs, setLogs] = useState([]);
  const [isDark, setDark] = useState(Appearance.getColorScheme() === 'dark');

  useEffect(() => { fetchLogs(); }, []);

  const fetchLogs = async () => {
    const data = await AsyncStorage.getItem('logs');
    if (data) setLogs(JSON.parse(data));
  };

  const storeLog = async (entry) => {
    const updated = [entry, ...logs];
    setLogs(updated);
    await AsyncStorage.setItem('logs', JSON.stringify(updated));
  };

  const clearLogs = async () => {
    setLogs([]);
    await AsyncStorage.removeItem('logs');
  };

  const sendOTP = async () => {
    if (!/^01\d{9}$/.test(number)) return alert('১১ ডিজিটের সঠিক নাম্বার দিন।');
    for (const site of SITES) {
      try {
        await axios.post(site.url, { [site.field]: number });
        await storeLog({ number, site: site.name, result: 'OK', time: new Date().toLocaleString() });
      } catch (err) {
        await storeLog({ number, site: site.name, result: 'FAIL', time: new Date().toLocaleString() });
      }
    }
    setNumber('');
  };

  const theme = isDark ? styles.dark : styles.light;

  return (
    <View style={[styles.container, theme]}>
      <View style={styles.header}>
        <Text style={styles.title}>Api Finder</Text>
        <Switch value={isDark} onValueChange={setDark} />
      </View>

      <TextInput
        style={[styles.input, theme]}
        placeholder="01xxxxxxxxx"
        placeholderTextColor={isDark ? '#ccc' : '#888'}
        keyboardType="phone-pad"
        value={number}
        onChangeText={setNumber}
      />
      <TouchableOpacity style={styles.btn} onPress={sendOTP}>
        <Text style={styles.btnText}>🔄 Send OTP</Text>
      </TouchableOpacity>

      <View style={styles.history}>
        <Text style={styles.subtitle}>🕓 Test History</Text>
        <TouchableOpacity onPress={clearLogs}><Text style={styles.clear}>Clear</Text></TouchableOpacity>
      </View>

      <FlatList
        data={logs}
        keyExtractor={(_, i) => `${i}`}
        renderItem={({ item }) => (
          <Text style={theme}>
            {item.time} • {item.number} • {item.site} • {item.result}
          </Text>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex:1, padding:20, paddingTop:40},
  header: {flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  title: {fontSize:24, fontWeight:'bold'},
  input: {borderWidth:1,borderRadius:5,padding:10,marginTop:20},
  btn: {backgroundColor:'#4287f5',padding:15,marginTop:10,alignItems:'center',borderRadius:5},
  btnText: {color:'#fff',fontWeight:'bold'},
  history: {flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:20},
  subtitle:{fontSize:18,fontWeight:'bold'},
  clear:{color:'red'},
  light: {color:'#000',backgroundColor:'#fff'},
  dark: {color:'#fff',backgroundColor:'#333'},
});