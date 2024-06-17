import React, { useState, useEffect } from 'react'

import { Alert, StyleSheet, View } from 'react-native';
import { Text, TextInput, Button, } from 'react-native-paper';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import FirebaseConfig from '../firebaseConfig';
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { addDoc, collection, setDoc, doc, getDoc, getDocs } from 'firebase/firestore'
import { FIRESTORE_DB } from '../firebaseConfig';

export default function Login({ navigation }) {
  useEffect(() => {
    AsyncStorage.getItem("user-login-object")
      .then(result => {
        user = JSON.parse(result);
        console.log(user);
        if (JSON.parse(result)) {
          LocalAuthentication.authenticateAsync({ promptMessage: "Scan your Biometrics to continue" })
            .then(biometrics => {
              if (biometrics.success) {
                signInWithEmailAndPassword(FirebaseConfig.auth, user.email, user.password)
                  .then((userCredentials) => {
                    const user = userCredentials;
                    AsyncStorage.setItem('user', JSON.parse(user))
                    AsyncStorage.setItem('user-login-object', JSON.stringify({ email, password }));
                    const DocRef = doc(FIRESTORE_DB, "Users", user.user.uid);
                    const docSnap = (getDoc(DocRef));
                    if (docSnap.exists()) {
                      console.log(docSnap.data());
                    } else {
                      Alert.alert('User role not in DB')
                    }
                  })
                  .catch((error) => {
                    console.log(error.code + " : " + error.message);
                  })
              }
            })
            .catch(err => {
              console.error(err);
            })
        } else {

        }
      })
      .catch(err => {
        console.error(err);
      })

  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogIn = async () => {
    //login user 
    signInWithEmailAndPassword(FirebaseConfig.auth, email, password)
      .then((userCredentials) => {
        const user = userCredentials;
        AsyncStorage.setItem('user', JSON.stringify(user));
        AsyncStorage.setItem('user-login-object', JSON.stringify({ email, password }));
        const DocRef = doc(FIRESTORE_DB, "Users", user.user.uid);
        getDoc(DocRef)
          .then(data=>{
            let user_role = data.data().role;
            if (user_role == 'client'){
              navigation.replace('CustomerHomepage')
            }else if (user_role == 'worker'){
              navigation.replace('WorkerHomepage')
            }
          })
          .catch(err=>{
            console.error(err)
          })

      })
      .catch((error) => {
        console.log(error.code + " : " + error.message);
      })
  };

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <Text>
          Login to your Account
        </Text>
      </View>
      <TextInput
        style={{ ...styles.input, backgroundColor: "white" }}
        value={email}
        label='email'
        onChangeText={(text) => setEmail(text)}
      />

      <TextInput
        style={{ ...styles.input, backgroundColor: "white" }}
        value={password}
        label='password'
        onChangeText={(text) => setPassword(text)}
        secureTextEntry={true}
      />

      <Button mode='contained' style={styles.input} onPress={() => handleLogIn()} > Login </Button>
      <Button style={styles.input} onPress={() => navigation.push('RegisterScreen')}> Register </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", marginHorizontal: 30 },
  input: { marginVertical: 5, borderRadius: 0 },
  row: {
    alignItems: "center",
    flexDirection: "row",
    marginVertical: 20,
    justifyContent: "space-between",
  },
  textContainer: { alignContent: 'center', alignItems: 'center' }

});