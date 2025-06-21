import { Keyboard, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'

const useKeyboard = () => {
    const [keyboardOpen, setKeyboardOpen] = useState(false)
     useEffect(() => {
              const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
                console.log("Hell0 open")
                setKeyboardOpen(true)
              });
              const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
                console.log("close")
                setKeyboardOpen(false)
              });
          
              return () => {
                showSubscription.remove();
                hideSubscription.remove();
              };
            }, []);
    
  return {
    keyboardOpen
  }
}

export default useKeyboard

const styles = StyleSheet.create({})